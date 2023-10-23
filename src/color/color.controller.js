'use strict'

const Color = require('./color.model.js');

exports.test = (req, res)=>{
    try {
        const id = req.headers
        console.log(id);
    } catch (err) {
        console.log(err);
        return res.status(500).send({message: 'Error testing Color'});
    }
}