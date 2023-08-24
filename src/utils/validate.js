// Utilizar el modo estricto de javascript
"use strict";

const xml2js = require("xml2js");

// Funcion para convertir xml en json
exports.changeXML = (xml) => {
  return new Promise((resolve, reject) => {
    // Pasar el xml a json
    const parser = new xml2js.Parser();
    parser.parseString(xml, (err, result) => {
      if (err) {
        console.log(err);
        reject(err); // Rechazar la promesa en caso de error
      } else {
        resolve(result.rss.channel); // Resolver la promesa con el resultado
      }
    });
  });
};

// Datos que se necesitan al enviar una peticion post
exports.headers = {
  "content-types": "aplication/json",
};
