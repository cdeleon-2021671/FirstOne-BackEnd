// Utilizar el modo estricto de javascript
"use strict";

// Traer el modelo Product y de Store
const Product = require("./product.model");
const Store = require('../store/store.model')

// Funcion para validar que todo este bien con las rutas, modelos, controlador
exports.test = (req, res) => {
  return res.send({ message: "Product test running" });
};

// Add Products
exports.addProducts = async (data, id, aditional) => {
  if (aditional === undefined)
    aditional = { salePrice: null, saleStartDate: "", saleEndDate: "", categories: '' };
  const product = {
    storeId: id,
    urlProduct: data.link[0],
    name: data.title[0],
    description: data.description[0].replace(/\r\n/g, ""),
    price: data["g:price"][0],
    salePrice: aditional.salePrice,
    saleStartDate: aditional.saleStartDate,
    saleEndDate: aditional.saleEndDate,
    categories: aditional.categories,
    tags: data["g:product_type"].join(';').replace(/&gt/g, ""),
    stock: data["g:availability"][0],
    image: data["g:image_link"][0],
  };
  const newProduct = new Product(product);
  await newProduct.save();
};
// Delete products
exports.deleteProducts = async (store) => {
  await Product.deleteMany({ storeId: store });
};
// Get products
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    return res.send({ products });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: "Error getting products" });
  }
};
// Get one product
exports.getProductById = async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findOne({ _id: productId }).populate('storeId');
    if (!product) return res.status(404).send({ message: "Product not found" });
    return res.send({ product });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: "Error getting product" });
  }
};

exports.getVivaldi = async(req, res)=>{
  try {
    const store = await Store.findOne({xml: `${process.env.VIVALDI}`});
    const products = await Product.find({storeId: store._id});
    return res.send({products});
  } catch (err) {
    return res.status(500).send({message: 'Errror getting products Vivaldi'});
  }
}

exports.getMolvu = async(req, res)=>{
  try {
    const store = await Store.findOne({xml: `${process.env.MOLVU}`});
    const products = await Product.find({storeId: store._id});
    return res.send({products});
  } catch (err) {
    return res.status(500).send({message: 'Errror getting products Molvu'});
  }
}
// Search products
exports.searchProducts = async (req, res) => {
  try {
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: "Error searching products" });
  }
};
