const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class MemberService {
  async deleteMember(id) {
    const member = await prisma.member.findUnique({ where: { id } });
    if (!member) {
      throw new Error(`Читача з ID ${id} не знайдено.`);
    }

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

  async getAllActiveMembers(page = 1, limit = 100) {
    const skip = (page - 1) * limit;

    return await prisma.member.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: { surname: "asc" },
      skip: skip,
      take: limit,
    });
  }
}

module.exports = new MemberService();
