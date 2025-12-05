const request = require("supertest");
const app = require("../../src/server");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

describe("Integration: Member Management", () => {
  let memberId, bookId, librarianId;

  beforeAll(async () => {
    await prisma.fine.deleteMany();
    await prisma.loan.deleteMany();
    await prisma.member.deleteMany();

    const member = await prisma.member.create({
      data: {
        name: "Delete",
        surname: "Me",
        address: "Test",
        phoneNumber: "111222333",
      },
    });
    memberId = member.id;

    const lib = await prisma.librarian.create({
      data: {
        name: "L",
        surname: "B",
        email: "del@lib.ua",
        position: "LIBRARIAN_1",
        department: "READING_HALLS",
      },
    });
    librarianId = lib.id;

    const pub = await prisma.publisher.create({
      data: { name: "Del Pub", address: "A" },
    });
    const book = await prisma.book.create({
      data: { title: "Del Book", publicationYear: 2000, publisherId: pub.id },
    });
    bookId = book.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test("DELETE /api/members/:id - Має заборонити видалення, якщо є книга на руках", async () => {
    await prisma.loan.create({
      data: {
        bookId,
        memberId,
        librarianId,
        loanDate: new Date(),
        status: "ISSUED",
      },
    });

    const response = await request(app).delete(`/api/members/${memberId}`);
    expect(response.statusCode).toBe(400);
  });

  test("DELETE /api/members/:id - Має дозволити Soft Delete, коли книг немає", async () => {
    await prisma.loan.updateMany({
      where: { bookId, memberId },
      data: { status: "RETURNED", returnDate: new Date() },
    });

    const response = await request(app).delete(`/api/members/${memberId}`);
    expect(response.statusCode).toBe(200);

    const check = await prisma.member.findUnique({ where: { id: memberId } });
    expect(check.deletedAt).not.toBeNull();
  });
});
