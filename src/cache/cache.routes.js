"use strict";

const express = require("express");
const api = express.Router();
const cacheController = require("./cache.controller");

api.get("/change-cache", cacheController.changeObject);
api.get("/get-cache", cacheController.getObjetcs);

module.exports = api;
