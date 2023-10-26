"use strict";

const mongoose = require("mongoose");

const reloadSchema = mongoose.Schema({
    storeId: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Store'
    },
    xml: String
});

module.exports = mongoose.model("Reload", reloadSchema);
