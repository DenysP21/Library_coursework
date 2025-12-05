const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class BookService {
  async getFormOptions() {
    const [authors, publishers, categories] = await prisma.$transaction([
      prisma.author.findMany({ orderBy: { surname: "asc" } }),
      prisma.publisher.findMany({ orderBy: { name: "asc" } }),
      prisma.category.findMany({ orderBy: { name: "asc" } }),
    ]);
    return { authors, publishers, categories };
  }

  async getAllBooks() {
    return await prisma.book.findMany({
      include: {
        publisher: true,
        authors: { include: { author: true } },
        categories: { include: { category: true } },
      },
      orderBy: { id: "desc" },
    });
  }

  async createBook(data) {
    const { title, publicationYear, publisherId, authorId, categoryId } = data;

    return await prisma.book.create({
      data: {
        title,
        publicationYear: parseInt(publicationYear),
        publisherId: parseInt(publisherId),
        authors: {
          create: { authorId: parseInt(authorId) },
        },
        categories: {
          create: { categoryId: parseInt(categoryId) },
        },
      },
    });
  }
  async updateBook(id, data) {
    const { title, publicationYear, publisherId, authorId, categoryId } = data;

    return await prisma.book.update({
      where: { id: parseInt(id) },
      data: {
        title: title,
        publicationYear: parseInt(publicationYear),
        publisherId: parseInt(publisherId),

        authors: {
          deleteMany: {},
          create: { authorId: parseInt(authorId) },
        },

        categories: {
          deleteMany: {},
          create: { categoryId: parseInt(categoryId) },
        },
      },
    });
  }
}

module.exports = new BookService();
