// Utilizar el modo estricto de javascript
"use strict";

// Traer el servidor
const express = require("express");
// Utilizar el enrutador del servidor
const api = express.Router();
// Utilizar el controlador
const storeController = require("./store.controller");
const { ensureAuth } = require("../utils/validate");

// Declarar cada ruta
api.post("/add-store", storeController.addStore);
api.delete("/delete-store/:storeId", ensureAuth, storeController.deleteStore);
api.get("/get-stores", storeController.getStores);
api.get("/get-store-by-id/:storeId", storeController.getStoreById);
api.get("/get-all-stores", storeController.getAllStores);
api.put("/inactive-store/:storeId", ensureAuth, storeController.inactiveStore);
// Exportar las rutas para ser utilizadas en el app
module.exports = api;
