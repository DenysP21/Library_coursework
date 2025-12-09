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

  async returnBook(loanId) {
    const activeLoan = await prisma.loan.findUnique({
      where: { id: loanId },
      include: { bookCopy: true },
    });

    if (!activeLoan) {
      throw new Error(`Позика з ID ${loanId} не знайдена.`);
    }

    if (activeLoan.status === "RETURNED") {
      throw new Error(`Ця книга вже повернута.`);
    }

    return await prisma.$transaction(async (tx) => {
      const settings = await tx.systemSetting.findFirst();

      const LOAN_PERIOD_DAYS = settings ? settings.loanPeriodDays : 14;
      const FINE_PER_DAY = settings ? settings.finePerDay : 5.0;

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

    return loans.map((l) => {
      const copy = l.bookCopy || {};
      const book = copy.book || { title: "Назва не знайдена" };

      return {
        ...l,
        book: book,
        inventoryNumber: copy.inventoryNumber || "Н/Д",
      };
    });
  }
}

module.exports = new LoanService();
