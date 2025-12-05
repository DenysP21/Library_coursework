const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Починаємо наповнення бази даних...");

  await prisma.fine.deleteMany();
  await prisma.loan.deleteMany();
  await prisma.member.deleteMany();
  await prisma.bookCategory.deleteMany();
  await prisma.authorBook.deleteMany();
  await prisma.book.deleteMany();
  await prisma.author.deleteMany();
  await prisma.publisher.deleteMany();
  await prisma.category.deleteMany();
  await prisma.librarian.deleteMany();

  const catFiction = await prisma.category.create({
    data: { name: "Художня література" },
  });
  const catScience = await prisma.category.create({
    data: { name: "Наукова література" },
  });
  const catHistory = await prisma.category.create({
    data: { name: "Історія" },
  });

  const pubA = await prisma.publisher.create({
    data: { name: "А-БА-БА-ГА-ЛА-МА-ГА", address: "Київ, вул. Басейна 1/2" },
  });
  const pubB = await prisma.publisher.create({
    data: { name: "Наш Формат", address: "Київ, пров. Алли Горської 5" },
  });

  const lib1 = await prisma.librarian.create({
    data: {
      name: "Олена",
      surname: "Пчілка",
      email: "olena@lib.ua",
      position: "LIBRARIAN_1",
      department: "READING_HALLS",
    },
  });

  const authorOrwell = await prisma.author.create({
    data: {
      name: "Джордж",
      surname: "Орвелл",
      birthYear: 1903,
      country: "Великобританія",
    },
  });

  const book1984 = await prisma.book.create({
    data: {
      title: "1984",
      publicationYear: 2023,
      publisherId: pubA.id,
    },
  });

  await prisma.authorBook.create({
    data: { authorId: authorOrwell.id, bookId: book1984.id },
  });
  await prisma.bookCategory.create({
    data: { categoryId: catFiction.id, bookId: book1984.id },
  });

  const authorShevchenko = await prisma.author.create({
    data: {
      name: "Тарас",
      surname: "Шевченко",
      birthYear: 1814,
      country: "Україна",
    },
  });

  const bookKobzar = await prisma.book.create({
    data: {
      title: "Кобзар",
      publicationYear: 2020,
      publisherId: pubA.id,
    },
  });

  await prisma.authorBook.create({
    data: { authorId: authorShevchenko.id, bookId: bookKobzar.id },
  });
  await prisma.bookCategory.create({
    data: { categoryId: catFiction.id, bookId: bookKobzar.id },
  });
  await prisma.bookCategory.create({
    data: { categoryId: catHistory.id, bookId: bookKobzar.id },
  });

  const member1 = await prisma.member.create({
    data: {
      name: "Іван",
      surname: "Коваленко",
      address: "Київ, вул. Хрещатик 1",
      phoneNumber: "+380501112233",
    },
  });

  const member2 = await prisma.member.create({
    data: {
      name: "Марія",
      surname: "Петренко",
      address: "Львів, пл. Ринок 10",
      phoneNumber: "+380679998877",
    },
  });

  await prisma.loan.create({
    data: {
      memberId: member1.id,
      bookId: book1984.id,
      librarianId: lib1.id,
      loanDate: new Date("2024-01-10"),
      returnDate: new Date("2024-01-20"),
      status: "RETURNED",
    },
  });

  await prisma.loan.create({
    data: {
      memberId: member2.id,
      bookId: bookKobzar.id,
      librarianId: lib1.id,
      loanDate: new Date(),
      status: "ISSUED",
    },
  });

  const overdueLoan = await prisma.loan.create({
    data: {
      memberId: member1.id,
      bookId: bookKobzar.id,
      librarianId: lib1.id,
      loanDate: new Date("2023-12-01"),
      status: "OVERDUE",
    },
  });

  await prisma.fine.create({
    data: {
      loanId: overdueLoan.id,
      amount: 50.0,
      status: "ISSUED",
    },
  });

  console.log("✅ База даних успішно наповнена!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
