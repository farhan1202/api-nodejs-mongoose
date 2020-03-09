const express = require("express");
const route = express.Router();
const mongoose = require('mongoose')
const multer = require('multer')

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, './uploads/')
	},
	filename: function (req, file, cb) {
		const now = new Date().toISOString().replace(/:/g, '-')
		cb(null, now + file.originalname)
	}
})

const fileFilter = (req, file, cb) => {
	if ( file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
		cb(null, true)
	} else {
		cb(null, false)
	}


}

const upload = multer({
	storage: storage,
	limits: {
		fileSize: 1024 * 1024 * 5
	},
	fileFilter: fileFilter
})

const Product = require('../models/products')

route.get("/", (req, res, next) => {
	Product.find()
		.select('name price _id productImg')
		.exec()
		.then((response) => {
			const responseObj = {
				count: response.length,
				product: response.map(doc => {
					return {
						name: doc.name,
						price: doc.price,
						productImg: doc.productImg,
						_id: doc._id,
						request: {
							type: 'GET',
							url: 'http://localhost:3000/product/' + doc._id
						}
					}
				})
			}
			res.status(200).json(responseObj)
		})
		.catch((err) => {
			res.status(500).json({
				error: err
			})
		})
});

route.post("/", upload.single('productImg'), (req, res, next) => {
	console.log(req.file);

	const product = new Product({
		_id: new mongoose.Types.ObjectId,
		name: req.body.name,
		price: req.body.price,
		productImg: req.file.path
	})

	product
		.save()
		.then(response => {
			console.log(response);
			res.status(201).json({
				message: "Created product successfully",
				createdProduct: {
					name: response.name,
					price: response.price,
					_id: response._id,
					request: {
						type: "GET",
						url: 'http://localhost:3000/product/' + response._id
					}
				}
			});
		})
		.catch(err => {
			console.log(err)
			res.status(500).json({
				error: err
			})
		}
		)


});

route.get("/:productId", (req, res, next) => {
	const id = req.params.productId;
	Product.findById(id)
		.select('name price _id productImg')
		.exec()
		.then(result => {
			console.log(result);

			if (result) {
				res.status(200).json({
					product: result,
					request: {
						type: "GET",
						utl: 'http://localhost:3000/product/'
					}
				})
			} else {
				res.status(404).json({
					message: "Data do not Exist at that ID"
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
	for (const ops of req.body) {
		updateOps[ops.propName] = ops.value
	}
	Product.update({ _id: id }, { $set: updateOps })
		.exec()
		.then(response => {
			res.status(200).json({
				message: "Product Updated",
				request: {
					type: "GET",
					url: 'http://localhost:3000/product/' + id
				}
			})
		})
		.catch(err => {
			res.status(500).json({
				error: err
			})
		})
});

route.delete("/:productId", (req, res, next) => {
	const id = req.params.productId
	Product.remove({ _id: id })
		.exec()
		.then(response => {
			res.status(200).json({
				message: "Product deleted",
				request: {
					type: "POST",
					url: 'http://localhost:3000/product/',
					body: { name: 'String', price: 'Number' }
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
