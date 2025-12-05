const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class LoanService {
  async issueBook(bookId, memberId, librarianId) {
    return await prisma.$transaction(async (tx) => {
      const book = await tx.book.findUnique({ where: { id: bookId } });
      if (!book) {
        throw new Error(`Книгу з ID ${bookId} не знайдено.`);
      }

      const activeLoan = await tx.loan.findFirst({
        where: {
          bookId: bookId,
          status: "ISSUED",
        },
      });

      if (activeLoan) {
        throw new Error(`Книга "${book.title}" вже видана.`);
      }

      const member = await tx.member.findUnique({
        where: { id: memberId },
      });

      if (!member) {
        throw new Error(`Читача з ID ${memberId} не знайдено.`);
      }

      if (member.deletedAt) {
        throw new Error(`Читач видалений/заблокований.`);
      }

      const newLoan = await tx.loan.create({
        data: {
          bookId,
          memberId,
          librarianId,
          loanDate: new Date(),
          status: "ISSUED",
        },
        include: {
          book: true,
          member: true,
          librarian: true,
        },
      });

      console.log(
        `✅ Книга "${book.title}" успішно видана читачу ${member.surname}`
      );
      return newLoan;
    });
  }

  async returnBook(bookId) {
    return await prisma.$transaction(async (tx) => {
      const activeLoan = await tx.loan.findFirst({
        where: {
          bookId: bookId,
          status: { in: ["ISSUED", "OVERDUE"] },
          returnDate: null,
        },
        include: { book: true },
      });

      if (!activeLoan) {
        throw new Error(`Ця книга (ID: ${bookId}) не рахується виданою.`);
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
          where: {
            loanId: activeLoan.id,
          },
          update: {
            amount: fineAmount,
            status: "ISSUED",
          },
          create: {
            loanId: activeLoan.id,
            amount: fineAmount,
            status: "ISSUED",
          },
        });
        console.log(
          `⚠️ Нараховано штраф: ${fineAmount} грн за ${diffDays} днів прострочки.`
        );
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
}

module.exports = new LoanService();
