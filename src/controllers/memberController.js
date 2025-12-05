const memberService = require("../services/memberService");

class MemberController {
  async deleteMember(req, res) {
    try {
      const { id } = req.params;
      await memberService.deleteMember(parseInt(id));
      res.json({ message: "Читача успішно деактивовано (soft delete)." });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getMembers(req, res) {
    try {
      const members = await memberService.getAllActiveMembers();
      res.json(members);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new MemberController();
