const crawlService = require("../services/crawl.service");

async function crawlX(req, res, next) {
  try {
    const result = await crawlService.crawlXUrl(req.body.url);

    res.json({
      message: "Crawl completed",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  crawlX,
};
