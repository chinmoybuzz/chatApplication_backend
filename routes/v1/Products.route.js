const express = require("express");
const router = express.Router();
const { uploadBuffer } = require("../../utils/multer");
const ProductController = require("../../controller/product.controller");

router.route("/list").get(ProductController.ProductList);
router.route("/add").post(uploadBuffer.any(), ProductController.ProductAdd);

module.exports = router;
