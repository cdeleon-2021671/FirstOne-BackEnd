// Utilizar el modo estricto de javascript
"use strict";

const Store = require("./store.model"); // Traer el modelo Store
const Product = require("../product/product.model");
const User = require("../user/user.model");

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
    // Eliminar la tienda del usuario
    const user = await User.findOne(
      { rol: "COMERCIANTE", "stores.storeId": storeId },
      { password: 0 }
    );
    const stores = user.stores.filter((item) => item.storeId != storeId);
    await User.updateMany(
      { "stores.storeId": storeId },
      { stores: stores },
      { new: true }
    );
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
    const allStores = await Store.find({ state: "ACTIVA" });
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

// Get all Stores
exports.getAllStores = async (req, res) => {
  try {
    // Traer todas las tiendas
    const stores = await Store.find({});
    // Nuevo arreglo para guardar las tiendas con los jefes
    const allStores = [];
    // Recorrer las tiendas
    for (const element of stores) {
      // Extraer el id de cada tienda
      const { _id } = element;
      // Obtener el jefe de esa tienda
      const boss = await User.findOne({
        rol: "COMERCIANTE",
        "stores.storeId": _id,
      });
      // Obtener el nombre y correo del jefe
      const { name, email } = boss;
      // Crear el objeto de tienda
      const result = {
        store: element,
        boss: {
          name: name,
          email: email,
        },
      };
      // Agregar el objeto al arreglo
      allStores.push(result);
    }
    return res.send({ allStores });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: "Error getting stores" });
  }
};

// get store by id
exports.getStoreById = async (req, res) => {
  try {
    const { storeId } = req.params;
    const store = await Store.findOne({ _id: storeId });
    if (!store)
      return res.status(404).send({ message: "Tienda no encontrada" });
    return res.send({ store });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: "Error updating store" });
  }
};

// Inactivar tienda
exports.inactiveStore = async (req, res) => {
  try {
    const { storeId } = req.params;
    const store = await Store.findOne({ _id: storeId });
    if (!store)
      return res.status(404).send({ message: "Tienda no encontrada" });
    await store.updateOne({ state: "INACTIVA" });
    return res.send({ message: "Tienda inactivada" });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: "Error updating store" });
  }
};
