const Tweet = require("../models/tweet.model");
const { analyzeTweetContent } = require("../nlp/analyzeTweet.service");

const ALLOWED_SET_FIELDS = [
  "name",
  "handle",
  "content",
  "tweetUrl",
  "time",
  "postedAt",
  "sourceUrl",
  "coins",
  "pairs",
  "sentiment",
  "sentimentScore",
  "confidence",
  "analyzedAt",
  "hotScore",
];

function hasValue(value) {
  return value !== undefined && value !== null;
}

function normalizeTweet(rawTweet) {
  if (!rawTweet || typeof rawTweet !== "object") {
    return null;
  }

  const tweetId = hasValue(rawTweet.tweetId)
    ? String(rawTweet.tweetId).trim()
    : "";

  const content = hasValue(rawTweet.content)
    ? String(rawTweet.content).trim()
    : "";

  if (!tweetId || !content) {
    return null;
  }

  const $set = {};

  for (const field of ALLOWED_SET_FIELDS) {
    if (!hasValue(rawTweet[field])) {
      continue;
    }

    if (field === "postedAt" || field === "analyzedAt") {
      const postedAt =
        rawTweet[field] instanceof Date
          ? rawTweet[field]
          : new Date(rawTweet[field]);

      if (!Number.isNaN(postedAt.getTime())) {
        $set[field] = postedAt;
      }

      continue;
    }

    if (field === "coins" || field === "pairs") {
      $set[field] = Array.isArray(rawTweet[field])
        ? rawTweet[field].map((value) => String(value).trim()).filter(Boolean)
        : [];
      continue;
    }

    if (["sentimentScore", "confidence", "hotScore"].includes(field)) {
      $set[field] = Number(rawTweet[field]) || 0;
      continue;
    }

    $set[field] =
      typeof rawTweet[field] === "string"
        ? rawTweet[field].trim()
        : rawTweet[field];
  }

  $set.content = content;

  return {
    updateOne: {
      filter: { tweetId },
      update: {
        $set,
        $setOnInsert: { tweetId },
      },
      upsert: true,
    },
  };
}

async function enrichTweet(rawTweet) {
  const content = hasValue(rawTweet?.content) ? String(rawTweet.content).trim() : "";

  if (!content) {
    return rawTweet;
  }

  const analysis = await analyzeTweetContent(content, rawTweet.postedAt);

  return {
    ...rawTweet,
    ...analysis,
  };
}

async function saveTweets(tweets) {
  if (!Array.isArray(tweets)) {
    throw new TypeError("tweets must be an array");
  }

  const enrichedTweets = [];

  for (const tweet of tweets) {
    enrichedTweets.push(await enrichTweet(tweet));
  }

  const operations = enrichedTweets.map(normalizeTweet).filter(Boolean);

  if (operations.length === 0) {
    return {
      inserted: 0,
      matched: 0,
      modified: 0,
      total: 0,
    };
  }

  const result = await Tweet.bulkWrite(operations, { ordered: false });

  return {
    inserted: result.upsertedCount || 0,
    matched: result.matchedCount || 0,
    modified: result.modifiedCount || 0,
    total: operations.length,
  };
}

function escapeRegex(value = "") {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeSort(value) {
  const allowedSorts = new Set([
    "latest",
    "oldest",
    "recentlyCrawled",
    "oldestCrawled",
  ]);

  return allowedSorts.has(value) ? value : "latest";
}

function getSortOption(sort) {
  if (sort === "oldest") {
    return { postedAt: 1, createdAt: 1 };
  }

  if (sort === "recentlyCrawled") {
    return { updatedAt: -1, createdAt: -1 };
  }

  if (sort === "oldestCrawled") {
    return { updatedAt: 1, createdAt: 1 };
  }

  return { postedAt: -1, createdAt: -1 };
}

function buildTweetFilter(query = {}) {
  const search = query.search?.trim();
  const handle = query.handle?.trim();
  const sourceUrl = query.sourceUrl?.trim();
  const filter = {};

  if (search) {
    filter.content = {
      $regex: escapeRegex(search),
      $options: "i",
    };
  }

  if (handle) {
    filter.handle = {
      $regex: escapeRegex(handle),
      $options: "i",
    };
  }

  if (sourceUrl) {
    filter.sourceUrl = sourceUrl;
  }

  if (query.fromDate || query.toDate) {
    filter.postedAt = {};

    if (query.fromDate) {
      filter.postedAt.$gte = new Date(query.fromDate);
    }

    if (query.toDate) {
      filter.postedAt.$lte = new Date(query.toDate);
    }
  }

  return filter;
}

async function getTweets(query = {}) {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 100);
  const sort = normalizeSort(query.sort);
  const filter = buildTweetFilter(query);

  const sortOption = getSortOption(sort);

  const total = await Tweet.countDocuments(filter);

  const data = await Tweet.find(filter)
    .sort(sortOption)
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    sort,
  };
}

async function importTweets(payload) {
  const tweets = Array.isArray(payload) ? payload : payload?.data;

  if (!Array.isArray(tweets)) {
    throw new TypeError("import payload must be an array or { data: [...] }");
  }

  return saveTweets(tweets);
}

async function exportTweets() {
  const data = await Tweet.find({})
    .sort({ postedAt: -1, createdAt: -1 })
    .lean();

  return {
    exportedAt: new Date().toISOString(),
    total: data.length,
    data,
  };
}

async function deleteTweet(id) {
  const deletedTweet = await Tweet.findByIdAndDelete(id).lean();

  if (!deletedTweet) {
    return null;
  }

  return deletedTweet;
}

async function deleteTweets(ids) {
  if (!Array.isArray(ids)) {
    throw new TypeError("ids must be an array");
  }

  const result = await Tweet.deleteMany({
    _id: { $in: ids },
  });

  return {
    deleted: result.deletedCount || 0,
  };
}

async function deleteAllTweets(query = {}) {
  const filter = buildTweetFilter(query);
  const result = await Tweet.deleteMany(filter);

  return {
    deleted: result.deletedCount || 0,
  };
}

module.exports = {
  getTweets,
  saveTweets,
  importTweets,
  exportTweets,
  deleteTweet,
  deleteTweets,
  deleteAllTweets,
};
