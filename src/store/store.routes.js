// Utilizar el modo estricto de javascript
'use strict';

// Traer el servidor
const express = require('express');
// Utilizar el enrutador del servidor
const api = express.Router();
// Utilizar el controlador
const storeController = require('./store.controller');

// Declarar cada ruta
api.get('/test', storeController.test);
api.get('/reloadMolvuVivaldi', storeController.reloadMolvuVivaldi);
// Exportar las rutas para ser utilizadas en el app
module.exports = api;