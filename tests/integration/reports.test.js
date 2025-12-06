const request = require("supertest");
const app = require("../../src/server");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

describe("Integration: Analytical Reports", () => {
  let memberId, bookId, categoryId;

  beforeAll(async () => {
    await prisma.fine.deleteMany();
    await prisma.loan.deleteMany();
    await prisma.member.deleteMany();
    await prisma.book.deleteMany();
    await prisma.category.deleteMany();
    await prisma.author.deleteMany();
    await prisma.publisher.deleteMany();
    await prisma.librarian.deleteMany();

    const pub = await prisma.publisher.create({
      data: { name: "Rep Pub", address: "A" },
    });
    const lib = await prisma.librarian.create({
      data: { name: "L", surname: "Rep", email: "rep@lib.ua" },
    });

    const cat = await prisma.category.create({ data: { name: "Fantasy" } });
    categoryId = cat.id;

    const book = await prisma.book.create({
      data: {
        title: "Harry Potter",
        publicationYear: 2000,
        publisherId: pub.id,
        categories: { create: { categoryId: cat.id } },
      },
    });
    bookId = book.id;

    const member = await prisma.member.create({
      data: {
        name: "Super",
        surname: "Reader",
        address: "X",
        phoneNumber: "777",
      },
    });
    memberId = member.id;

    await prisma.loan.create({
      data: {
        bookId: book.id,
        memberId: member.id,
        librarianId: lib.id,
        status: "RETURNED",
        loanDate: new Date(),
      },
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test("GET /api/reports/top-readers - Має повернути дані", async () => {
    const res = await request(app).get("/api/reports/top-readers");
    console.log("Звіт по читачах:", JSON.stringify(res.body, null, 2));
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0].surname).toBe("Reader");
  });

  test("GET /api/reports/categories - Має порахувати книги в категорії", async () => {
    const res = await request(app).get("/api/reports/categories");
    expect(res.statusCode).toBe(200);
    console.log("Звіт по категоріях:", JSON.stringify(res.body, null, 2));
    const stat = res.body.find((c) => c.category === "Fantasy");
    expect(stat).toBeDefined();
    expect(stat.loan_count).toBe(1);
  });
});
