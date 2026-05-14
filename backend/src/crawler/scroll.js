async function scrollPageForTweets(page, options = {}) {
  const maxScrolls = options.maxScrolls ?? 10;
  let previousTweetCount = 0;
  let stableRounds = 0;

  for (let i = 0; i < maxScrolls; i += 1) {
    const currentTweetCount = await page.$$eval(
      "article[data-testid='tweet']",
      (articles) => articles.length
    );

    if (currentTweetCount <= previousTweetCount) {
      stableRounds += 1;
    } else {
      stableRounds = 0;
    }

    if (stableRounds >= 2) {
      break;
    }

    const scrollScreens = options.scrollScreens ?? 3;

    await page.evaluate((scrollScreens) => {
      window.scrollBy(0, window.innerHeight * scrollScreens);
    }, scrollScreens);


    await new Promise((resolve) => setTimeout(resolve, 1500));
  }
}

module.exports = {
  scrollPageForTweets,
};
