const express = require("express");
const router = express.Router();
const { uploadBuffer } = require("../../utils/multer");
const AuthController = require("../../controller/auth.controller");
const {validateSignup,validateLogin}=require("../../validateField/validate")

router.route("/login").post(validateLogin,AuthController.login);
router.route("/signup").post(uploadBuffer.any(), validateSignup,AuthController.signup);

module.exports = router;
