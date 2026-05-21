const { extractAssets } = require("./extractAssets");
const { analyzeWithFinBERT } = require("./finbert.service");

function calculateHotScore({ coins, pairs, sentimentScore, confidence, postedAt }) {
  if (coins.length === 0 && pairs.length === 0) {
    return 0;
  }

  const postedDate = postedAt ? new Date(postedAt) : null;
  const ageHours =
    postedDate && !Number.isNaN(postedDate.getTime())
      ? Math.max((Date.now() - postedDate.getTime()) / (1000 * 60 * 60), 0)
      : 24;
  const recencyBoost = 1 / (1 + ageHours / 24);
  const assetBoost = coins.length + pairs.length * 0.5;
  const sentimentBoost = Math.abs(sentimentScore) + confidence;

  return Number((assetBoost * (1 + sentimentBoost) * recencyBoost).toFixed(4));
}

async function analyzeTweetContent(content = "", postedAt = null) {
  const assets = extractAssets(content);
  const sentiment = await analyzeWithFinBERT(content);
  const hotScore = calculateHotScore({
    coins: assets.coins,
    pairs: assets.pairs,
    sentimentScore: sentiment.sentimentScore,
    confidence: sentiment.confidence,
    postedAt,
  });

  return {
    ...assets,
    ...sentiment,
    analyzedAt: new Date(),
    hotScore,
  };
}

module.exports = {
  analyzeTweetContent,
};
