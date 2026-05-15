const statsService = require("../services/stats.service");

async function getOverview(req, res, next) {
  try {
    const result = await statsService.getOverview();
    res.json(result);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getOverview,
};
