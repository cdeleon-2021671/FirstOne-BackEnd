// Utilizar el modo estricto de javascript
"use strict";

// Trear mongoose de mongodb
const mongoose = require("mongoose");

// Crear el esquema de los datos
const productSchema = mongoose.Schema({
  idProduct: {
    type: Number,
    required: true,
  },
  storeId: {
    // ObjectId es decir que tiene que ser id
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    // Referencia a quien haria el id
    ref: "Store",
  },
  urlProduct: {
    // Tipo de dato String, puede ser texto, numeros (como string), etc
    type: String,
    // Es un dato requerido (no puede ir vacio, null o indefinido)
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  // Tipo de dato numero, puede ser entero o con decimales
  salePrice: Number,
  saleStartDate: String, // Fecha
  saleEndDate: String, // Fecha
  tags: Array,
  stock: {
    type: String,
    required: true,
  },
  quantity: Number,
  views: {
    type: Number,
    // AL ingresar un productos siempre ingresara con cero views
    default: 0,
  },
  image: {
    type: String,
    required: true,
  },
});

// Exportar el esquema como modelo
module.exports = mongoose.model("Product", productSchema);
