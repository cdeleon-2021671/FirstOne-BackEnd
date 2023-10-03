// Utilizar el modo estricto de javascript
"use strict";

// Traer el servidor
const express = require("express");
// Utilizar el enrutador del servidor
const api = express.Router();
// Utilizar el controlador
const assetsController = require("./assets.controller");

// Declarar cada ruta
api.get("/computer", assetsController.getImageComputer);
api.get("/tablet", assetsController.getImageTablet);
api.get("/phone", assetsController.getImagePhone);

// Exportar las rutas para ser utilizadas en el app
module.exports = api;
