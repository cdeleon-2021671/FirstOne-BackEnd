"use strict";

const jwt = require("jsonwebtoken");

exports.createToken = async (user) => {
  try {
    let payload = {
      sub: user._id,
      name: user.name,
      email: user.email,
      rol: user.rol,
      state: user.state,
      stores: user.stores,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 60 * 120,
    };
    return jwt.sign(payload, `${process.env.SECRET_KEY}`);
  } catch (err) {
    console.log(err);
  }
};
