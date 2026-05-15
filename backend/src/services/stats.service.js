const Tweet = require("../models/tweet.model");
const CrawlSource = require("../models/crawlSource.model");
const CrawlRun = require("../models/crawlRun.model");

async function getOverview() {
  const totalTweets = await Tweet.countDocuments({});

  const enabledSources = await CrawlSource.countDocuments({
    enabled: true,
  });

  const lastRun = await CrawlRun.findOne({})
    .sort({ startedAt: -1 })
    .lean();

  const errorRuns = await CrawlRun.countDocuments({
    status: "error",
  });

  const topHandles = await Tweet.aggregate([
    {
      $match: {
        handle: { $nin: [null, ""] },
      },
    },
    {
      $group: {
        _id: "$handle",
        total: { $sum: 1 },
      },
    },
    {
      $sort: { total: -1 },
    },
    {
      $limit: 10,
    },
  ]);

  const topSources = await Tweet.aggregate([
    {
      $match: {
        sourceUrl: { $nin: [null, ""] },
      },
    },
    {
      $group: {
        _id: "$sourceUrl",
        total: { $sum: 1 },
      },
    },
    {
      $sort: { total: -1 },
    },
    {
      $limit: 10,
    },
  ]);

  return {
    totalTweets,
    enabledSources,
    lastRun,
    errorRuns,
    topHandles,
    topSources,
  };
}

module.exports = {
  getOverview,
};
