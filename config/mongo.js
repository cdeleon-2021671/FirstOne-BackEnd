// Utilizar el modo estricto de javascript
'use strict'

// Extraer mongoose de mongodb
const mongoose = require('mongoose');
// Utilizar las variables de entorno de produccion
require('dotenv').config({path: '.env.prod'});

// Iniciar la conexion
exports.connect = async()=>{
    try {
        // Utilizar la ruta para conectarse a la db
        // const uriMongo = `${process.env.URI_MONGO_LOCAL}`;
        const uriMongo = `${process.env.URI_MONGO}`;
        // Quitar el modo estricto ante cualquier consulta
        mongoose.set('strictQuery', false);
        // Conectar a la base de datos
        await mongoose.connect(uriMongo);
        console.log(`Connected to db`);
    } catch (err) {
        console.log(err);
    }
}