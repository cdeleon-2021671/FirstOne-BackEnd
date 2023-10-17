// Utilizar el modo estricto de javascript
"use strict";

// Traer el servidor
const express = require("express");
// Utilizar el enrutador del servidor
const api = express.Router();
// Utilizar el controlador
const conversionController = require("./conversion.controller");

// Declarar cada ruta
api.get("/test", conversionController.test);
api.post("/add-view", conversionController.addViewProduct);

// Exportar las rutas para ser utilizadas en el app
module.exports = api;
