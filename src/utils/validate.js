// Utilizar el modo estricto de javascript
"use strict";

const xml2js = require("xml2js");
const axios = require("axios");

// Funcion para convertir xml en json
exports.changeXML = async (xml) => {
  try {
    const { data } = await axios.get(xml);
    return new Promise((resolve, reject) => {
      // Pasar el xml a json
      const parser = new xml2js.Parser();
      parser.parseString(data, (err, result) => {
        if (err) {
          // console.log(err);
          reject(err); // Rechazar la promesa en caso de error
        } else {
          resolve(result.rss.channel[0]); // Resolver la promesa con el resultado
        }
      });
    });
  } catch (err) {
    console.log(err);
  }
};

// Datos que se necesitan al enviar una peticion post
exports.headers = {
  "content-types": "aplication/json",
};
