const express = require("express");
const router = express.Router();
const { uploadBuffer } = require("../../utils/multer");
const AuthController = require("../../controller/user.controller");

router.route("/list").get(AuthController.UserList);
router.route("/add").post(uploadBuffer.any(), AuthController.UserAdd);

module.exports = router;
