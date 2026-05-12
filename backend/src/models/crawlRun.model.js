const mongoose = require("mongoose");

const crawlRunSchema = new mongoose.Schema(
  {
    runType: {
      type: String,
      enum: ["manual", "auto"],
      required: true,
      index: true,
    },
    sourceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CrawlSource",
      index: true,
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["running", "success", "error"],
      required: true,
      index: true,
    },
    startedAt: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
    finishedAt: {
      type: Date,
    },
    crawled: {
      type: Number,
      default: 0,
    },
    inserted: {
      type: Number,
      default: 0,
    },
    matched: {
      type: Number,
      default: 0,
    },
    modified: {
      type: Number,
      default: 0,
    },
    error: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("CrawlRun", crawlRunSchema);
