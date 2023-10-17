"use strict";

const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  name: String,
  email: String,
  password: String,
  rol: String,
  stores: [
    {
      storeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Store",
      },
    },
  ],
});

module.exports = mongoose.model("User", userSchema);
