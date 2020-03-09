const express = require("express");
const route = express.Router();
const mongoose = require('mongoose')
const Order = require('../models/orders')
const Product = require('../models/products')

route.get("/", (req, res, next) => {
	Order.find()
		.select('product quantity _id ')
		.populate('product', 'name')
		.exec()
		.then(response => {
			res.status(200).json({
				count: response.length,
				orders: response.map(doc => {
					return {
						_id: doc._id,
						product: doc.product,
						quantity: doc.quantity.quantity,
						request: {
							type: 'GET',
							url: 'http://localhost:3000/order' + doc._id
						}
					}
				})
			})
		})
		.catch(err => {
			res.status(500).json({
				error: err
			})
		})
});
route.post("/", (req, res, next) => {
	Product.findById(req.body.productId)
		.then(product => {
			if (!product) {
				return res.status(404).json({
					message: 'Product not found'
				})
			}
			const order = new Order({
				_id: mongoose.Types.ObjectId(),
				quantity: req.body.quantity,
				product: req.body.productId
			})
			return order.save()

		})
		.then(result => {
			res.status(201).json({
				message: 'Order stored',
				createdOrder: {
					_id: result._id,
					product: result.product,
					quantity: result.quantity
				},
				request: {
					type: 'GET',
					url: 'http:/localhost:3000/order/' + result._id
				}
			})
		})
		.catch(err => {
			res.status(500).json({
				error: err
			})
		})
});
route.get("/:orderId", (req, res, next) => {
	Order.findById(req.params.orderId)
		.populate('product')
		.exec()
		.then(response => {
			if (!response) {
				return res.status(404).json({
					message: 'Order not found'
				})
			}
			res.status(200).json({
				order: response,
				request: {
					type: 'GET',
					url: 'http://localhost:3000/order'
				}
			})
		})
		.catch(err => {
			res.status(500).json({
				error: err
			})
		})
});
route.delete("/:orderId", (req, res, next) => {
	Order.remove({ _id: req.params.orderId })
		.exec()
		.then(response => {
			res.status(200).json({
				message: 'Order deleted',
				request: {
					type: 'POST',
					url: 'http://localhost:3000/order',
					body: {
						productId: "String",
						quantity: 'Number'
					}
				}
			})
		})
		.catch(err => {
			res.status(500).json({
				error: err
			})
		})
});

module.exports = route;
