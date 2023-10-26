"use strict";

const Store = require("../store/store.model");
const Product = require("../product/product.model");
const Reload = require("./reload.model");
const cron = require("node-cron");
const EventEmitter = require("events");
const event = new EventEmitter();
const axios = require("axios");
const { convert } = require("html-to-text");
const { stripPrefix } = require("xml2js").processors;
const xml2js = require("xml2js");
const { createProducts } = require("../product/product.controller");
let flag = false;
let waiting = false;

// Obtener los productos del xml
const getProducts = async (xml) => {
  try {
    const { data } = await axios.get(`${xml}`);
    const parser = new xml2js.Parser({
      tagNameProcessors: [stripPrefix],
      explicitRoot: false,
      normalizeTags: true,
    });
    const { channel } = await parser.parseStringPromise(data);
    const { item } = channel[0];
    return item;
  } catch (err) {
    return console.log(err);
  }
};

// Agregar productos que estan en el xml y no en la base de datos
const addProducts = async (xml, storeId) => {
  try {
    for (const item of xml) {
      const sku = item.id && item.id[0];
      const product = await Product.findOne({ idProduct: sku });
      if (product) continue;
      createProducts(item, storeId);
    }
  } catch (err) {
    return console.log(err);
  }
};

// Actualizar productos que esten en xml y base de datos
const updateProducts = async (xml) => {
  try {
    for (const item of xml) {
      const product = {
        idProduct: item.id && item.id[0],
        urlProduct: item.link && item.link[0],
        name: item.title && convert(item.title[0]),
        description: item.description && convert(item.description[0]),
        price: item.price && item.price[0],
        salePrice: item["sale_price"] ? item["sale_price"][0] : "",
        saleEndDate: item["sale_end_date"] ? item["sale_end_date"][0] : "",
        saleStartDate: item["sale_start_date"]
          ? item["sale_start_date"][0]
          : "",
        tags:
          item["product_type"] &&
          item["product_type"].join(";").replace(/&gt/g, "").split(";"),
        stock: item["product_type"] && item.availability[0],
        quantity: item.quantity ? item.quantity[0] : "",
        image: item["image_link"] && item["image_link"][0],
      };
      const keys = Object.keys(product);
      let stop = false;
      for (const key of keys) {
        const value = product[key];
        if (value == undefined || typeof value == "undefined") stop = true;
      }
      if (stop) continue;
      if (product.stock == "in_stock" || product.stock == "in stock")
        product.stock = "Disponible";
      if (product.stock == "out of stock" || product.stock == "out_of_stock")
        product.stock = "Agotado";

      if (product.quantity) {
        if (product.quantity > 0 && product.quantity <= 5)
          product.stock = "Casi agotado";
        else if (product.quantity > 5) product.stock = "Disponible";
        else product.stock = "Agotado";
      }
      product.tags = product.tags.map((item) => item.trim());
      await Product.findOneAndUpdate(
        { idProduct: product.idProduct },
        product,
        {
          new: true,
        }
      );
    }
  } catch (err) {
    return console.log(err);
  }
};

// Eliminar productos que esten en la base de datos y no en el xml
const deleteProducts = async (xml, storeId) => {
  try {
    // Traer los productos de la base de datos
    const products = await Product.find({ storeId: storeId });
    // Eliminar si está en la base de datos y no en el xml
    for (const product of products) {
      let exists = false;
      for (const item of xml) {
        const { idProduct } = product;
        const sku = item.id && item.id[0];
        if (idProduct != sku) continue;
        exists = true;
        break;
      }
      if (exists) continue;
      await Product.findOneAndDelete({ _id: product._id });
    }
  } catch (err) {
    return console.log(err);
  }
};

// Actualizar tiendas
const updateStores = async () => {
  try {
    flag = true;
    const stores = await Reload.find({});
    if (stores.length == 0) return;
    for (const store of stores) {
      const data = { storeId: store.storeId, xml: store.xml };
      const xml = await getProducts(store.xml);
      deleteProducts(xml, store.storeId);
      updateProducts(xml);
      addProducts(xml, store.storeId);
      await Reload.findOneAndDelete(data);
    }
    flag = false;
    if (waiting) event.emit("finished", flag);
    return console.log("Stores updated successfully");
  } catch (err) {
    return console.log(err);
  }
};

const waitFunction = () => {
  waiting = true;
  event.on("finished", () => {
    waiting = false;
    updateStores();
  });
};

// Agregar tiendas a la cola automaticamente
const addStoresAutomatic = async () => {
  try {
    const stores = await Store.find({ state: "ACTIVA" });
    if (stores.length == 0) return;
    for (const store of stores) {
      const data = {
        storeId: store._id,
        xml: store.xml,
      };
      const alreadyStore = await Reload.findOne(data);
      if (alreadyStore) continue;
      const newReload = new Reload(data);
      await newReload.save();
    }
    updateStores();
    return;
  } catch (err) {
    return console.log(err);
  }
};

// Comerciante puede agregar su feed a la cola si está activa
exports.addToReaload = async (req, res) => {
  try {
    const { storeId, xml } = req.body;
    if (storeId == undefined || xml == undefined)
      return res
        .status(400)
        .send({ message: "Algunos parametros son requeridos" });
    const store = await Store.findOne({ _id: storeId, xml: xml });
    if (!store)
      return res.status(404).send({ message: "Tienda no encontrada" });
    if (store.state != "ACTIVA")
      return res.status(400).send({ message: "Tienda no activada" });
    const alreadyStore = await Reload.findOne({ storeId: storeId, xml: xml });
    if (alreadyStore) return res.send({ message: "Tienda en cola" });
    const newReload = new Reload({ storeId: storeId, xml: xml });
    await newReload.save();
    if (flag == false) updateStores();
    else waitFunction();
    return res.send({ message: "Tienda en cola" });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: "Error adding store" });
  }
};

// Funcion que se ejecuta cada 12 de la noche
cron.schedule("0 0 0 * * *", addStoresAutomatic);
