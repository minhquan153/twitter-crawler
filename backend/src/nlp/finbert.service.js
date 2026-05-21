const FINBERT_API_URL =
  "https://router.huggingface.co/hf-inference/models/ProsusAI/finbert";

function unknownSentiment() {
  return {
    sentiment: "unknown",
    confidence: 0,
    sentimentScore: 0,
  };
}

function normalizePredictions(payload) {
  if (!Array.isArray(payload)) {
    return [];
  }

  if (Array.isArray(payload[0])) {
    return payload[0];
  }

  return payload;
}

async function analyzeWithFinBERT(text = "") {
  const token = process.env.HF_TOKEN;

  if (!token || !String(text).trim()) {
    return unknownSentiment();
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(FINBERT_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: text,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      return unknownSentiment();
    }

    const payload = await response.json();
    const predictions = normalizePredictions(payload);

    if (predictions.length === 0) {
      return unknownSentiment();
    }

    const scores = predictions.reduce(
      (acc, item) => {
        const label = String(item.label || "").toLowerCase();
        const score = Number(item.score) || 0;

        if (label.includes("positive")) {
          acc.positive = score;
        } else if (label.includes("negative")) {
          acc.negative = score;
        } else if (label.includes("neutral")) {
          acc.neutral = score;
        }

        return acc;
      },
      { positive: 0, negative: 0, neutral: 0 }
    );

    const topPrediction = predictions.reduce((top, item) => {
      const score = Number(item.score) || 0;
      return score > top.score ? { label: item.label, score } : top;
    }, { label: "unknown", score: 0 });

    return {
      sentiment: String(topPrediction.label || "unknown").toLowerCase(),
      confidence: topPrediction.score,
      sentimentScore: scores.positive - scores.negative,
    };
  } catch (error) {
    return unknownSentiment();
  } finally {
    clearTimeout(timeout);
  }
}

module.exports = {
  analyzeWithFinBERT,
};
