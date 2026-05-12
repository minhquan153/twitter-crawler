function listCrawlRuns(req, res) {
  res.json({ message: "OK", module: "crawl-runs" });
}

module.exports = {
  listCrawlRuns,
};
