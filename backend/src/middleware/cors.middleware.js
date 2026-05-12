const allowedOrigins = new Set([
  "http://localhost:5173",
  "http://127.0.0.1:5173",
]);

function corsMiddleware(req, res, next) {
  const origin = req.headers.origin;

  if (allowedOrigins.has(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }

  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    req.headers["access-control-request-headers"] || "Content-Type,Authorization"
  );

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  return next();
}

module.exports = corsMiddleware;
