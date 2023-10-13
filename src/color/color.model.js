"use strict";

const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  page: String,
  store: mongoose.Schema.Types.ObjectId,
  component: String,
  first: String,
  second: String,
  third: String,
  text: String,
});

module.exports = mongoose.model("User", userSchema);
