const express = require("express");
const crawlController = require("../controllers/crawl.controller");
const adminAuth = require("../middleware/adminAuth");
const validateRequest = require("../middleware/validateRequest");
const { crawlUrlSchema } = require("../middleware/crawl.validator");

const router = express.Router();

router.post(
  "/x",
  adminAuth,
  validateRequest(crawlUrlSchema),
  crawlController.crawlX
);

module.exports = router;
