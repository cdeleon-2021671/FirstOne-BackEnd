"use strict";

const mongoose = require("mongoose");

const colorSchema = mongoose.Schema({
  page: String,
  store: mongoose.Schema.Types.ObjectId,
  component: String,
  first: String,
  second: String,
  third: String,
  text: String,
});

module.exports = mongoose.model("Color", colorSchema);
