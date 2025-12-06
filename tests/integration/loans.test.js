const request = require("supertest");
const app = require("../../src/server");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

describe("Integration: Loan Operations", () => {
  let librarianId, bookId, memberId, publisherId, categoryId, authorId;

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
      data: { name: "Loan Pub", address: "St" },
    });
    const cat = await prisma.category.create({ data: { name: "Loan Cat" } });
    const auth = await prisma.author.create({
      data: { name: "Au", surname: "Thor", birthYear: 1990, country: "UA" },
    });

    const lib = await prisma.librarian.create({
      data: {
        name: "Lib",
        surname: "Loaner",
        email: "loans@lib.ua",
        position: "LIBRARIAN_1",
        department: "READING_HALLS",
      },
    });
    librarianId = lib.id;

    const book = await prisma.book.create({
      data: { title: "Loan Book", publicationYear: 2024, publisherId: pub.id },
    });
    bookId = book.id;

    const member = await prisma.member.create({
      data: {
        name: "Loan",
        surname: "User",
        address: "Addr",
        phoneNumber: "0000000000",
      },
    });
    memberId = member.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test("POST /api/loans - Має успішно видати книгу", async () => {
    const response = await request(app).post("/api/loans").send({
      bookId,
      memberId,
      librarianId,
    });
    console.log(
      "[TEST] Успішна видача:",
      JSON.stringify(response.body.data, null, 2)
    );
    expect(response.statusCode).toBe(201);
    expect(response.body.data.status).toBe("ISSUED");
  });

  test("POST /api/loans - Має заборонити повторну видачу", async () => {
    const response = await request(app).post("/api/loans").send({
      bookId,
      memberId,
      librarianId,
    });
    console.log("[TEST] Перевірка заборони (очікуємо помилку):", response.body);
    expect(response.statusCode).toBe(500);
  });

  test("POST /api/loans/return - Має успішно повернути книгу", async () => {
    const response = await request(app).post("/api/loans/return").send({
      bookId,
    });
    console.log(
      "[TEST] Повернення книги:",
      JSON.stringify(response.body.data, null, 2)
    );
    expect(response.statusCode).toBe(200);
    expect(response.body.data.loan.status).toBe("RETURNED");
  });
});
