"use strict";

const axios = require("axios");
const Store = require("../src/store/store.model");

// Reload Stores
const reloadStores = async () => {
  try {
    const stores = await Store.find({});
    stores.forEach(async (item) => {
      await axios.delete(
        `http://localhost:3200/store/delete-store/${item._id}`
      );
      await axios.post(`http://localhost:3200/store/add-store`, item);
    });
    return console.log("Stores have been reloaded");
  } catch (err) {
    console.log(err);
    return console.log("Error reloading stores");
  }
};

exports.reloadStores = async () => {
  try {
    setInterval(() => {
      reloadStores();
    }, 28800000);
  } catch (err) {
    console.log(err);
  }
};
