const express = require("express");
const statsController = require("../controllers/stats.controller");

const router = express.Router();

router.get("/overview", statsController.getOverview);

module.exports = router;
