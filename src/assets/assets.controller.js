// Utilizar el modo estricto de javascript
'use strict'

//Importar librerias
const path = require('path');

exports.getImageComputer = async(req, res)=>{
    return res.sendFile(path.resolve(`./src/assets/Banner - Computadora1.jpg`))
}

exports.getImageTablet = (req, res)=>{
    return res.sendFile(path.resolve(`./src/assets/Banner - Tablet.jpg`))
}

exports.getImagePhone = (req, res)=>{
    return res.sendFile(path.resolve(`./src/assets/Banner - Telefono.jpg`))
}