"use strict";

const { removeStopwords, spa } = require("stopword");
const Store = require("../store/store.model");
const Product = require("./product.model");
const { offerWords } = require("./keywords");
const Fuse = require("fuse.js");

const cleanSearch = (text) => {
  const newText = text.replace(/[-[\]{}()*+?.,;:#@<>\\^$|#"']+/g, " ").trim();
  const cleanNewText = newText.split(" ");
  const cleanSearch = cleanNewText.filter((item) => item != "" && item != " ");
  const result = removeStopwords(cleanSearch, spa);
  return result;
};

const combineNumbers = (numbers) => {
  const combinations = [];
  for (let i = 0; i < numbers.length; i++) {
    for (let j = i + 1; j < numbers.length; j++) {
      combinations.push([numbers[i], numbers[j]]);
    }
  }
  for (let i = 0; i < numbers.length; i++) {
    combinations.push([numbers[i]]);
  }
  return combinations;
};

const getOffers = async (search) => {
  try {
    const result = [];
    for (const item of offerWords) {
      const mySearch = search.toLowerCase();
      const offerWord = item.toLowerCase();
      if (offerWord.includes(mySearch)) {
        const offers = await Product.find({
          $or: [
            { tags: { $in: new RegExp(search, "i") } },
            { salePrice: { $gt: 0 } },
          ],
        }).populate("storeId");
        result.push(offers);
        break;
      }
    }
    return result;
  } catch (err) {
    console.log(err);
    return { message: "Error getting offers" };
  }
};

const searchByName = (combinations) => {
  try {
    const response = [];
    combinations.forEach(async (element) => {
      const search = element.join(" ");
      const products = await Product.find({
        name: new RegExp(search, "i"),
      });
      response.push(...products);
    });
    return response;
  } catch (err) {
    console.log(err);
  }
};

const fyzzySearchProducts = async (combinations) => {
  try {
    const products = await Product.find().populate("storeId");
    const fuse = new Fuse(products, {
      ignoreLocation: true,
      location: 0,
      distance: 0,
      threshold: 0.5,
      keys: ["name", "tags"],
    });
    const response = [];
    combinations.forEach((element) => {
      const search = element.join(" ");
      const filters = Array.from(fuse.search(search));
      const result = filters.map(({ item }) => item);
      response.push(...result);
    });
    return response;
  } catch (err) {
    console.log(err);
  }
};

const fuzzySearchStores = async (search) => {
  const stores = await Store.find({});
  const fuse = new Fuse(stores, {
    ignoreLocation: true,
    distance: 0,
    threshold: 0.0,
    keys: ["name"],
  });
  const filters = Array.from(fuse.search(search));
  const result = filters.map(({ item }) => item);
  const response = [];
  for (const element of result) {
    const products = await Product.find({ storeId: element._id });
    response.push({ store: element, products: products.length });
  }
  return response;
};

const orderProducts = (array) => {
  const uniqueProducts = new Set();
  const result = [];
  for (const item of array) {
    const itemId = item._id.toString();
    if (!uniqueProducts.has(itemId)) {
      uniqueProducts.add(itemId);
      result.push(item);
    }
  }
  return result;
};

exports.searchProducts = async (req, res) => {
  try {
    const { search } = req.body;
    const newSearch = cleanSearch(search);
    const combinations = combineNumbers(newSearch);
    const byOffer = await getOffers(search);
    const byName = await searchByName(combinations);
    const fuzzy = await fyzzySearchProducts(combinations);
    const stores = await fuzzySearchStores(search);
    const flag = byOffer.concat(byName).concat(fuzzy);
    const fullProducts = flag.filter((item) => item.length != 0);
    const result = orderProducts(fullProducts);
    return res.send({ result: result, stores: stores });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: "Error searching products" });
  }
};
