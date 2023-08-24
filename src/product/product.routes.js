// Utilizar el modo estricto de javascript
'use strict';

// Traer el servidor
const express = require('express');
// Utilizar el enrutador del servidor
const api = express.Router();
// Utilizar el controlador
const productController = require('./product.controller');

// Declarar cada ruta
api.get('/test', productController.test);
api.get('/getProducts', productController.getProducts);
api.get('/getVivaldi', productController.getVivaldi);
api.get('/getMolvu', productController.getMolvu);
// EL dos puntos (:) indica variable que va ir en la ruta
api.get('/getProductById/:productId', productController.getProductById);
api.get('/searchProducts', productController.searchProducts);

// Exportar las rutas para ser utilizadas en el app
module.exports = api;