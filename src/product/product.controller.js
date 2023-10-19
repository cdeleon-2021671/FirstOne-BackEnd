// Utilizar el modo estricto de javascript
"use strict";

// Traer el modelo Product y de Store
const Product = require("./product.model");
const Store = require("../store/store.model");
const { removeStopwords, spa } = require("stopword");
const { convert } = require("html-to-text");
const { stripPrefix } = require("xml2js").processors;
const xml2js = require("xml2js");
const axios = require("axios");

const createProducts = async (item, id) => {
  try {
    const product = {
      storeId: id,
      idProduct: item.id[0],
      urlProduct: item.link[0],
      name: convert(item.title[0]),
      description: convert(item.description[0]),
      price: item.price[0],
      salePrice: item["sale_price"] ? item["sale_price"][0] : "",
      saleEndDate: item["sale_end_date"] ? item["sale_end_date"][0] : "",
      saleStartDate: item["sale_start_date"] ? item["sale_start_date"][0] : "",
      tags: item["product_type"].join(";").replace(/&gt/g, "").split(";"),
      stock: item.availability[0],
      quantity: item.quantity ? item.quantity[0] : "",
      image: item["image_link"][0],
    };
    if (product.stock == "in_stock" || product.stock == "in stock")
      product.stock = "Disponible";
    if (product.stock == "out of stock" || product.stock == "out_of_stock")
      product.stock = "Agotado";

    if (product.quantity) {
      if (product.quantity > 0 && product.quantity <= 5)
        product.stock = "Casi agotado";
      else if (product.quantity > 5) product.stock = "Disponible";
      else product.stock = "Agotado";
    }
    product.tags = product.tags.map((item) => item.trim());
    const newProduct = new Product(product);
    await newProduct.save();
  } catch (err) {
    console.log(err);
  }
};

// Add Products
exports.addProducts = async (req, res) => {
  try {
    const { xml, storeId } = req.body;
    // Convertir xml
    const { data } = await axios.get(`${xml}`);
    const parser = new xml2js.Parser({
      tagNameProcessors: [stripPrefix],
      explicitRoot: false,
      normalizeTags: true,
    });
    const { channel } = await parser.parseStringPromise(data);
    // Agregar los productos a la db
    const { item } = channel[0];
    for (const element of item) {
      const product = await Product.findOne({ idProduct: element.id[0] });
      if (product) continue;
      createProducts(element, storeId);
    }
    return res.send({ message: "Products added successfully" });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: "Error adding products" });
  }
};

// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const allProducts = await Product.find({}).populate("storeId");
    for (let i = allProducts.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allProducts[i], allProducts[j]] = [allProducts[j], allProducts[i]];
    }
    return res.send({ allProducts });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: "Error getting all products" });
  }
};

// Get Most Viewd
exports.getMostViewed = async (req, res) => {
  try {
    const products = await Product.find({})
      .populate("storeId")
      .sort({ view: "desc" });
    return res.send({ products });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: "Error getting most viewed" });
  }
};

// Get offers
exports.getAllOffers = async (req, res) => {
  try {
    const allOffers = await Product.find({
      $or: [
        { salePrice: { $gt: 0 } },
        {
          tags: {
            $in: new RegExp("ofer", "i"),
          },
        },
      ],
    }).populate("storeId");
    for (let i = allOffers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allOffers[i], allOffers[j]] = [allOffers[j], allOffers[i]];
    }
    return res.send({ allOffers });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: "Error gettign offers" });
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
    const tags = Array.from(new Set(product.tags));
    const newName = product.name.replace(/[()"-+#]+/g, "");
    const keys = removeStopwords(newName.split(" "), spa);
    let category = tags[0];
    keys.forEach((name) => {
      tags.forEach((tag) => {
        if (tag.includes(name)) category = tag;
      });
    });
    return res.send({ product, category });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: "Error getting product" });
  }
};

exports.getSimilarProducts = async (req, res) => {
  try {
    const { search, storeId, name } = req.body;
    const tags = Array.from(new Set(search));
    const newName = name.replace(/[()"-+#]+/g, "");
    const keys = removeStopwords(newName.split(" "), spa);
    const products = [];
    for (const element of keys) {
      let tags = await Product.find({
        tags: {
          $in: new RegExp(element, "i"),
        },
        storeId: storeId,
      }).populate("storeId");
      products.push(tags);
    }
    for (const element of tags) {
      let tags = await Product.find({
        tags: {
          $in: new RegExp(element, "i"),
        },
        storeId: storeId,
      }).populate("storeId");
      products.push(tags);
    }
    const result = [];
    for (const element of products) {
      for (const product of element) {
        result.push(product);
      }
    }
    for (let key1 = 0; key1 < result.length; key1++) {
      for (let key2 = key1 + 1; key2 < result.length; key2++) {
        if (result[key1]._id.toString() == result[key2]._id.toString())
          result.splice(key2);
      }
    }
    if (result.length < 40) {
      const products = await Product.find({ storeId: storeId })
        .populate("storeId")
        .sort({ view: "desc" });
      result.push(...products);
    }
    const toRemove = [];
    for (let key1 = 0; key1 < result.length; key1++) {
      for (let key2 = key1 + 1; key2 < result.length; key2++) {
        if (result[key1]._id.toString() == result[key2]._id.toString()) {
          toRemove.push(result[key2]);
        }
      }
    }
    // Elimina los elementos del arreglo `result` utilizando el arreglo temporal
    for (let i = 0; i < toRemove.length; i++) {
      result.splice(result.indexOf(toRemove[i]), 1);
    }
    return res.send({ result });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: "Error getting products" });
  }
};

exports.getProductsByTag = async (req, res) => {
  try {
    const { tag } = req.body;
    let products = null;
    if (tag.includes("Ofertas")) {
      products = await Product.find({
        $or: [
          {
            tags: {
              $in: new RegExp(tag, "i"),
            },
          },
          { salePrice: { $gt: 0 } },
        ],
      }).populate("storeId");
    } else {
      products = await Product.find({
        $or: [
          { name: new RegExp(tag, "i") },
          {
            tags: {
              $in: new RegExp(tag, "i"),
            },
          },
        ],
      }).populate("storeId");
    }
    return res.send({ products });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: "Error getting products" });
  }
};
// Enviar opciones de autocompletado
exports.getAutoComplete = async (req, res) => {
  try {
    const products = await Product.find().select("name tags");
    const stores = await Store.find({state: 'ACTIVO'}).select("name");
    const tags = products.reduce((acc, item) => {
      const innerArr = item.tags;
      innerArr.forEach((innerItem) => {
        acc.push(innerItem);
      });
      return acc;
    }, []);
    const names = products.map(({ name }) => name);
    const storesName = stores.map(({ name }) => name);
    const all = tags.concat(storesName).concat(names);
    const newAllTags = all.filter((item) => item != "Home");
    const result = Array.from(new Set(newAllTags));
    return res.send({ result });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: "Error gettign options" });
  }
};

// Traer todas las etiquetas sin repetir
const getTags = async () => {
  try {
    const allProducts = await Product.find({});
    const allTags = [];
    allProducts.forEach((item) => {
      item.tags.forEach((e) => {
        const name = e.trim();
        const result = name.replace("#", "");
        allTags.push(result);
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

// traer todas las etiquetas con un producto sin repetir

exports.getProductsOfTags = async (req, res) => {
  try {
    const tags = await getTags();
    let allProducts = await Promise.all(
      tags.map(async (item) => {
        const elements = await Product.find({
          $or: [
            { name: new RegExp(item, "i") },
            {
              tags: {
                $in: new RegExp(item, "i"),
              },
            },
          ],
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
