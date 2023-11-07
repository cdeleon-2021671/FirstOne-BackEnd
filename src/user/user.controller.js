"use strict";

const User = require("./user.model");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { createToken } = require("../utils/validate");

exports.getInfo = async (req, res) => {
  try {
    return res.send({ user: req.user });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: "Error getting info" });
  }
};

exports.adminDefault = async () => {
  try {
    const adminDefault = {
      name: "Admin Default",
      email: "admin",
      password: "admin",
      rol: "MAESTRO",
      state: "ACTIVE",
    };
    const adminExists = await User.findOne({ email: "admin" }, { password: 0 });
    if (adminExists) return console.log("Admin already exists");
    adminDefault.password = bcrypt.hashSync(adminDefault.password, 10);
    const newAdmin = new User(adminDefault);
    await newAdmin.save();
    return console.log("Admin was created");
  } catch (err) {
    return console.log(err);
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });
    if (!user)
      return res.status(404).send({ message: "El correo no es correcto" });
    const pass = bcrypt.compareSync(password, user.password);
    if (pass == false)
      return res.status(404).send({ message: "La contraseña no es correcta" });
    const token = await createToken(user);
    return res.send({ message: "Usuario verificado con éxito", token, user });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: "Error, not logged" });
  }
};

exports.createUser = async (req, res) => {
  try {
    const data = req.body;
    data.password = bcrypt.hashSync(data.password, 10);
    const newUser = new User(data);
    const payload = {
      email: data.email,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 60 * 60,
    };
    const register = jwt.sign(payload, `${process.env.SECRET_KEY}`);
    await newUser.save();
    return res.send({ message: "User created successfully", register });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: "Error creating account" });
  }
};

exports.updateStores = async (req, res) => {
  try {
    const { register, email, storeId } = req.body;
    let account = email;
    if (register) {
      const { email } = jwt.decode(register, `${process.env.SECRET_KEY}`);
      account = email;
    }
    const user = await User.findOne({ email: account });
    if (!user) return res.status(404).send({ message: "Cuenta no encontrada" });
    await user.updateOne({
      $push: { stores: { storeId: storeId } },
    });
    await User.updateMany(
      { boss: user._id },
      {
        $push: { stores: { storeId: storeId } },
      },
      { new: true }
    );
    return res.send({ message: "Tienda agregada satisfactoriamente" });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: "Error updating account" });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findOne(
      { _id: userId },
      { password: 0, rol: 0 }
    ).populate("stores.storeId");
    if (!user)
      return res.status(404).send({ message: "Usuario no encontrado" });
    return res.send({ user });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: "Error getting user" });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, { password: 0 });
    return res.send({ users });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: "Error getting user" });
  }
};

exports.getWorkers = async (req, res) => {
  try {
    const { bossId } = req.params;
    const users = await User.find(
      { rol: "TRABAJADOR", boss: bossId },
      { password: 0 }
    ).populate("stores.storeId");
    return res.send({ users });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: "Error getting user" });
  }
};

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.MAIL,
    pass: process.env.KEY_MAIL,
  },
});

exports.sendMail = async (req, res) => {
  try {
    const { form, newCode } = req.body;
    const { name, email } = form;
    const user = await User.findOne({ email: email });
    if (user)
      return res.status(400).send({ message: "Cuenta con correo existente" });
    if (email == undefined || email == "" || email == " ")
      return res.status(400).send({ message: "Email is required" });
    await transporter.sendMail({
      from: "Tienda.gt <tienda.gt@gmail.com>", // sender address
      to: email, // list of receivers
      subject: "Código de verificación", // Subject line
      text: `Estimado ${name}. Su código de verificación es: ${newCode}`, // plain text body
    });
    const payload = {
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 60 * 60,
    };
    const token = jwt.sign(payload, `${process.env.SECRET_KEY}`);
    return res.send({ message: "Correo de seguridad enviado", token });
  } catch (err) {
    console.log(err);
    return res.send({ message: "Error creating message" });
  }
};

exports.validateCode = (req, res) => {
  try {
    const { token } = req.body;
    const payload = jwt.decode(token, `${process.env.SECRET_KEY}`);
    if (Math.floor(Date.now() / 1000) >= payload.exp)
      return res.status(400).send({ message: "Tiempo de espera agotado" });
    return res.send({ message: "Verificado satisfactoriamente" });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: "Error validating code" });
  }
};
