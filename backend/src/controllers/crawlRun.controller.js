const crawlRunService = require("../services/crawlRun.service");

async function listCrawlRuns(req, res, next) {
  try {
    const result = await crawlRunService.listRuns(req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listCrawlRuns,
};
