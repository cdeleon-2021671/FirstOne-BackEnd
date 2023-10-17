// Utilizar el modo estricto de javascript
"use strict";

// Traer el modelo Conversion
const Conversion = require("./conversion.model");
const mm = require("moment");
const axios = require("axios");
// Funcion para validar que todo este bien con las rutas, modelos, controlador
exports.test = (req, res) => {
  return res.send({ message: "Conversion test running" });
};

exports.addViewProduct = async (req, res) => {
  try {
    const { product } = req.body;
    const view = {
      productId: product._id,
      storeId: product.storeId._id,
    };
    console.log(mm().locale("es").format("LLLL"));
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: "Error adding view" });
  }
};

exports.addViewLink = async (req, res) => {
  try {
    const { product } = req.body;
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: "Error adding view" });
  }
};
