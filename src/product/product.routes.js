// Utilizar el modo estricto de javascript
"use strict";

// Traer el servidor
const express = require("express");
// Utilizar el enrutador del servidor
const api = express.Router();
// Utilizar el controlador
const productController = require("./product.controller");
const searchController = require("./searchController");
const { ensureAuth } = require("../utils/validate");

// Declarar cada ruta
api.post("/add-products", ensureAuth, productController.addProducts);
api.get("/get-all-products", productController.getAllProducts);
api.get("/get-options", productController.getAutoComplete);
api.get("/get-products-of-tags", productController.getProductsOfTags);
api.get("/get-all-offers", productController.getAllOffers);
api.get("/get-most-viewed", productController.getMostViewed);
api.post("/get-similar-products", productController.getSimilarProducts);
api.post("/get-trending", productController.getTrending);
// EL dos puntos (:) indica variable que va ir en la ruta
api.get("/get-product-by-id/:productId", productController.getProductById);
api.post("/get-products-by-tag", productController.getProductsByTag);
api.post("/search-products", searchController.searchProducts);
api.put("/add-view/:productId", productController.updateView);

// Exportar las rutas para ser utilizadas en el app
module.exports = api;
