const { launchBrowser } = require("../crawler/browser");
const { normalizeTargetUrl } = require("../utils/normalizeTargetUrl");
const { collectTweetsWhileScrolling } = require("../crawler/scroll");
const tweetService = require("./tweet.service");
const crawlRunService = require("./crawlRun.service");
const CrawlSource = require("../models/crawlSource.model");


async function crawlXUrl(rawUrl, options = {}) {
  const targetUrl = normalizeTargetUrl(rawUrl);

  const crawlRun = await crawlRunService.startCrawlRun({
    url: targetUrl,
    runType: options.runType || "manual",
    sourceId: options.sourceId || null,
  });

  let browser;

  try {
    browser = await launchBrowser({ headless: false });

    const page = await browser.newPage();

    await page.goto(targetUrl, {
      waitUntil: "domcontentloaded",
    });

    await page.waitForSelector("article[data-testid='tweet']", {
      timeout: 30000,
    });

    const tweets = await collectTweetsWhileScrolling(page, targetUrl, {
      maxScrolls: 10,
    });
    const saveResult = await tweetService.saveTweets(tweets);

    const result = {
      crawled: tweets.length,
      inserted: saveResult.inserted,
      matched: saveResult.matched,
      modified: saveResult.modified,
      total: saveResult.total,
    };

    await crawlRunService.finishCrawlRunSuccess(crawlRun._id, result);

    return result;
  } catch (error) {
    await crawlRunService.finishCrawlRunError(crawlRun._id, error);

    if (error.name === "TimeoutError") {
      const friendlyError = new Error(
        "No tweets found. Please check X login session or target URL."
      );
      friendlyError.statusCode = 400;
      friendlyError.code = "CRAWL_NO_TWEETS";
      throw friendlyError;
    }

    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

async function runSourceCrawl(sourceOrId) {
  const source = typeof sourceOrId === "object"
    ? sourceOrId
    : await CrawlSource.findById(sourceOrId).lean();

    if(!source){
      throw new Error("Crawl source not found");
    }

    if(!source.enabled){
      return {
        skipped: true,
        reason: "Source is disabled",
      }
    }

    const now = new Date();

    await CrawlSource.findByIdAndUpdate(source._id, {
      lastStatus: "running",
      lastError: null,
    });

    try{
      const result = await crawlXUrl(source.url, {
        runType: "auto",
        sourceId: source._id,
      });
      const nextRunAt = new Date(
        Date.now() + source.intervalMinutes * 60 * 1000
      );

      await CrawlSource.findByIdAndUpdate(source._id, {
        lastStatus: "success",
        lastCrawledAt: now,
        nextRunAt,
        lastResult: result,
        lastError: null,
      });

      return result;
    } catch (error) {
      const nextRunAt = new Date(
        Date.now() + source.intervalMinutes * 60 * 1000
      );
      await CrawlSource.findByIdAndUpdate(source._id, {
        lastStatus: "error",
        lastCrawledAt: now,
        nextRunAt,
        lastError: error.message,
      });

      throw error;
    }
}

module.exports = {
  crawlXUrl,
  runSourceCrawl,
};
