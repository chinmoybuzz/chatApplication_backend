const ProductService = require("../services/product.service");


const ProductList= async (req, res) => {
  try {
    const result = await ProductService.ProductList({ ...req.query, ...req.params });
    return res.status(result.status).json(result);
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ status: 500, message: "Internal server error" });
  }
};


const ProductAdd = async (req, res) => {
  try {
    const result = await ProductService.ProductAdd({ ...req.body });
    return res.status(result.status).json(result);
  } catch (error) {
    console.error("Signup Error:", error);
    return res.status(500).json({ status: 500, message: "Internal server error" });
  }
};


module.exports = { ProductAdd, ProductList };
