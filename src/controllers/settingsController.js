const settingsService = require("../services/settingsService");
const asyncHandler = require("../utils/asyncHandler");

class SettingsController {
  getSettings = asyncHandler(async (req, res) => {
    const settings = await settingsService.getSettings();
    res.json(settings);
  });

  updateSettings = asyncHandler(async (req, res) => {
    const { loanPeriodDays, finePerDay } = req.body;

    if (!loanPeriodDays || !finePerDay) {
      res.status(400);
      throw new Error("Всі поля обов'язкові");
    }

    const updated = await settingsService.updateSettings({
      loanPeriodDays,
      finePerDay,
    });
    res.json({ message: "Налаштування збережено!", settings: updated });
  });
}

module.exports = new SettingsController();
