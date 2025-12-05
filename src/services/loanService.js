// src/services/loanService.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class LoanService {
  /**
   * Сценарій: Видача книги (Створення Loan)
   * Демонструє: Валідацію, Транзакційність
   */
  async issueBook(bookId, memberId, librarianId) {
    // Виконуємо все в транзакції
    return await prisma.$transaction(async (tx) => {
      // 1. ВАЛІДАЦІЯ: Перевіряємо, чи існує книга
      const book = await tx.book.findUnique({ where: { id: bookId } });
      if (!book) {
        throw new Error(`Книгу з ID ${bookId} не знайдено.`);
      }

      // 2. ВАЛІДАЦІЯ: Перевіряємо, чи книга зараз доступна (не видана)
      const activeLoan = await tx.loan.findFirst({
        where: {
          bookId: bookId,
          status: "ISSUED", // Шукаємо активну видачу
        },
      });

      if (activeLoan) {
        throw new Error(`Книга "${book.title}" вже видана і ще не повернута.`);
      }

      // 3. ВАЛІДАЦІЯ: Перевіряємо, чи існує читач
      const member = await tx.member.findUnique({
        where: { id: memberId },
      });

      if (!member) {
        throw new Error(`Читача з ID ${memberId} не знайдено.`);
      }

      // Перевірка на soft delete (якщо ми вже реалізували це, або на майбутнє)
      if (member.deletedAt) {
        throw new Error(`Читач видалений/заблокований.`);
      }

      // 4. ДІЯ: Створюємо запис про видачу
      const newLoan = await tx.loan.create({
        data: {
          bookId,
          memberId,
          librarianId,
          loanDate: new Date(),
          status: "ISSUED",
        },
        // Повертаємо повну сутність з пов'язаними даними (Вимога викладача)
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
  /**
   * Сценарій: Повернення книги (Update Entity)
   */
  async returnBook(bookId) {
    return await prisma.$transaction(async (tx) => {
      // 1. Знаходимо активну видачу для цієї книги
      // (Шукаємо статус ISSUED або OVERDUE)
      const activeLoan = await tx.loan.findFirst({
        where: {
          bookId: bookId,
          status: { in: ["ISSUED", "OVERDUE"] },
          returnDate: null, // Тільки ті, де ще не проставлена фактична дата повернення
        },
        include: { book: true },
      });

      if (!activeLoan) {
        throw new Error(`Ця книга (ID: ${bookId}) не рахується виданою.`);
      }

      // 2. Логіка розрахунку штрафу
      // Припустимо, термін видачі - 14 днів
      const LOAN_PERIOD_DAYS = 14;
      const FINE_PER_DAY = 5; // 5 грн за день

      const today = new Date();
      const loanDate = new Date(activeLoan.loanDate);

      // Розраховуємо дедлайн: дата видачі + 14 днів
      const dueDate = new Date(loanDate);
      dueDate.setDate(dueDate.getDate() + LOAN_PERIOD_DAYS);

      let fineCreated = null;

      // Якщо сьогоднішня дата більше за дедлайн - штраф
      if (today > dueDate) {
        // Різниця в часі в мілісекундах -> дні
        const diffTime = Math.abs(today - dueDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const fineAmount = diffDays * FINE_PER_DAY;

        // Створюємо штраф
        fineCreated = await tx.fine.upsert({
          where: {
            loanId: activeLoan.id, // Шукаємо по ID видачі
          },
          // Якщо знайшли - оновлюємо суму
          update: {
            amount: fineAmount,
            status: "ISSUED",
          },
          // Якщо не знайшли - створюємо новий
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

      // 3. Оновлюємо запис про видачу (UPDATE)
      const updatedLoan = await tx.loan.update({
        where: { id: activeLoan.id },
        data: {
          status: "RETURNED",
          returnDate: new Date(), // Ставимо поточну дату як дату фактичного повернення
        },
      });

      return { loan: updatedLoan, fine: fineCreated };
    });
  }
}

module.exports = new LoanService();
