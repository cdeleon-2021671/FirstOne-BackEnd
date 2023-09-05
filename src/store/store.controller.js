// Utilizar el modo estricto de javascript
"use strict";

const Store = require("./store.model"); // Traer el modelo Store
const {
  addProducts,
  deleteProducts,
} = require("../product/product.controller");
const { changeXML } = require("../utils/validate"); // Trear la función de convertir xml

const axios = require("axios");
const x2js = require("x2js");

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
    // Agregar la tienda a la db
    const newStore = new Store(store);
    // console.log(newStore);
    // console.log(store);
    // return
    await newStore.save();
    // Convertir xml
    if ((await changeXML(store.xml)) == undefined)
      return res.status(400).send({ message: "XML is wrong" });
    const { item } = await changeXML(store.xml);
    // Agregar los productos a la db
    item.forEach((index) => {
      addProducts(index, newStore._id);
    });
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
    deleteProducts(storeId);
    // Eliminar la tienda de la db
    await Store.findOneAndDelete({ _id: storeId });
    return res.send({ message: "Store deleted successfully" });
  } catch (err) {
    console.log(err);
    return "Error deleting store";
  }
};
