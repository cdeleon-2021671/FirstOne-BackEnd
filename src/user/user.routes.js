"use strict";

const express = require("express");
const api = express.Router();
const userController = require("./user.controller");

api.post("/code", userController.sendMail);
api.post("/validate", userController.validateCode);
api.post("/login", userController.login);

module.exports = api;
