const express = require("express");
const router = express.Router();
const DashboardController = require("../../controller/dashboard.controller");

router.route("/list").get(DashboardController.Dashboard);

module.exports = router;
