function getImportTweets(payload) {
  return Array.isArray(payload) ? payload : payload?.data;
}

function validateImportTweetsBody(body = {}) {
  const errors = [];
  const tweets = getImportTweets(body);

  if (!Array.isArray(tweets)) {
    errors.push({
      field: "body",
      message: "body must be an array or { data: [...] }",
    });

    return errors;
  }

  tweets.forEach((tweet, index) => {
    if (!tweet || typeof tweet !== "object") {
      errors.push({
        field: `tweets[${index}]`,
        message: "tweet must be an object",
      });

      return;
    }

    if (
      tweet.tweetId === undefined ||
      tweet.tweetId === null ||
      !String(tweet.tweetId).trim()
    ) {
      errors.push({
        field: `tweets[${index}].tweetId`,
        message: "tweetId is required",
      });
    }

    if (
      tweet.content === undefined ||
      tweet.content === null ||
      !String(tweet.content).trim()
    ) {
      errors.push({
        field: `tweets[${index}].content`,
        message: "content is required",
      });
    }
  });

  return errors;
}

module.exports = {
  importTweetsSchema: {
    body: validateImportTweetsBody,
  },
};
