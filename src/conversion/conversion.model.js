// Utilizar el modo estricto de javascript
"use strict";

// Trear mongoose de mongodb
const mongoose = require("mongoose");

// Crear el esquema de los datos
const conversionSchema = mongoose.Schema({
  productId: {
    // Mixed es decir que puede ser un Id o puede ser null
    type: mongoose.Schema.Types.Mixed,
    // Referencia a quien haria el id
    ref: 'Product'
  },
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store'
  },
  // Tipo de dato vacio, String, puede ser texto, numeros (como string), etc 
  type: String,
  visitor: String,
  data: String,
});

// Exportar el esquema como modelo
module.exports = mongoose.model('Conversion', conversionSchema);