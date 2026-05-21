const tweetService = require("../services/tweet.service");

async function listTweets(req, res) {
  const result = await tweetService.getTweets(req.query);
  res.json(result);
}

async function importTweetData(req, res) {
  const result = await tweetService.importTweets(req.body);
  res.json(result);
}

async function exportTweetData(req, res) {
  const result = await tweetService.exportTweets();
  res.json(result);
}

async function removeTweet(req, res) {
  const deletedTweet = await tweetService.deleteTweet(req.params.id);

  if (!deletedTweet) {
    return res.status(404).json({
      message: "Tweet not found",
    });
  }

  res.json({
    message: "Tweet deleted",
    data: deletedTweet,
  });
}

async function removeTweets(req, res) {
  const result = await tweetService.deleteTweets(req.body.ids);

  res.json({
    message: "Tweets deleted",
    ...result,
  });
}

async function removeAllTweets(req, res) {
  const result = await tweetService.deleteAllTweets(req.body);

  res.json({
    message: "Tweets deleted",
    ...result,
  });
}

module.exports = {
  listTweets,
  importTweetData,
  exportTweetData,
  removeTweet,
  removeTweets,
  removeAllTweets,
};
