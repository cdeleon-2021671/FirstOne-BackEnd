// Utilizar el modo estricto de javascript
"use strict";

const express = require("express"); // Traer el servidor express
const app = express(); // Utilizar la funcion de express
// Traer las dependencias a utilizar
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");

// Utilizar el puerto de las variables de entorno u otro
let port = process.env.PORT || 3500;

// Traer las rutas a utilizar
const storeRoutes = require("../src/store/store.routes");
const productRoutes = require("../src/product/product.routes");
const assetsRoutes = require("../src/assets/assets.routes");
const userRoutes = require("../src/user/user.routes");
const colorRoutes = require("../src/color/color.routes");
const reloadRoutes = require("../src/reload/reload.routes");

// Traer admin por defecto
const userController = require("../src/user/user.controller");

// Convertir las peticiones en objetos json
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// validar que solo tienda.gt pueda acceder
const allowedOrigins = [
  "https://tienda.gt",
  "https://www.tienda.gt",
  "http://localhost:5173",
];
const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error(`Dominio no permitido por CORS. Origen: ${origin}`));
    }
  },
};
// Utilizar las dependencias
app.use(cors(corsOptions)); // Para poder utilizar otros puertos externos (front)
app.use(helmet()); // Para proteger el proyecto de vulnerabilidades
app.use(morgan("dev")); // Herramienta de desarrollo

// Establecer las rutas raices y las rutas a utilizar
app.use("/store", storeRoutes);
app.use("/product", productRoutes);
app.use("/image", assetsRoutes);
app.use("/user", userRoutes);
app.use("/color", colorRoutes);
app.use("/reload", reloadRoutes);

// Funcion para iniciar el servidor en un puerto designado
exports.initServer = async () => {
  app.listen(port);
  userController.adminDefault();
  console.log(`Http server running on port ${port}`);
};
