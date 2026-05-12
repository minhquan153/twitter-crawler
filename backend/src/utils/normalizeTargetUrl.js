function normalizeTargetUrl(input) {
  if (typeof input !== "string" || !input.trim()) {
    throw new Error("Target URL is required");
  }

  const raw = input.trim();
  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;

  let url;
  try {
    url = new URL(withProtocol);
  } catch {
    throw new Error("Invalid target URL");
  }

  const allowedHosts = new Set([
    "x.com",
    "www.x.com",
    "twitter.com",
    "www.twitter.com",
  ]);

  if (!allowedHosts.has(url.hostname.toLowerCase())) {
    throw new Error("Target URL must be x.com or twitter.com");
  }

  url.hash = "";

  return url.href;
}

module.exports = {
  normalizeTargetUrl,
};
