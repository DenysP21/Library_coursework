const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class AuthorService {
  async createAuthor(data) {
    const { name, surname, birthYear, country } = data;

    return await prisma.author.create({
      data: {
        name,
        surname,
        birthYear: birthYear ? parseInt(birthYear) : null,
        country,
      },
    });
  }
}

module.exports = new AuthorService();
