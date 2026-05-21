const cryptoReportService = require("../services/cryptoReport.service");

async function getCryptoReport(req, res, next) {
  try {
    const result = await cryptoReportService.getCryptoReport();
    res.json(result);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getCryptoReport,
};
