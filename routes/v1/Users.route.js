const express = require("express");
const router = express.Router();
const { uploadBuffer } = require("../../utils/multer");
const AuthController = require("../../controller/auth.controller");

router.route("/list").get(AuthController.login);
router.route("/add").post(uploadBuffer.any(), AuthController.signup);

module.exports = router;
