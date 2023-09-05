// Utilizar el modo estricto de javascript
'use strict';

// Traer el servidor
const express = require('express');
// Utilizar el enrutador del servidor
const api = express.Router();
// Utilizar el controlador
const productController = require('./product.controller');

// Declarar cada ruta
api.get('/get-all-products', productController.getAllProducts);
api.get('/get-options', productController.getAutoComplete);
// EL dos puntos (:) indica variable que va ir en la ruta
api.get('/get-product-by-id/:productId', productController.getProductById);
api.get('/get-products-by-store/:storeId', productController.getProductByStore);
api.post('/search-products', productController.searchProducts);

// Exportar las rutas para ser utilizadas en el app
module.exports = api;