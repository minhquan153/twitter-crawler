const mongoose = require("mongoose");

const crawlSourceSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    enabled: {
      type: Boolean,
      default: true,
    },
    intervalMinutes: {
      type: Number,
      default: 30,
      min: 1,
      max: 1440,
    },
    nextRunAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    lastCrawledAt: {
      type: Date,
    },
    lastStatus: {
      type: String,
      enum: ["idle", "running", "success", "error"],
      default: "idle",
    },
    lastError: {
      type: String,
    },
    lastResult: {
      crawled: Number,
      inserted: Number,
      matched: Number,
      modified: Number,
      total: Number,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("CrawlSource", crawlSourceSchema);
