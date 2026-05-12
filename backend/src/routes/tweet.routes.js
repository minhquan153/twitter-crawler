const express = require("express");
const tweetController = require("../controllers/tweet.controller");
const adminAuth = require("../middleware/adminAuth");
const validateObjectId = require("../middleware/validateObjectId");

const router = express.Router();

router.get("/", tweetController.listTweets);
router.get("/export", adminAuth, tweetController.exportTweetData);
router.post("/import", adminAuth, tweetController.importTweetData);
router.delete(
  "/:id",
  adminAuth,
  validateObjectId,
  tweetController.removeTweet
);


module.exports = router;
