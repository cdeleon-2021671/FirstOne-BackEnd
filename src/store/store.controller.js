// Utilizar el modo estricto de javascript
"use strict";

const Store = require("./store.model"); // Traer el modelo Store
const Product = require("../product/product.model");
const { addProducts } = require("../product/product.controller");
const axios = require("axios");
const xml2js = require("xml2js");
const { stripPrefix } = require("xml2js").processors;

// Add Store
exports.addStore = async (req, res) => {
  try {
    // Recibe los datos
    const store = req.body;
    // Validar el xml
    if (store.xml == undefined || store.xml == "")
      return res.status(400).send({ message: "XML is required" });
    // Validar el whatsapp
    if (store.whatsapp != undefined && store.whatsapp != "")
      store.whatsapp = store.whatsapp.replace(/[+, ' ', -]+/g, "");
    // Validar que el xml y la url de la tienda no se repitan en la db
    const alreadyStore = await Store.findOne({
      $or: [{ xml: store.xml }, { urlStore: store.urlStore }],
    });
    if (alreadyStore)
      return res.status(400).send({ message: `Store already exists in db` });
    // Convertir xml
    const { data } = await axios.get(`${store.xml}`);
    const parser = new xml2js.Parser({
      tagNameProcessors: [stripPrefix],
      explicitRoot: false,
      normalizeTags: true,
    });
    const { channel } = await parser.parseStringPromise(data);
    // Agregar la tienda a la db
    const newStore = new Store(store);
    await newStore.save();
    // Agregar los productos a la db
    const { item } = channel[0];
    for (const element of item) {
      const product = await Product.findOne({ idProduct: element.id[0] });
      if (product) continue;
      addProducts(element, newStore._id);
    }
    return res.send({ message: "Store added successfully" });
  } catch (err) {
    console.log(err);
    if (err.message.includes("required"))
      res.status(500).send({ message: "Some params are required" });
    return res.status(500).send({ message: "Error adding store" });
  }
};

// Delete store
exports.deleteStore = async (req, res) => {
  try {
    // Extraer el id de la tienda (store) de los parametros
    const { storeId } = req.params;
    // Validar si viene el id
    const storeExists = await Store.findOne({ _id: storeId });
    if (!storeExists)
      return res.status(404).send({ message: "Store not found" });
    // Eliminar los productos de la db
    await Product.deleteMany({ storeId: storeId });
    // Eliminar la tienda de la db
    await Store.findOneAndDelete({ _id: storeId });
    return res.send({ message: "Store deleted successfully" });
  } catch (err) {
    console.log(err);
    return "Error deleting store";
  }
};

// Get Stores
exports.getStores = async (req, res) => {
  try {
    const allStores = await Store.find({});
    const stores = [];
    for (const element of allStores) {
      const products = await Product.find({ storeId: element._id });
      const store = { store: element, products: products.length };
      stores.push(store);
    }
    return res.send({ stores });
  } catch (err) {
    console.log(err);
  }
};

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "cd6854002@gmail.com",
    pass: "jsor dsmw ccba pyzx",
  },
});

exports.createMail = async (req, res) => {
  try {
    await transporter.sendMail({
      from: 'Ejemplo de prueba <tienda.gt@gmail.com>', // sender address
      to: "cdeleonprincipal671@gmail.com", // list of receivers
      subject: "Prueba", // Subject line
      text: "Es un ejemplo para verificar si funciona el metodo de correos", // plain text body
    });
    return res.send({message: 'Correo enviado'})
  } catch (err) {
    console.log(err);
    return res.send({ message: "Error creating message" });
  }
};
