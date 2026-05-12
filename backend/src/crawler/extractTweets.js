async function extractTweetsFromPage(page, sourceUrl) {
  const tweets = await page.$$eval(
    "article[data-testid='tweet']",
    (articles, sourceUrl) => {
      return articles.map((article) => {
        const contentElement = article.querySelector("[data-testid='tweetText']");
        const timeElement = article.querySelector("time");
        const statusLink = article.querySelector("a[href*='/status/']");

        const content = contentElement?.innerText?.trim() || "";
        const postedAt = timeElement?.getAttribute("datetime") || "";
        const href = statusLink?.getAttribute("href") || "";

        const tweetUrl = href ? new URL(href, window.location.origin).href : "";
        const tweetId = tweetUrl.split("/status/")[1]?.split(/[/?#]/)[0] || "";

        const userNameBlock = article.querySelector("[data-testid='User-Name']");
        const userText = userNameBlock?.innerText || "";
        const lines = userText
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean);

        const handle = lines.find((line) => line.startsWith("@")) || "";
        const name = lines.find((line) => !line.startsWith("@")) || "";

        return {
          tweetId,
          content,
          name,
          handle,
          postedAt,
          tweetUrl,
          sourceUrl,
        };
      });
    },
    sourceUrl
  );

  return tweets.filter((tweet) => tweet.tweetId && tweet.content);
}

module.exports = {
  extractTweetsFromPage,
};
