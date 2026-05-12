const express = require("express");
const crawlRunController = require("../controllers/crawlRun.controller");

const router = express.Router();

router.get("/", crawlRunController.listCrawlRuns);

module.exports = router;
