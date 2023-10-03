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

  for (let i = numbers.length - 1; i >= 0; i--) {
    for (let j = i - 1; j > 0; j--) {
      combinations.push([numbers[i], numbers[j]]);
    }
  }
  for (let i = numbers.length - 1; i >= 0; i--) {
    combinations.push([numbers[i]]);
  }

  return combinations;
};

const searchInTags = async (combinations) => {
  try {
    const productsOfTags = await Promise.all(
      combinations.map(async (item) => {
        const tags = await Product.find({
          tags: { $all: new RegExp(item, "i") },
        }).populate("storeId");
        return tags;
      })
    );
    const newProducts = productsOfTags.filter((item) => item.length !== 0);
    return newProducts;
  } catch (err) {
    console.log(err);
    return { message: "Error searching in tags" };
  }
};

const searchInNameDesc = async (combinations) => {
  try {
    const productsOfName = await Promise.all(
      combinations.map(async (item) => {
        const nameQuery = item.map((keyword) => new RegExp(keyword, "i"));
        const products = await Product.find({
          $or: [
            { name: { $all: nameQuery } },
            { description: { $all: nameQuery } },
          ],
        }).populate("storeId");
        return products;
      })
    );
    const newProducts = productsOfName.filter((item) => item.length !== 0);
    return newProducts;
  } catch (err) {
    console.log(err);
    return { message: "Error searching in name product" };
  }
};

const searchInStoreDesc = async (combinations) => {
  try {
    const stores = await Promise.all(
      combinations.map(async (item) => {
        const nameQuery = item.map((keyword) => new RegExp(keyword, "i"));
        const store = await Store.find({
          $or: [
            { name: { $all: nameQuery } },
            { description: { $all: nameQuery } },
          ],
        });
        return store;
      })
    );
    const newStores = stores.filter((item) => item.length !== 0);
    const cleanStores = newStores.reduce((acumulador, array) => {
      return acumulador.concat(array);
    }, []);
    for (let index = 0; index < cleanStores.length; index++) {
      for (let item = index + 1; item < cleanStores.length; item++) {
        if (
          cleanStores[index]._id.toString() == cleanStores[item]._id.toString()
        )
          cleanStores.splice(item);
      }
    }
    const result = await Promise.all(
      cleanStores.map(async (element) => {
        const { _id } = element;
        const products = await Product.find({ storeId: _id }).populate(
          "storeId"
        );
        return products;
      })
    );
    return result;
  } catch (err) {
    console.log(err);
    return { message: "Error searching in name store" };
  }
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

const searchTags = async (search) => {
  try {
    const tags = await Product.find({
      tags: { $in: new RegExp(search, "i") },
    }).populate("storeId");
    return tags;
  } catch (err) {
    console.log(err);
    return { message: "Error searching tags" };
  }
};

const searchByName = async (search) => {
  try {
    const products = await Product.find({
      $or: [
        { name: new RegExp(search, "i") },
        { description: new RegExp(search, "i") },
      ],
    }).populate("storeId");
    return products;
  } catch (err) {
    console.log(err);
    return { message: "Error searching tags" };
  }
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

const fuzzySearchProducts = async (combinations) => {
  const products = await Product.find({}).populate("storeId");
  const response = [];
  combinations.forEach((item) => {
    const search = item.join(" ");
    const fuse = new Fuse(products, {
      ignoreLocation: true,
      distance: 0,
      threshold: 0.0,
      keys: [
        "name",
        "tags",
        "storeId.name",
        "storeId.description",
        "description",
        "stock",
      ],
    });
    const filters = Array.from(fuse.search(search));
    const result = filters.map(({ item }) => item);
    response.push(result);
  });
  return response;
};

const fuzzySearchStores = async (search) => {
  const stores = await Store.find({});
  const fuse = new Fuse(stores, {
    ignoreLocation: true,
    distance: 0,
    threshold: 0.0,
    keys: ["name", "description"],
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

exports.searchProducts = async (req, res) => {
  try {
    const { search } = req.body;
    const newSearch = cleanSearch(search);
    const combinations = combineNumbers(newSearch);
    let newText = search.replace(/[-]+/g, " ");
    const offers = await getOffers(newText);
    const allTags = await searchTags(newText);
    const byName = await searchByName(newText);
    const products = await fuzzySearchProducts(combinations);
    const stores = await fuzzySearchStores(newText);
    const allProducts = offers.concat(products).concat(byName).concat(allTags);
    const productsResult = allProducts.reduce((acumulador, array) => {
      return acumulador.concat(array);
    }, []);
    const allResults = productsResult.filter((item) => item != null);
    const result = orderProducts(allResults);
    return res.send({ result: result, stores: stores });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: "Error searching products" });
  }
};
