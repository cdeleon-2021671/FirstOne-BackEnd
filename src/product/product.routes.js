// Utilizar el modo estricto de javascript
"use strict";

// Traer el servidor
const express = require("express");
// Utilizar el enrutador del servidor
const api = express.Router();
// Utilizar el controlador
const productController = require("./product.controller");
const searchController = require("./searchController");

// Declarar cada ruta
api.post("/add-products", productController.addProducts);
api.get("/get-all-products", productController.getAllProducts);
api.get("/get-options", productController.getAutoComplete);
api.get("/get-products-of-tags", productController.getProductsOfTags);
api.get("/get-all-offers", productController.getAllOffers);
api.get("/get-most-viewed", productController.getMostViewed);
api.post("/get-similar-products", productController.getSimilarProducts);
// EL dos puntos (:) indica variable que va ir en la ruta
api.get("/get-product-by-id/:productId", productController.getProductById);
api.post("/get-products-by-tag", productController.getProductsByTag);
api.post("/search-products", searchController.searchProducts);

// Exportar las rutas para ser utilizadas en el app
module.exports = api;
