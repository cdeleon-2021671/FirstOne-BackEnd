// Utilizar el modo estricto de javascript
"use strict";

// Traer el servidor
const express = require("express");
// Utilizar el enrutador del servidor
const api = express.Router();
// Utilizar el controlador
const storeController = require("./store.controller");

// Declarar cada ruta
api.post("/add-store", storeController.addStore);
api.delete("/delete-store/:storeId", storeController.deleteStore);
api.post('/createMail', storeController.createMail);
api.get('/get-stores', storeController.getStores);
// Exportar las rutas para ser utilizadas en el app
module.exports = api;
