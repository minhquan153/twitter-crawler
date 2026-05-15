const CrawlSource = require("../models/crawlSource.model");

const ALLOWED_HOSTS = new Set([
  "x.com",
  "www.x.com",
  "twitter.com",
  "www.twitter.com",
]);

function normalizeSourceUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== "string") {
    throw new Error("Source URL is required");
  }

  const urlText = rawUrl.trim();

  if (!urlText) {
    throw new Error("Source URL is required");
  }

  const urlWithProtocol = /^https?:\/\//i.test(urlText)
    ? urlText
    : `https://${urlText}`;

  let parsedUrl;

  try {
    parsedUrl = new URL(urlWithProtocol);
  } catch (error) {
    throw new Error("Invalid source URL");
  }

  const hostname = parsedUrl.hostname.toLowerCase();

  if (!ALLOWED_HOSTS.has(hostname)) {
    throw new Error("Source URL must be x.com or twitter.com");
  }

  parsedUrl.protocol = "https:";
  parsedUrl.hash = "";
  parsedUrl.search = "";
  parsedUrl.hostname = hostname.replace(/^www\./, "");

  return parsedUrl.toString().replace(/\/$/, "");
}

async function listSources() {
  const data = await CrawlSource.find({})
    .sort({ createdAt: -1 })
    .lean();

  return {
    data,
    total: data.length,
  };
}

async function createSource(input = {}) {
  const url = normalizeSourceUrl(input.url);

  const intervalMinutes = input.intervalMinutes === undefined
    ? 30
    : Number(input.intervalMinutes);

  if (!Number.isInteger(intervalMinutes) || intervalMinutes < 1 || intervalMinutes > 1440) {
    throw new Error("intervalMinutes must be an integer from 1 to 1440");
  }

  const enabled = input.enabled === undefined
    ? true
    : input.enabled;

  if (typeof enabled !== "boolean") {
    throw new Error("enabled must be a boolean");
  }

  const existingSource = await CrawlSource.findOne({ url }).lean();

  if (existingSource) {
    return {
      created: false,
      data: existingSource,
    };
  }

  const source = await CrawlSource.create({
    url,
    intervalMinutes,
    enabled,
    nextRunAt: new Date(),
  });

  return {
    created: true,
    data: source.toObject(),
  };
}

async function updateSource(id, input = {}) {
  const update = {};
  let nextIntervalMinutes = null;

  if (input.url !== undefined) {
    update.url = normalizeSourceUrl(input.url);
  }

  if (input.intervalMinutes !== undefined) {
    const intervalMinutes = Number(input.intervalMinutes);

    if (!Number.isInteger(intervalMinutes) || intervalMinutes < 1 || intervalMinutes > 1440) {
      throw new Error("intervalMinutes must be an integer from 1 to 1440");
    }

    update.intervalMinutes = intervalMinutes;
    nextIntervalMinutes = intervalMinutes;
  }

  if (input.enabled !== undefined) {
    if (typeof input.enabled !== "boolean") {
      throw new Error("enabled must be a boolean");
    }

    update.enabled = input.enabled;
  }

  if (input.enabled === true) {
    if (nextIntervalMinutes === null) {
      const source = await CrawlSource.findById(id).select("intervalMinutes").lean();

      if (!source) {
        return null;
      }

      nextIntervalMinutes = source.intervalMinutes;
    }

    update.nextRunAt = new Date(
      Date.now() + nextIntervalMinutes * 60 * 1000
    );
  }

  const updatedSource = await CrawlSource.findByIdAndUpdate(
    id,
    update,
    {
      returnDocument: "after",
      runValidators: true,
    }
  ).lean();

  return updatedSource;
}

async function deleteSource(id) {
  const deletedSource = await CrawlSource.findByIdAndDelete(id).lean();

  if (!deletedSource) {
    return null;
  }

  return deletedSource;
}

async function getDueSources() {
  return CrawlSource.find({
    enabled: true,
    nextRunAt: { $lte: new Date() },
    lastStatus: { $ne: "running" },
  })
    .sort({ nextRunAt: 1 })
    .lean();
}

module.exports = {
  normalizeSourceUrl,
  listSources,  
  createSource,
  updateSource,
  deleteSource,
  getDueSources,
};
