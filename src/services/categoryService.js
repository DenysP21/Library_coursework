const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class CategoryService {
  async createCategory(name) {
    return await prisma.category.create({
      data: { name },
    });
  }
}

module.exports = new CategoryService();
