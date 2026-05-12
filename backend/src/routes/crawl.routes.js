const express = require("express");
const crawlController = require("../controllers/crawl.controller");

const router = express.Router();

router.post("/x", crawlController.crawlX);

module.exports = router;
