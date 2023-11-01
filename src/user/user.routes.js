"use strict";

const express = require("express");
const api = express.Router();
const userController = require("./user.controller");
const { ensureAuth } = require("../utils/validate");

api.post("/code", userController.sendMail);
api.post("/validate", userController.validateCode);
api.post("/login", userController.login);
api.get("/info", ensureAuth, userController.getInfo);
api.post("/create-account", userController.createUser);
api.post("/update-stores", userController.updateStores);
api.get("/get-user-by-id/:userId", userController.getUserById);
api.get("/get-all-users", ensureAuth, userController.getAllUsers);
api.get("/get-all-workers/:storeId", ensureAuth, userController.getWorkers);

module.exports = api;
