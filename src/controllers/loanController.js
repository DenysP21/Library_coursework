const loanService = require("../services/loanService");

class LoanController {
  async createLoan(req, res) {
    try {
      const { bookId, memberId, librarianId } = req.body;

      if (!bookId || !memberId || !librarianId) {
        return res
          .status(400)
          .json({ error: "Необхідно вказати bookId, memberId та librarianId" });
      }

      const loan = await loanService.issueBook(
        parseInt(bookId),
        parseInt(memberId),
        parseInt(librarianId)
      );

      res.status(201).json({
        message: "Книгу успішно видано",
        data: loan,
      });
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: error.message });
    }
  }
  async returnBook(req, res) {
    try {
      const { bookId } = req.body;

      if (!bookId) {
        return res.status(400).json({ error: "Необхідно вказати bookId" });
      }

      const result = await loanService.returnBook(parseInt(bookId));

      res.json({
        message: "Книгу успішно повернено",
        data: result,
      });
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new LoanController();
