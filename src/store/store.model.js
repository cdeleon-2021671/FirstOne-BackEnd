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
  name: {
    type: String,
    required: true,
  },
  description: String,
  phone: String,
  whatsapp: String,
  facebook: String,
  instagram: String,
  tiktok: String,
  messenger: String,
  shippingTerms: String,
  paymentOptions: Array,
});

// Exportar el esquema como modelo
module.exports = mongoose.model('Store', storeSchema);