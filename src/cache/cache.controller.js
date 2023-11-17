"use strict";

const axios = require("axios");
const cron = require("node-cron");
let objects = {};

const getStores = async () => {
  try {
    const { data } = await axios.get(`http://localhost:3200/store/get-stores`);
    const { stores } = data;
    return stores;
  } catch (err) {
    console.log(err);
  }
};

const getCategories = async () => {
  try {
    const { data } = await axios.get(
      `http://localhost:3200/product/get-products-of-tags`
    );
    const { result } = data;
    return result;
  } catch (err) {
    console.log(err);
  }
};

const getOffers = async () => {
  try {
    const { data } = await axios.get(
      `http://localhost:3200/product/get-all-offers`
    );
    const { allOffers } = data;
    return allOffers;
  } catch (err) {
    console.log(err);
  }
};

const getProducts = async () => {
  try {
    const { data } = await axios.get(
      `http://localhost:3200/product/get-all-products`
    );
    const { allProducts } = data;
    return allProducts;
  } catch (err) {
    console.log(err);
  }
};

const getMostViewed = async () => {
  try {
    const { data } = await axios.get(
      `http://localhost:3200/product/get-most-viewed`
    );
    const { products } = data;
    return products;
  } catch (err) {
    console.log(err);
  }
};

const getAutoComplete = async () => {
  try {
    const { data } = await axios.get(
      `http://localhost:3200/product/get-options`
    );
    const { result } = data;
    return result;
  } catch (err) {
    console.log(err);
  }
};

exports.changeObject = async (req, res) => {
  objects = {};
  const stores = await getStores();
  const categories = await getCategories();
  const offers = await getOffers();
  const products = await getProducts();
  const mostViewed = await getMostViewed();
  const autoComplete = await getAutoComplete();
  objects = { stores, categories, offers, products, mostViewed, autoComplete };
  console.log("Cache actualizado");
  if (res) return res.send({ message: "Cache actualizado" });
};

exports.getObjetcs = async (req, res) => {
  try {
    return res.send({ ...objects });
  } catch (err) {
    console.log(err);
  }
};

cron.schedule("0 * * * *", this.changeObject);
