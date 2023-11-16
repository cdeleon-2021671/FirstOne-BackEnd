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

exports.createProducts = async (item, id) => {
  try {
    const product = {
      storeId: id,
      idProduct: item.id[0],
      urlProduct: item.link && item.link[0],
      name: item.title && convert(item.title[0]),
      description: item.description && convert(item.description[0]),
      price: item.price && item.price[0],
      salePrice: item["sale_price"] ? item["sale_price"][0] : "",
      saleEndDate: item["sale_end_date"] ? item["sale_end_date"][0] : "",
      saleStartDate: item["sale_start_date"] ? item["sale_start_date"][0] : "",
      tags:
        item["product_type"] &&
        item["product_type"].join(";").replace(/&gt/g, "").split(";"),
      stock: item["product_type"] && item.availability[0],
      quantity: item.quantity ? item.quantity[0] : "",
      image: item["image_link"] && item["image_link"][0],
    };
    const keys = Object.keys(product);
    let flag = false;
    for (const key of keys) {
      const value = product[key];
      if (value == undefined || typeof value == undefined) flag = true;
    }
    if (flag) return;
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
    const { storeId } = req.body;
    const store = await Store.findOne({ _id: storeId });
    if (!store)
      return res.status(404).send({ message: "Tienda no encontrada" });
    const { xml } = store;
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
      const product = await Product.findOne({
        idProduct: element.id[0],
        storeId: storeId,
      });
      if (product) continue;
      this.createProducts(element, storeId);
    }
    // Activar tienda
    await store.updateOne({ state: "ACTIVA" });
    return res.send({ message: "Products added successfully" });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: "Error adding products" });
  }
};

// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    let allProducts = await Product.find({}).populate({
      path: "storeId",
      match: {
        state: "ACTIVA",
      },
    });
    allProducts = allProducts.filter((item) => item.storeId != null);
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
    let products = await Product.find({})
      .populate({
        path: "storeId",
        match: {
          state: "ACTIVA",
        },
      })
      .sort({ views: "desc" });
    products = products.filter((item) => item.storeId != null);
    return res.send({ products });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: "Error getting most viewed" });
  }
};

// Get offers
exports.getAllOffers = async (req, res) => {
  try {
    let allOffers = await Product.find({
      $or: [
        { salePrice: { $gt: 0 } },
        {
          tags: {
            $in: new RegExp("ofer", "i"),
          },
        },
      ],
    }).populate({
      path: "storeId",
      match: {
        state: "ACTIVA",
      },
    });
    allOffers = allOffers.filter((item) => item.storeId != null);
    return res.send({ allOffers });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: "Error getting offers" });
  }
};

// Get trending 48 hours
exports.getTrending = async (req, res) => {
  try {
    const info = req.body;
    const data = info.map((item) => {
      const { storeId, idProduct } = item;
      const product = {
        storeId: storeId,
        idProduct: idProduct,
      };
      return product;
    });
    const result = [];
    for (const element of data) {
      let product = await Product.findOne(element).populate({
        path: "storeId",
        match: {
          state: "ACTIVA",
        },
      });
      if (!product || product.storeId == null) continue;
      result.push(product);
    }
    return res.send({ result });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: "Error getting trending" });
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
      }).populate({
        path: "storeId",
        match: {
          state: "ACTIVA",
        },
      });
      tags = tags.filter((item) => item.storeId != null);
      products.push(tags);
    }
    for (const element of tags) {
      let tags = await Product.find({
        tags: {
          $in: new RegExp(element, "i"),
        },
        storeId: storeId,
      }).populate({
        path: "storeId",
        match: {
          state: "ACTIVA",
        },
      });
      tags = tags.filter((item) => item.storeId != null);
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
      let products = await Product.find({
        storeId: storeId,
      })
        .populate({
          path: "storeId",
          match: {
            state: "ACTIVA",
          },
        })
        .sort({ view: "desc" });
      products = products.filter((item) => item.storeId != null);
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
      }).populate({
        path: "storeId",
        match: {
          state: "ACTIVA",
        },
      });
      products = products.filter((item) => item.storeId != null);
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
      }).populate({
        path: "storeId",
        match: {
          state: "ACTIVA",
        },
      });
      products = products.filter((item) => item.storeId != null);
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
    let products = await Product.find({})
      .select("name tags")
      .populate({
        path: "storeId",
        match: {
          state: "ACTIVA",
        },
      });
    products = products.filter((item) => item.storeId != null);
    const stores = await Store.find({ state: "ACTIVA" }).select("name");
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
    let allProducts = await Product.find().populate({
      path: "storeId",
      match: {
        state: "ACTIVA",
      },
    });
    allProducts = allProducts.filter((item) => item.storeId != null);
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
        let elements = await Product.find({
          $or: [
            { name: new RegExp(item, "i") },
            {
              tags: {
                $in: new RegExp(item, "i"),
              },
            },
          ],
        }).populate({
          path: "storeId",
          match: {
            state: "ACTIVA",
          },
        });
        elements = elements.filter((item) => item.storeId != null);
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

exports.updateView = async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findOne({ _id: productId });
    if (!product)
      return res.status(404).send({ message: "Producto no encontrado" });
    const { views } = product;
    const addView = parseInt(views) + 1;
    await product.updateOne({ views: addView });
    return res.send({ message: "View added successfully" });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: "Error updating views" });
  }
};
