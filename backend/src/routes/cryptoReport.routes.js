const express = require("express");
const cryptoReportController = require("../controllers/cryptoReport.controller");

const router = express.Router();

router.get("/", cryptoReportController.getCryptoReport);

module.exports = router;
