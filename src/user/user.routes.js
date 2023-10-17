"use strict";

const express = require("express");
const api = express.Router();
const userController = require("./user.controller");
const { ensureAuth } = require("../utils/validate");

api.post("/code", userController.sendMail);
api.post("/validate", userController.validateCode);
api.post("/login", userController.login);
api.get("/info", ensureAuth, userController.getInfo);

module.exports = api;
