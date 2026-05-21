const mongoose = require("mongoose");

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

function validateDeleteManyTweetsBody(body = {}) {
  const errors = [];
  const ids = body?.ids;

  if (!Array.isArray(ids) || ids.length === 0) {
    errors.push({
      field: "ids",
      message: "ids must be a non-empty array",
    });

    return errors;
  }

  ids.forEach((id, index) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      errors.push({
        field: `ids[${index}]`,
        message: "id must be a valid ObjectId",
      });
    }
  });

  return errors;
}

function validateDeleteAllTweetsBody(body = {}) {
  const errors = [];

  for (const field of ["search", "handle", "sourceUrl", "fromDate", "toDate"]) {
    if (
      body[field] !== undefined &&
      body[field] !== null &&
      typeof body[field] !== "string"
    ) {
      errors.push({
        field,
        message: `${field} must be a string`,
      });
    }
  }

  return errors;
}

module.exports = {
  importTweetsSchema: {
    body: validateImportTweetsBody,
  },
  deleteManyTweetsSchema: {
    body: validateDeleteManyTweetsBody,
  },
  deleteAllTweetsSchema: {
    body: validateDeleteAllTweetsBody,
  },
};
