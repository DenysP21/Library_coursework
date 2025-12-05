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

  async getAllBooks(page = 1, limit = 100) {
    const skip = (page - 1) * limit;

    const [items, total] = await prisma.$transaction([
      prisma.book.findMany({
        skip: skip,
        take: limit,
        include: {
          publisher: true,
          authors: { include: { author: true } },
          categories: { include: { category: true } },
        },
        orderBy: { id: "desc" },
      }),
      prisma.book.count(),
    ]);
    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async createBook(data) {
    const { title, publicationYear, publisherId, authorId, categoryId } = data;

    return await prisma.book.create({
      data: {
        title,
        publicationYear,
        publisherId,
        authors: {
          create: { authorId },
        },
        categories: {
          create: { categoryId },
        },
      },
    });
  }
  async updateBook(id, data) {
    const { title, publicationYear, publisherId, authorId, categoryId } = data;

    return await prisma.book.update({
      where: { id },
      data: {
        title,
        publicationYear,
        publisherId,
        authors: {
          deleteMany: {},
          create: { authorId },
        },
        categories: {
          deleteMany: {},
          create: { categoryId },
        },
      },
    });
  }
}

module.exports = new BookService();
