function getOverview(req, res) {
  res.json({ message: "OK", module: "stats" });
}

module.exports = {
  getOverview,
};
