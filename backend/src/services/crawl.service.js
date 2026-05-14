const { launchBrowser } = require("../crawler/browser");
const { normalizeTargetUrl } = require("../utils/normalizeTargetUrl");
const { scrollPageForTweets } = require("../crawler/scroll");
const { extractTweetsFromPage } = require("../crawler/extractTweets");
const tweetService = require("./tweet.service");
const crawlRunService = require("./crawlRun.service");

async function crawlXUrl(rawUrl) {
  const targetUrl = normalizeTargetUrl(rawUrl);

  const crawlRun = await crawlRunService.startCrawlRun({
    url: targetUrl,
    runType: "manual",
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

    await scrollPageForTweets(page, { maxScrolls: 10 });

    const tweets = await extractTweetsFromPage(page, targetUrl);
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

module.exports = {
  crawlXUrl,
};
