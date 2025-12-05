const reportService = require("../services/reportService");
const asyncHandler = require("../utils/asyncHandler");

class ReportController {
  getTopReaders = asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit) || 5;
    const data = await reportService.getTopReaders(limit);
    res.json(data);
  });

  getCategoryStats = asyncHandler(async (req, res) => {
    const data = await reportService.getCategoryStats();
    res.json(data);
  });
}

module.exports = new ReportController();
