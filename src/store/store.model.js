// Utilizar el modo estricto de javascript
"use strict";

// Trear mongoose de mongodb
const mongoose = require("mongoose");

// Crear el esquema de los datos
const storeSchema = mongoose.Schema({
  xml: {
    // Tipo de dato String, puede ser texto, numeros (como string), etc
    type: String,
    // Es un dato requerido (no puede ir vacio, null o indefinido)
    required: true,
    // Tiene que ser unico en todos los xml
    unique: true,
  },
  urlStore: {
    type: String,
    required: true,
    unique: true,
  },
  urlLogo: {
    type: String,
    required: true,
  },
  banner: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: String,
  phone: {
    type: String,
    default: null,
  },
  whatsapp: {
    type: String,
    default: null,
  },
  facebook: {
    type: String,
    default: null,
  },
  instagram: {
    type: String,
    default: null,
  },
  tiktok: {
    type: String,
    default: null,
  },
  messenger: {
    type: String,
    default: null,
  },
  tags: [],
  shippingTerms: Array,
  paymentOptions: Array,
  state: {
    type: String,
    default: "REQUEST",
    enums: ["REQUEST", "ACTIVE", "INACTIVE"],
  },
});

// Exportar el esquema como modelo
module.exports = mongoose.model("Store", storeSchema);
