"use strict";

const { removeStopwords, spa } = require("stopword");
const Store = require("../store/store.model");
const Product = require("./product.model");
const { offerWords } = require("./keywords");

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

const fuzzySearch = (combinations) => {
  // console.log(combinations);
};

exports.searchProducts = async (req, res) => {
  try {
    const { search } = req.body;
    const offers = await getOffers(search);
    const allTags = await searchTags(search);
    const byName = await searchByName(search);
    const newSearch = cleanSearch(search);
    const combinations = combineNumbers(newSearch);
    // Buscar en nombre producto
    const product = await searchInNameDesc(combinations);
    // Buscar en tags
    const tags = await searchInTags(combinations);
    // Buscar en nombre tienda
    const store = await searchInStoreDesc(combinations);
    const recoverySearch = await fuzzySearch(combinations);
    const allProducts = offers
      .concat(allTags)
      .concat(byName)
      .concat(tags)
      .concat(product)
      .concat(store)
      .concat(recoverySearch);
    const productsResult = allProducts.reduce((acumulador, array) => {
      return acumulador.concat(array);
    }, []);
    const allResults = productsResult.filter((item) => item != null);
    const result = orderProducts(allResults);
    return res.send({ result });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: "Error searching products" });
  }
};
