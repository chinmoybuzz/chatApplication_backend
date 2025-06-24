const express = require("express");
const router = express.Router();

router.use("/auth", require("../routes/v1/Auth.route"));
router.use("/users", require("../routes/v1/Users.route"));

module.exports = router;
