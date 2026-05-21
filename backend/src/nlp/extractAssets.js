const COIN_ALIASES = {
  BTC: ["bitcoin", "btc", "$btc", "#btc"],
  ETH: ["ethereum", "eth", "$eth", "#eth"],
  SOL: ["solana", "sol", "$sol", "#sol"],
  DOGE: ["dogecoin", "doge", "$doge", "#doge"],
  XRP: ["ripple", "xrp", "$xrp", "#xrp"],
};

const SUPPORTED_COINS = Object.keys(COIN_ALIASES);
const QUOTE_ASSETS = ["USDT", "USD"];

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function hasAssetToken(text, alias) {
  if (alias.startsWith("$") || alias.startsWith("#")) {
    const pattern = new RegExp(`(^|[^a-z0-9_])${escapeRegex(alias)}(?![a-z0-9_])`, "i");
    return pattern.test(text);
  }

  const pattern = new RegExp(`(^|[^a-z0-9_])${escapeRegex(alias)}(?![a-z0-9_])`, "i");
  return pattern.test(text);
}

function extractPairs(text) {
  const pairs = new Set();
  const bases = SUPPORTED_COINS.join("|");
  const quotes = QUOTE_ASSETS.join("|");
  const pairPattern = new RegExp(
    `(^|[^a-z0-9_])(${bases})(?:[\\s/-]?)(USDT|USD)(?![a-z0-9_])`,
    "gi"
  );

  let match = pairPattern.exec(text);

  while (match) {
    const base = match[2].toUpperCase();
    const quote = match[3].toUpperCase();

    if (SUPPORTED_COINS.includes(base) && QUOTE_ASSETS.includes(quote)) {
      pairs.add(`${base}/${quote}`);
    }

    match = pairPattern.exec(text);
  }

  return [...pairs];
}

function extractAssets(text = "") {
  const normalizedText = String(text);
  const coins = new Set();
  const pairs = extractPairs(normalizedText);

  for (const pair of pairs) {
    coins.add(pair.split("/")[0]);
  }

  for (const [coin, aliases] of Object.entries(COIN_ALIASES)) {
    if (aliases.some((alias) => hasAssetToken(normalizedText, alias))) {
      coins.add(coin);
    }
  }

  return {
    coins: [...coins],
    pairs,
  };
}

module.exports = {
  extractAssets,
};
