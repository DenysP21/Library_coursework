const reportService = require("../services/reportService");

class ReportController {
  async getTopReaders(req, res) {
    try {
      const data = await reportService.getTopReaders();
      res.json(data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  }

  async getCategoryStats(req, res) {
    try {
      const data = await reportService.getCategoryStats();
      res.json(data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new ReportController();
