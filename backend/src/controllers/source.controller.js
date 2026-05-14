const sourceService = require("../services/source.service");
const crawlService = require("../services/crawl.service");

async function listSources(req, res) {
  const result = await sourceService.listSources();
  res.json(result);
}

async function createSource(req, res) {
  const result = await sourceService.createSource(req.body);
  res.status(result.created ? 201 : 200).json(result);
}

async function updateSource(req, res) {
  const updatedSource = await sourceService.updateSource(req.params.id, req.body);

  if (!updatedSource) {
    return res.status(404).json({ message: "Source not found" });
  }

  res.json({
    message: "Source updated",
    data: updatedSource,
  });
}

async function removeSource(req, res) {
  const deletedSource = await sourceService.deleteSource(req.params.id);

  if (!deletedSource) {
    return res.status(404).json({ message: "Source not found" });
  }

  res.json({
    message: "Source deleted",
    data: deletedSource,
  });
}

async function runSourceNow(req, res, next) {
  try {
    const result = await crawlService.runSourceCrawl(req.params.id);

    res.json({
      message: result.skipped ? "Source skipped" : "Source crawled",
      data: result,
    });
  } catch (error) {
    if (error.message === "Crawl source not found"){
      return res.status(404).json({ message: "Source not found" });
    }

    next(error);
  }
}

module.exports = {
  listSources,
  createSource,
  updateSource,
  removeSource,
  runSourceNow,
};
