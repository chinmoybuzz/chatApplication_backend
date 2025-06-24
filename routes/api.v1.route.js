const express = require("express");
const router = express.Router();

router.use("/auth", require("../routes/v1/Auth.route"));

module.exports = router;
