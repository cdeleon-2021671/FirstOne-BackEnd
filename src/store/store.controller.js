// Utilizar el modo estricto de javascript
"use strict";

const Store = require("./store.model"); // Traer el modelo Store
const Product = require("../product/product.model");

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
      return res.status(400).send({ message: `La tienda ya existe` });
    // Agregar la tienda a la db
    const newStore = new Store(store);
    await newStore.save();
    return res.send({
      message: "Tienda añadida satisfactoriamente",
      storeId: newStore._id,
    });
  } catch (err) {
    console.log(err);
    if (err.message.includes("required"))
      res.status(500).send({ message: "Some params are required" });
    return res.status(500).send({ message: "Error adding store" });
  }
};

//Actualizar etiquetas
exports.updateTags = async (req, res) => {
  try {
    const { items, storeId } = req.body;
    const tags = items.map((item) => item.category);
    const store = await Store.findOne({ _id: storeId });
    if (!store)
      return res
        .status(404)
        .send({ message: "Tienda a actualizar no encontrada" });
    if (store.state != "PENDIENTE")
      return res
        .status(400)
        .send({ message: "La tienda no se puede actualizar" });
    await store.updateOne({ tags: tags });
    return res.send({ message: "Etiquetas actualizadas" });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: "Error updating tags" });
  }
};

//Actualizar metodos de compra
exports.updateShippingTerms = async (req, res) => {
  try {
    const { shipping, storeId } = req.body;
    const store = await Store.findOne({ _id: storeId });
    if (!store)
      return res
        .status(404)
        .send({ message: "Tienda a actualizar no encontrada" });
    if (store.state != "PENDIENTE")
      return res
        .status(400)
        .send({ message: "La tienda no se puede actualizar" });
    const keys = Object.keys(shipping);
    const terms = [];
    for (const item of keys) {
      if (shipping[item].trim() != "") {
        terms.push(shipping[item]);
      }
    }
    if (terms.length == 0)
      return res
        .status(400)
        .send({ message: "No puede enviar elementos vacíos" });
    await store.updateOne({ shippingTerms: terms });
    return res.send({ message: "Opciones de envío actualizadas" });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: "Error updating shipping terms" });
  }
};

//Actualizar metodos de pago
exports.updatePaymentsOptions = async (req, res) => {
  try {
    const { payments, storeId } = req.body;
    const store = await Store.findOne({ _id: storeId });
    if (!store)
      return res
        .status(404)
        .send({ message: "Tienda a actualizar no encontrada" });
    if (store.state != "PENDIENTE")
      return res
        .status(400)
        .send({ message: "La tienda no se puede actualizar" });
    const keys = Object.keys(payments);
    const terms = [];
    for (const item of keys) {
      if (payments[item].trim() != "") {
        terms.push(payments[item]);
      }
    }
    if (terms.length == 0)
      return res
        .status(400)
        .send({ message: "No puede enviar elementos vacíos" });
    await store.updateOne({ paymentOptions: terms });
    return res.send({ message: "Opciones de pago actualizadas" });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: "Error updating payments" });
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
    const allStores = await Store.find({ state: "ACTIVE" });
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
