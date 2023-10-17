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


exports.ensureAuth = (req, res, next)=>{
  if(!req.headers.authorization){
      return res.status(403).send({message: `Doesn't contain headers AUTHORIZATION`});
  }else{
      try {
          let token = req.headers.authorization.replace(/['"]+/g, '');
          var payload = jwt.decode(token, `${process.env.SECRET_KEY}`);
          if(Math.floor(Date.now()/1000)>= payload.exp)
              return res.status(401).send({message: 'Expired token'})
      } catch (err) {
          console.log(err)
          return res.status(400).send({message: 'Invalid token'})
      }
      req.user = payload
      next()
  }
}
