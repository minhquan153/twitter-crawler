const express = require("express");
const tweetController = require("../controllers/tweet.controller");
const adminAuth = require("../middleware/adminAuth");
const validateObjectId = require("../middleware/validateObjectId");
const validateRequest = require("../middleware/validateRequest");
const {
  deleteAllTweetsSchema,
  deleteManyTweetsSchema,
  importTweetsSchema,
} = require("../middleware/tweet.validator");

const router = express.Router();

router.get("/", tweetController.listTweets);
router.get("/export", adminAuth, tweetController.exportTweetData);
router.post(
  "/import",
  adminAuth,
  validateRequest(importTweetsSchema),
  tweetController.importTweetData
);

router.post(
  "/delete-many",
  adminAuth,
  validateRequest(deleteManyTweetsSchema),
  tweetController.removeTweets
);

router.post(
  "/delete-all",
  adminAuth,
  validateRequest(deleteAllTweetsSchema),
  tweetController.removeAllTweets
);

router.delete(
  "/:id",
  adminAuth,
  validateObjectId,
  tweetController.removeTweet
);


module.exports = router;
