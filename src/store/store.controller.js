// Utilizar el modo estricto de javascript
"use strict";

const Store = require("./store.model"); // Traer el modelo Store
const axios = require("axios"); // Utilizar la dependencia de axios
const {
  addProducts,
  deleteProducts,
} = require("../product/product.controller");
const { changeXML } = require("../utils/validate"); // Trear una funcion

exports.addStoresDefault = async () => {
  try {
    const molvu = await addStoreMolvu();
    console.log(molvu);
    const vivaldi = await addStoreVivaldi();
    console.log(vivaldi);
  } catch (err) {
    console.log(err);
  }
};

// Funcion para validar que todo este bien con las rutas, modelos, controlador
exports.test = (req, res) => {
  return res.send({ message: "Store test running" });
};

// Add Store Molvu
const addStoreMolvu = async () => {
  try {
    // Extraer la respuesta (data) del xml utilizando axios y variables de entorno
    const { data } = await axios.get(`${process.env.MOLVU}`);
    const channel = await changeXML(data);
    // Setear los valores de store para agregar a la db
    const store = {
      xml: `${process.env.MOLVU}`,
      urlStore: channel[0].link[0],
      name: channel[0].title[0].toUpperCase(),
      phone: "+502 2218-3152",
      whatsapp: "50230711913",
      facebook: "http://mol.vu/fb",
      messenger: null,
      instagram: "http://mol.vu/ig",
      tiktok: null,
      shippingTerms: "https://molvu.com/entregas",
      paymentOptions: [
        "Tarjeta de crédito/débito",
        "Visacuotas",
        "Credicuotas (aplica para tarjetas de crédito emitidas por BAC)",
        "Depósito a cuenta",
        "Links de pago",
        "Pago contra entrega",
        "Recoger en tienda",
        "Pagos en tienda física",
        "https://molvu.com/privacy",
      ],
    };
    // Validar que el xml y la url de la tienda no se repitan en la db
    const alreadyStore = await Store.findOne({
      xml: store.xml,
      urlStore: store.urlStore,
    });
    if (alreadyStore) return "Molvu already exists in db";
    // Agregar la tienda a la db;
    const newStore = new Store(store);
    await newStore.save();
    // Agregar los productos a la db;
    const myStore = await Store.findOne({
      xml: store.xml,
      urlStore: store.urlStore,
    });
    channel[0].item.forEach(async (item, key) => {
      addProducts(item, myStore._id);
    });
    return "Molvu added successfully";
  } catch (err) {
    console.log(err);
    return console.log("Error adding Molvu");
  }
};
// Add Store Vivaldi
const addStoreVivaldi = async (req, res) => {
  try {
    // Extraer la respuesta (data) del xml utilizando axios y variables de entorno
    const { data } = await axios.get(`${process.env.VIVALDI}`);
    const channel = await changeXML(data);
    // Setear los valores de store para agregar a la db
    const store = {
      xml: `${process.env.VIVALDI}`,
      urlStore: channel[0].link[0],
      name: channel[0].title[0].toUpperCase(),
      phone: null,
      whatsapp: "50245696102",
      facebook: "https://www.facebook.com/poshpinkgt/",
      messenger: null,
      instagram:
        "https://www.instagram.com/loveposhpink/?fbclid=IwAR1n8h9UT_KtA-MeKhZtgGCw2Xao2UHVzUY9Dr5QgaU7ukJLp7xC_L_E0i0",
      tiktok: null,
      shippingTerms:
        "Envíos a todo el país con tan solo Q19.99 y recibes en 1-2 días hábiles",
      paymentOptions: [
        "Efectivo",
        "Contra entrega",
        "Depósito",
        "Transferencia",
        "Próximamente tarjetas",
      ],
    };
    // Validar que el xml y la url de la tienda no se repitan en la db
    const alreadyStore = await Store.findOne({
      xml: store.xml,
      urlStore: store.urlStore,
    });
    if (alreadyStore) return "Vivaldi already exists in db";
    // Agregar la tienda a la db;
    const newStore = new Store(store);
    await newStore.save();
    // Agregar los productos a la db;
    const myStore = await Store.findOne({
      xml: store.xml,
      urlStore: store.urlStore,
    });
    channel[0].item.forEach(async (item, key) => {
      let parameter = {
        link: [`${item["g:link"][0]}`],
        title: [`${item["g:title"][0]}`],
        description: [`${item["g:description"][0]}`],
        "g:price": [`${item["g:price"][0]}`],
        "g:product_type": [`${item["g:product_type"][0]}`],
        "g:availability": [`${item["g:availability"][0]}`],
        "g:image_link": [`${item["g:image_link"][0]}`],
      };
      let aditional = {
        salePrice: item["g:sale_price"][0],
        saleStartDate: "",
        saleEndDate: "",
        categories: "",
      };
      addProducts(parameter, myStore._id, aditional);
    });
    return "Vivaldi added successfully";
  } catch (err) {
    console.log(err);
    return console.log("Error adding Vivaldi");
  }
};
// Delete store
const deleteStore = async (id) => {
  try {
    // Extraer el id de la tienda (store) de los parametros
    const store = id;
    // Validar si viene el id
    const storeExists = await Store.findOne({ _id: store });
    if (!storeExists) return "Store not found";
    // Eliminar los productos de la db
    deleteProducts(store);
    // Eliminar la tienda de la db
    await Store.findOneAndDelete({ _id: store });
    return "Store deleted successfully";
  } catch (err) {
    console.log(err);
    return "Error deleting store";
  }
};

const getStore = async (xml) => {
  try {
    const store = await Store.findOne({ xml: xml });
    if (!store) return "Store not found"
    return {store}
  } catch (err) {
    console.log(err);
    return res.send({ message: "Error getting store" });
  }
};
// Reload Molvu and Vivaldi
exports.reloadMolvuVivaldi = async (req, res) => {
  try {
    const molvu = await getStore(`${process.env.MOLVU}`);
    if (!molvu.store)
      return res.status(404).send({ message: "Molvu not found" });
    const vivaldi = await getStore(`${process.env.VIVALDI}`);
    if (!vivaldi.store)
      return res.status(404).send({ message: "Vivaldi not found" });
    deleteStore(`${molvu.store._id}`);
    deleteStore(`${vivaldi.store._id}`);
    addStoreMolvu();
    addStoreVivaldi();
    return res.send({ message: "Molvu and Vivaldi were reloaded" });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: "Error reloading products" });
  }
};
