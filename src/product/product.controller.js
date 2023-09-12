// Utilizar el modo estricto de javascript
"use strict";

// Traer el modelo Product y de Store
const Product = require("./product.model");
const Store = require("../store/store.model");

// Add Products
exports.addProducts = async (item, id) => {
  const keys = Object.keys(item);
  const product = {};
  product.storeId = id;
  for (let key of keys) {
    if (key == "link" || key == "g:link") product.urlProduct = item[key][0];
    if (key.includes("title"))
      product.name = item[key][0].replace(/&quot;/g, `"`);
    if (key.includes("description"))
      product.description = item[key][0].replace(/&nbsp;+/g, "");
    if (key == "price" || key == "g:price") product.price = item[key][0];
    if (key == "g:sale_price") product.salePrice = item[key][0];
    if (key.includes("product_type"))
      product.tags = item[key].join(";").replace(/&gt/g, "").split(";");
    if (key.includes("availability")) product.stock = item[key][0];
    if (key.includes("image_link")) product.image = item[key][0];
  }
  if (product.stock == "in_stock" || product.stock == "in stock")
    product.stock = "Disponible";
  if (product.stock == "out of stock" || product.stock == "out_of_stock")
    product.stock = "Agotado";
  product.tags = product.tags.map((item) => item.trim());
  const newProduct = new Product(product);
  await newProduct.save();
};

// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const allProducts = await Product.find({}).populate("storeId");
    const products = [];
    for (let index = 0; index < allProducts.length; index += 18) {
      const array = allProducts.slice(index, index + 18);
      products.push(array);
    }
    return res.send({ products });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: "Error getting all products" });
  }
};

// Get product by id
exports.getProductById = async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findOne({ _id: productId }).populate(
      "storeId"
    );
    if (!product) return res.status(404).send({ message: "Product not found" });
    return res.send({ product });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: "Error getting product" });
  }
};

// Get products by store
exports.getProductByStore = async (req, res) => {
  try {
    const { storeId } = req.params;
    const result = await Product.find({ storeId: storeId }).populate("storeId");
    const products = [];
    for (let index = 0; index < 20; index += 10) {
      const array = result.slice(index, index + 10);
      products.push(array);
    }
    return res.send({ products });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: "Error getting product" });
  }
};

// Traer todas las etiquetas sin repetir
const getTags = async () => {
  try {
    const allProducts = await Product.find({});
    const allTags = [];
    allProducts.forEach((item) => {
      item.tags.forEach((e) => {
        allTags.push(e.trim());
      });
    });
    const newAllTags = allTags.filter((item) => item != "Home");
    const result = Array.from(new Set(newAllTags));
    return result;
  } catch (err) {
    console.log(err);
    return console.log("Error getting tags");
  }
};

// Traer el nombre de todas las tiendas
const getNameStore = async () => {
  try {
    const stores = await Store.find({});
    const result = stores.map((item) => {
      return item.name;
    });
    return result;
  } catch (err) {
    console.log(err);
    return console.log("Error getting name stores");
  }
};

// Traer el nombre de todos los productos
const getNameProduct = async () => {
  try {
    const products = await Product.find({});
    const result = products.map((item) => {
      return item.name;
    });
    return result;
  } catch (err) {
    console.log(err);
    return console.log("Error getting name stores");
  }
};

// Enviar opciones de autocompletado
exports.getAutoComplete = async (req, res) => {
  try {
    const tags = await getTags();
    const stores = await getNameStore();
    const products = await getNameProduct();
    const result = tags.concat(stores).concat(products);
    return res.send({ result });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: "Error gettign options" });
  }
};

// traer todas las etiquetas con un producto sin repetir
exports.getProductsOfTags = async (req, res) => {
  try {
    const tags = await getTags();
    let allProducts = await Promise.all(
      tags.map(async (item) => {
        const elements = await Product.find({
          tags: {
            $in: new RegExp(item, "i"),
          },
        }).populate("storeId");
        return { tag: item, products: elements };
      })
    );
    const result = [];
    for (const key1 in allProducts) {
      for (const key2 in allProducts[key1].products) {
        if (result.length != 0) {
          let repeat = 0;
          for (const product of result) {
            if (
              product.product._id.toString() !==
              allProducts[key1].products[key2]._id.toString()
            )
              repeat++;
          }
          if (repeat == result.length) {
            result.push({
              tag: tags[key1],
              product: allProducts[key1].products[key2],
            });
            break;
          }
        } else {
          result.push({
            tag: tags[key1],
            product: allProducts[key1].products[key2],
          });
          break;
        }
      }
    }

    return res.send({ result });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: "Error getting tags" });
  }
};

// Search products
const stopWord = require("stopword");
const axios = require("axios");

exports.searchProducts = async (req, res) => {
  try {
    const { search } = req.body;
    let tags = await Product.find({
      tags: {
        $in: new RegExp(search, "i"),
      },
    }).populate("storeId");
    let store = await Store.findOne({
      name: new RegExp(search, "i"),
    })
    let productsByStore;
    let result;
    if (store) {
      productsByStore = await Product.find({ storeId: store._id }).populate(
        "storeId"
      );
      result = tags.concat(productsByStore);
    } else {
      result = tags;
    }
    return res.send({ result });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: "Error searching products" });
  }
};
