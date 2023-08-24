// Utilizar el modo estricto de javascript
'use strict'

// Traer el modelo Conversion
const Conversion = require('./conversion.model');

// Funcion para validar que todo este bien con las rutas, modelos, controlador
exports.test = (req, res)=>{
    return res.send({message: 'Conversion test running'});
}