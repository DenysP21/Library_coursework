const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class SettingsService {
  async getSettings() {
    let settings = await prisma.systemSetting.findFirst();
    if (!settings) {
      settings = await prisma.systemSetting.create({
        data: { loanPeriodDays: 14, finePerDay: 5.0 },
      });
    }
    return settings;
  }

  async updateSettings(data) {
    const settings = await this.getSettings();
    return await prisma.systemSetting.update({
      where: { id: settings.id },
      data: {
        loanPeriodDays: parseInt(data.loanPeriodDays),
        finePerDay: parseFloat(data.finePerDay),
      },
    });
  }
}

module.exports = new SettingsService();
