"use strict";

const express = require("express");
const api = express.Router();
const colorController = require("./color.controller");

api.get("/test", colorController.test);

module.exports = api;
