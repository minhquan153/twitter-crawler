const Tweet = require("../models/tweet.model");

function getMainSentiment(item) {
  const counts = [
    ["positive", item.positive],
    ["negative", item.negative],
    ["neutral", item.neutral],
    ["unknown", item.unknown],
  ];

  return counts.sort((a, b) => b[1] - a[1])[0][0];
}

async function getCryptoReport() {
  const rows = await Tweet.aggregate([
    {
      $match: {
        coins: { $exists: true, $ne: [] },
      },
    },
    {
      $unwind: "$coins",
    },
    {
      $group: {
        _id: "$coins",
        total: { $sum: 1 },
        positive: {
          $sum: { $cond: [{ $eq: ["$sentiment", "positive"] }, 1, 0] },
        },
        negative: {
          $sum: { $cond: [{ $eq: ["$sentiment", "negative"] }, 1, 0] },
        },
        neutral: {
          $sum: { $cond: [{ $eq: ["$sentiment", "neutral"] }, 1, 0] },
        },
        unknown: {
          $sum: { $cond: [{ $eq: ["$sentiment", "unknown"] }, 1, 0] },
        },
        sentimentScore: { $avg: "$sentimentScore" },
        hotScore: { $sum: "$hotScore" },
      },
    },
    {
      $sort: {
        hotScore: -1,
        total: -1,
        _id: 1,
      },
    },
  ]);

  return rows.map((row) => {
    const item = {
      asset: row._id,
      total: row.total,
      positive: row.positive,
      negative: row.negative,
      neutral: row.neutral,
      unknown: row.unknown,
      sentimentScore: Number((row.sentimentScore || 0).toFixed(4)),
      hotScore: Number((row.hotScore || 0).toFixed(4)),
    };

    return {
      ...item,
      mainSentiment: getMainSentiment(item),
    };
  });
}

module.exports = {
  getCryptoReport,
};
