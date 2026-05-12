function adminAuth(req, res, next) {
  const adminApiKey = process.env.ADMIN_API_KEY;
  const requestApiKey = req.headers["x-api-key"];

  if (!adminApiKey) {
    return res.status(500).json({
      message: "ADMIN_API_KEY is not configured",
    });
  }

  if (!requestApiKey || requestApiKey !== adminApiKey) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  return next();
}

module.exports = adminAuth;
