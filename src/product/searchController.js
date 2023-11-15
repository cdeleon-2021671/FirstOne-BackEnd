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
        let offers = await Product.find({
          $or: [
            { tags: { $in: new RegExp(search, "i") } },
            { salePrice: { $gt: 0 } },
          ],
        }).populate({
          path: "storeId",
          match: {
            state: "ACTIVA",
          },
        });
        offers = offers.filter((item) => item.storeId != null);
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

const searchByName = async (combinations) => {
  try {
    const response = [];
    for (const element of combinations) {
      const regex = "^(?=.*\\b" + element.join("\\b)(?=.*\\b") + "\\b)";
      let products = await Product.find({
        name: {
          $regex: regex,
          $options: "i",
        },
      }).populate({
        path: "storeId",
        match: {
          state: "ACTIVA",
        },
      });
      products = products.filter((item) => item.storeId != null);
      response.push(...products);
    }
    return response;
  } catch (err) {
    console.log(err);
  }
};

const getAllProducts = async (combinations) => {
  try {
    const result = [];
    for (const element of combinations) {
      const regex = "^(?=.*\\b" + element.join("\\b)(?=.*\\b") + "\\b)";
      let products = await Product.find({
        $or: [
          { description: { $regex: regex, $options: "i" } },
          { tags: { $elemMatch: { $regex: regex, $options: "i" } } },
        ],
      }).populate({
        path: "storeId",
        match: {
          state: "ACTIVA",
        },
      });
      products = products.filter((item) => item.storeId != null);
      result.push(...products);
    }
    return result;
  } catch (err) {
    console.log(err);
  }
};

const fyzzySearchProducts = async (combinations) => {
  try {
    let products = await Product.find({}).populate({
      path: "storeId",
      match: {
        state: "ACTIVA",
      },
    });
    products = products.filter((item) => item.storeId != null);
    const fuse = new Fuse(products, {
      ignoreLocation: true,
      distance: 0,
      threshold: 0.5,
      keys: ["name", "tags", "description"],
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
  const stores = await Store.find({
    state: "ACTIVA",
  });
  const fuse = new Fuse(stores, {
    ignoreLocation: true,
    distance: 0,
    threshold: 0.0,
    keys: ["name"],
  });
  const newSearch = search.replace(/[-]+/g, " ");
  const filters = Array.from(fuse.search(newSearch));
  const result = filters.map(({ item }) => item);
  const response = [];
  for (const element of result) {
    const products = await Product.find({ storeId: element._id });
    response.push({ store: element, products: products });
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
    const allProducts = await getAllProducts(combinations);
    const byName = await searchByName(combinations);
    const fuzzy = await fyzzySearchProducts(combinations);
    const stores = await fuzzySearchStores(search);
    const flag = byOffer.concat(byName).concat(allProducts);
    const fullProducts = flag.filter((item) => item.length != 0);
    let result = orderProducts(fullProducts);
    const isValid = result.length;
    if (result.length == 0) result = fuzzy;
    return res.send({ result: result, stores: stores, valid: isValid });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: "Error searching products" });
  }
};
