const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Починаємо наповнення бази даних...");

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
  const catIT = await prisma.category.create({
    data: { name: "IT та Програмування" },
  });

  const pubA = await prisma.publisher.create({
    data: { name: "А-БА-БА-ГА-ЛА-МА-ГА", address: "Київ" },
  });
  const pubB = await prisma.publisher.create({
    data: { name: "Наш Формат", address: "Київ" },
  });
  const pubC = await prisma.publisher.create({
    data: { name: "O'Reilly", address: "USA" },
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
  const authorShevchenko = await prisma.author.create({
    data: {
      name: "Тарас",
      surname: "Шевченко",
      birthYear: 1814,
      country: "Україна",
    },
  });
  const authorMartin = await prisma.author.create({
    data: {
      name: "Роберт",
      surname: "Мартін",
      birthYear: 1952,
      country: "США",
    },
  });
  const authorHarari = await prisma.author.create({
    data: {
      name: "Юваль Ной",
      surname: "Харарі",
      birthYear: 1976,
      country: "Ізраїль",
    },
  });

  const booksData = [
    {
      title: "1984",
      year: 2023,
      pub: pubA,
      auth: authorOrwell,
      cats: [catFiction],
    },
    {
      title: "Колгосп тварин",
      year: 2022,
      pub: pubA,
      auth: authorOrwell,
      cats: [catFiction],
    },
    {
      title: "Кобзар",
      year: 2020,
      pub: pubA,
      auth: authorShevchenko,
      cats: [catFiction, catHistory],
    },
    {
      title: "Sapiens",
      year: 2018,
      pub: pubB,
      auth: authorHarari,
      cats: [catScience, catHistory],
    },
    {
      title: "Homo Deus",
      year: 2020,
      pub: pubB,
      auth: authorHarari,
      cats: [catScience],
    },
    {
      title: "Clean Code",
      year: 2008,
      pub: pubC,
      auth: authorMartin,
      cats: [catIT, catScience],
    },
    {
      title: "Clean Architecture",
      year: 2017,
      pub: pubC,
      auth: authorMartin,
      cats: [catIT],
    },
  ];

  const createdBooks = [];

  for (const b of booksData) {
    const book = await prisma.book.create({
      data: {
        title: b.title,
        publicationYear: b.year,
        publisherId: b.pub.id,
        authors: { create: { authorId: b.auth.id } },
        categories: { create: b.cats.map((c) => ({ categoryId: c.id })) },
      },
    });
    createdBooks.push(book);
  }

  const member1 = await prisma.member.create({
    data: {
      name: "Іван",
      surname: "Активний",
      address: "Київ",
      phoneNumber: "+380501111111",
    },
  });
  const member2 = await prisma.member.create({
    data: {
      name: "Марія",
      surname: "Читацька",
      address: "Львів",
      phoneNumber: "+380672222222",
    },
  });
  const member3 = await prisma.member.create({
    data: {
      name: "Петро",
      surname: "Боржник",
      address: "Одеса",
      phoneNumber: "+380633333333",
    },
  });

  await prisma.loan.createMany({
    data: [
      {
        memberId: member1.id,
        bookId: createdBooks[0].id,
        librarianId: lib1.id,
        status: "RETURNED",
        loanDate: new Date("2023-01-10"),
        returnDate: new Date("2023-01-20"),
      },
      {
        memberId: member1.id,
        bookId: createdBooks[1].id,
        librarianId: lib1.id,
        status: "RETURNED",
        loanDate: new Date("2023-02-15"),
        returnDate: new Date("2023-02-25"),
      },
      {
        memberId: member1.id,
        bookId: createdBooks[3].id,
        librarianId: lib1.id,
        status: "RETURNED",
        loanDate: new Date("2023-03-10"),
        returnDate: new Date("2023-03-20"),
      },
      {
        memberId: member1.id,
        bookId: createdBooks[5].id,
        librarianId: lib1.id,
        status: "ISSUED",
        loanDate: new Date(),
      },
    ],
  });

  await prisma.loan.create({
    data: {
      memberId: member2.id,
      bookId: createdBooks[2].id,
      librarianId: lib1.id,
      status: "RETURNED",
      loanDate: new Date("2023-05-01"),
      returnDate: new Date("2023-05-10"),
    },
  });
  await prisma.loan.create({
    data: {
      memberId: member2.id,
      bookId: createdBooks[4].id,
      librarianId: lib1.id,
      status: "ISSUED",
      loanDate: new Date(),
    },
  });

  const overdueLoan = await prisma.loan.create({
    data: {
      memberId: member3.id,
      bookId: createdBooks[0].id,
      librarianId: lib1.id,
      status: "OVERDUE",
      loanDate: new Date("2023-10-01"),
    },
  });

  await prisma.fine.create({
    data: { loanId: overdueLoan.id, amount: 150.0, status: "ISSUED" },
  });

  console.log("✅ База даних успішно наповнена багатими даними!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
