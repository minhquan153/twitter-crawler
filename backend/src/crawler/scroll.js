const { extractTweetsFromPage } = require("./extractTweets");

async function collectTweetsWhileScrolling(page, sourceUrl, options = {}) {
  const maxScrolls = options.maxScrolls ?? 10;
  const scrollScreens = options.scrollScreens ?? 3;
  const delayMs = options.delayMs ?? 1500;
  const maxStableRounds = options.maxStableRounds ?? 5;

  const tweetMap = new Map();
  let stableRounds = 0;

  for (let i = 0; i < maxScrolls; i += 1) {
    const currentTweets = await extractTweetsFromPage(page, sourceUrl);
    const previousSize = tweetMap.size;

    for (const tweet of currentTweets) {
      tweetMap.set(tweet.tweetId, tweet);
    }

    if (tweetMap.size === previousSize) {
      stableRounds += 1;
    } else {
      stableRounds = 0;
    }

    if (stableRounds >= maxStableRounds) {
      break;
    }

    await page.evaluate((scrollScreens) => {
      window.scrollBy(0, window.innerHeight * scrollScreens);
    }, scrollScreens);

    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }

  return Array.from(tweetMap.values());
}

module.exports = {
  collectTweetsWhileScrolling,
};
