const express = require("express");
const route = express.Router();
const mongoose = require('mongoose')

const Product = require('../models/products')

route.get("/", (req, res, next) => {
  Product.find()
  .exec()
  .then((response) => {
    res.status(200).json(response)
  })
  .catch((err) => {
    res.status(500).json({
      error : err
    })
  })
});

route.post("/", (req, res, next) => {
  const product = new Product({
    _id: new mongoose.Types.ObjectId,
    name: req.body.name,
    price: req.body.price
  })

  product
    .save()
    .then(response => {
      console.log(response);
      res.status(201).json({
        message: "Handling POST reqiest to /product",
        createdProduct: response
      });
    })
    .catch(err => {
      console.log(err)
      res.status(500).json({
        error : err
      })
    }
    )


});

route.get("/:productId", (req, res, next) => {
  const id = req.params.productId;
  Product.findById(id)
    .exec()
    .then(result => {
      console.log(result);
      
      if(result){
        res.status(200).json(result)
      }else{
        res.status(404).json({
          message : "Data do not Exist at that ID"
        })
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      })
    })
});

route.patch("/:productId", (req, res, next) => {
  const id = req.params.productId
  const updateOps = {}
  for(const ops of req.body){
    updateOps[ops.propName] = ops.value
  }
  Product.update({_id : id}, {$set: updateOps })
  .exec()
  .then(response =>{
    res.status(200).json(response)
  })
  .catch(err => {
    res.status(500).json({
      error : err
    })
  })
});

route.delete("/:productId", (req, res, next) => {
  const id = req.params.productId
  Product.remove({_id: id})
  .exec()
  .then(response =>{
    res.status(200).json(response)
  })
  .catch(err => {
    res.status(500).json({
      error : err   
    })
  })
});

module.exports = route;
