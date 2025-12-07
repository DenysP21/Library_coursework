const request = require("supertest");
const app = require("../../src/server");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

describe("Integration: Books Pagination", () => {
  let publisherId;

  beforeAll(async () => {
    await prisma.fine.deleteMany();
    await prisma.loan.deleteMany();
    await prisma.member.deleteMany();
    await prisma.book.deleteMany();
    await prisma.librarian.deleteMany();
    await prisma.publisher.deleteMany();
    await prisma.category.deleteMany();
    await prisma.author.deleteMany();

    const pub = await prisma.publisher.create({
      data: { name: "Test Pub", address: "Street" },
    });
    publisherId = pub.id;

    const booksData = Array.from({ length: 15 }).map((_, index) => ({
      title: `Book ${index + 1}`,
      publicationYear: 2000 + index,
      publisherId: pub.id,
    }));

    await prisma.book.createMany({ data: booksData });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test("GET /api/books?limit=5 - Має повернути перші 5 книг (Пагінація)", async () => {
    const limit = 5;
    const response = await request(app).get(`/api/books?page=1&limit=${limit}`);

    expect(response.statusCode).toBe(200);

    expect(response.body).toHaveProperty("items");
    expect(response.body).toHaveProperty("meta");

    console.log(
      `[TEST] Запитали ${limit}, отримали: ${response.body.items.length}`
    );
    expect(response.body.items.length).toBe(limit);

    expect(response.body.meta.total).toBe(15);
    expect(response.body.meta.totalPages).toBe(3);
  });

  test("GET /api/books?page=2&limit=5 - Має повернути другу сторінку", async () => {
    const response = await request(app).get("/api/books?page=2&limit=5");

    expect(response.statusCode).toBe(200);
    expect(response.body.items.length).toBe(5);

    console.log(`📄 [TEST] Сторінка 2 завантажена успішно`);
  });
});
