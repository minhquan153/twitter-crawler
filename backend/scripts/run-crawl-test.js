require("dotenv").config();

const { launchBrowser } = require("../src/crawler/browser");
const { normalizeTargetUrl } = require("../src/utils/normalizeTargetUrl");
const { scrollPageForTweets } = require("../src/crawler/scroll");
const { extractTweetsFromPage } = require("../src/crawler/extractTweets");



async function main() {
  const targetUrl = normalizeTargetUrl(process.argv[2] || "https://x.com/home");
  const browser = await launchBrowser({ headless: false });

  try {
    const page = await browser.newPage();
    await page.goto(targetUrl, { waitUntil: "domcontentloaded" });

    await page.waitForSelector("article[data-testid='tweet']", {
      timeout: 30000,
    });

    await scrollPageForTweets(page, { maxScrolls: 10 });

    const tweets = await extractTweetsFromPage(page, targetUrl);
    console.log(tweets);
    

  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
