// Utilizar el modo estricto de javascript
"use strict";

// Traer el modelo Product y de Store
const Product = require("./product.model");
const Store = require("../store/store.model");

// Add Products
exports.addProducts = async (item, id) => {
  const keys = Object.keys(item);
  const product = {
    storeId: id,
    urlProduct: "",
    name: "",
    description: "",
    price: "",
    salePrice: "",
    saleStartDate: "",
    saleEndDate: "",
    categories: "",
    tags: "",
    stock: "",
    image: "",
  };
  for (let key of keys) {
    if (key == "link" || key == "g:link") product.urlProduct = item[key][0];
    if (key.includes("title"))
      product.name = item[key][0].replace(/&quot;/g, `"`);
    if (key.includes("description"))
      product.description = item[key][0].replace(/\r\n&nbsp;&quot+/g, "");
    if (key.includes("description")) product.description = item[key][0];
    if (key == "price" || key == "g:price") product.price = item[key][0];
    if (key == "g:sale_price") product.salePrice = item[key][0];
    if (key.includes("product_type"))
      product.tags = item[key].join(";").replace(/&gt/g, "").split(";");
    if (key.includes("availability")) product.stock = item[key][0];
    if (key.includes("image_link")) product.image = item[key][0];
  }
  const newProduct = new Product(product);
  await newProduct.save();
};

// Delete products
exports.deleteProducts = async (store) => {
  await Product.deleteMany({ storeId: store });
};

// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({});
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

// Get product by store
exports.getProductByStore = async (req, res) => {
  try {
    const { storeId } = req.params;
    const products = await Product.find({ storeId: storeId }).populate(
      "storeId"
    );
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
    const result = Array.from(new Set(allTags));
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

// Search products
const stopWord = require("stopword");
const axios = require("axios");

exports.searchProducts = async (req, res) => {
  try {
    const { search } = req.body;
    let result = await Product.find({
      tags: {
        $in: new RegExp(search, 'i'),
      },
    });
    if(result == 0) result = await Product.find({
      name: new RegExp(search, 'i')
    })
    return res.send({ result });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: "Error searching products" });
  }
};
