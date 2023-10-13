"use strict";

const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  name: String,
  email: String,
  password: String,
  rol: String,
});

module.exports = mongoose.model("User", userSchema);
