const mongoose = require("mongoose");

const tweetSchema = new mongoose.Schema(
  {
    tweetId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    name: {
      type: String,
      trim: true,
    },
    handle: {
      type: String,
      index: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    tweetUrl: {
      type: String,
      trim: true,
    },
    time: {
      type: String,
      trim: true,
    },
    postedAt: {
      type: Date,
      index: true,
    },
    sourceUrl: {
      type: String,
      index: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Tweet", tweetSchema);
