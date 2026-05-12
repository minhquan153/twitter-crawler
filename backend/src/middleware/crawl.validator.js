const ALLOWED_HOSTS = new Set([
  "x.com",
  "www.x.com",
  "twitter.com",
  "www.twitter.com",
]);

function validateCrawlUrlBody(body = {}) {
  const errors = [];

  if (typeof body.url !== "string" || !body.url.trim()) {
    errors.push({
      field: "url",
      message: "url is required",
    });

    return errors;
  }

  const urlText = body.url.trim();
  const urlWithProtocol = /^https?:\/\//i.test(urlText)
    ? urlText
    : `https://${urlText}`;

  let parsedUrl;

  try {
    parsedUrl = new URL(urlWithProtocol);
  } catch (error) {
    errors.push({
      field: "url",
      message: "url must be a valid URL",
    });

    return errors;
  }

  if (!ALLOWED_HOSTS.has(parsedUrl.hostname.toLowerCase())) {
    errors.push({
      field: "url",
      message: "url must be x.com or twitter.com",
    });
  }

  return errors;
}

module.exports = {
  crawlUrlSchema: {
    body: validateCrawlUrlBody,
  },
};
