const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class LoanService {
  async issueBook(bookId, memberId, librarianId) {
    return await prisma.$transaction(async (tx) => {
      const member = await tx.member.findUnique({ where: { id: memberId } });
      if (!member) throw new Error(`Читача з ID ${memberId} не знайдено.`);
      if (member.deletedAt) throw new Error(`Читач видалений/заблокований.`);

      const availableCopy = await tx.bookCopy.findFirst({
        where: {
          bookId: bookId,
          loans: {
            none: {
              status: { in: ["ISSUED", "OVERDUE"] },
            },
          },
        },
        include: { book: true },
      });

      if (!availableCopy) {
        throw new Error(`На жаль, всі примірники цієї книги зараз видані.`);
      }

      const newLoan = await tx.loan.create({
        data: {
          bookCopyId: availableCopy.id,
          memberId,
          librarianId,
          loanDate: new Date(),
          status: "ISSUED",
        },
        include: {
          bookCopy: { include: { book: true } },
          member: true,
          librarian: true,
        },
      });

      console.log(
        `✅ Примірник "${availableCopy.inventoryNumber}" (Книга: ${availableCopy.book.title}) видано.`
      );

      return {
        ...newLoan,
        book: newLoan.bookCopy.book,
      };
    });
  }

  async returnBook(bookId) {
    return await prisma.$transaction(async (tx) => {
      const activeLoan = await tx.loan.findFirst({
        where: {
          bookCopy: { bookId: bookId },
          status: { in: ["ISSUED", "OVERDUE"] },
          returnDate: null,
        },
        include: {
          bookCopy: { include: { book: true } },
        },
      });

      if (!activeLoan) {
        throw new Error(`Немає активних видач для цієї книги (ID: ${bookId}).`);
      }

      const LOAN_PERIOD_DAYS = 14;
      const FINE_PER_DAY = 5;

      const today = new Date();
      const loanDate = new Date(activeLoan.loanDate);
      const dueDate = new Date(loanDate);
      dueDate.setDate(dueDate.getDate() + LOAN_PERIOD_DAYS);

      let fineCreated = null;

      if (today > dueDate) {
        const diffTime = Math.abs(today - dueDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const fineAmount = diffDays * FINE_PER_DAY;

        fineCreated = await tx.fine.upsert({
          where: { loanId: activeLoan.id },
          update: { amount: fineAmount, status: "ISSUED" },
          create: {
            loanId: activeLoan.id,
            amount: fineAmount,
            status: "ISSUED",
          },
        });

        console.log(`⚠️ Штраф: ${fineAmount} грн`);
      }

      const updatedLoan = await tx.loan.update({
        where: { id: activeLoan.id },
        data: {
          status: "RETURNED",
          returnDate: new Date(),
        },
      });

      return { loan: updatedLoan, fine: fineCreated };
    });
  }

  async getAllLoans(limit = 50) {
    const loans = await prisma.loan.findMany({
      take: limit,
      orderBy: { loanDate: "desc" },
      include: {
        bookCopy: { include: { book: true } },
        member: true,
      },
    });

    return loans.map((l) => ({
      ...l,
      book: l.bookCopy.book,
    }));
  }
}

module.exports = new LoanService();
