"use strict";

const express = require("express");
const api = express.Router();
const reloadController = require("./reload.controller");
const { ensureAuth } = require("../utils/validate");

api.post("/add-store", ensureAuth, reloadController.addToReaload);

module.exports = api;
