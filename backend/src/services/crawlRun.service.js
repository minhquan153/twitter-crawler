const CrawlRun = require("../models/crawlRun.model");

async function startCrawlRun({ url, runType = "manual", sourceId = null }) {
  return CrawlRun.create({
    url,
    runType,
    sourceId,
    status: "running",
    startedAt: new Date(),
  });
}

async function finishCrawlRunSuccess(id, result) {
  return CrawlRun.findByIdAndUpdate(
    id,
    {
      status: "success",
      finishedAt: new Date(),
      crawled: result.crawled,
      inserted: result.inserted,
      matched: result.matched,
      modified: result.modified,
    },
    { new: true }
  ).lean();
}

async function finishCrawlRunError(id, error) {
  return CrawlRun.findByIdAndUpdate(
    id,
    {
      status: "error",
      finishedAt: new Date(),
      error: error.message,
    },
    { new: true }
  ).lean();
}

async function listRuns(query = {}) {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 100);

  const filter = {};

  if (query.status) {
    filter.status = query.status;
  }

  if (query.sourceId) {
    filter.sourceId = query.sourceId;
  }

  if (query.runType) {
    filter.runType = query.runType;
  }

  const total = await CrawlRun.countDocuments(filter);
  const data = await CrawlRun.find(filter)
    .sort({ startedAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

}

module.exports = {
  startCrawlRun,
  finishCrawlRunSuccess,
  finishCrawlRunError,
  listRuns,
};
