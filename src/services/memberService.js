const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class MemberService {
  async deleteMember(id) {
    const activeLoans = await prisma.loan.count({
      where: {
        memberId: id,
        status: { in: ["ISSUED", "OVERDUE"] },
      },
    });

    if (activeLoans > 0) {
      throw new Error("Не можна видалити читача, у якого є неповернуті книги.");
    }

    return await prisma.member.update({
      where: { id: id },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async getAllActiveMembers() {
    return await prisma.member.findMany({
      where: {
        deletedAt: null,
      },
    });
  }
}

module.exports = new MemberService();
