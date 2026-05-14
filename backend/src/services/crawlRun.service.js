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

module.exports = {
  startCrawlRun,
  finishCrawlRunSuccess,
  finishCrawlRunError,
};
