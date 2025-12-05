const memberService = require("../services/memberService");
const asyncHandler = require("../utils/asyncHandler");

class MemberController {
  deleteMember = asyncHandler(async (req, res) => {
    const { id } = req.params;
    await memberService.deleteMember(parseInt(id));
    res.json({ message: "Читача успішно деактивовано (soft delete)." });
  });

  getMembers = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;

    const members = await memberService.getAllActiveMembers();
    res.json(members);
  });
}

module.exports = new MemberController();
