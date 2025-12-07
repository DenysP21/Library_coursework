const loanService = require("../services/loanService");
const asyncHandler = require("../utils/asyncHandler");

class LoanController {
  createLoan = asyncHandler(async (req, res) => {
    const { bookId, memberId, librarianId } = req.body;

    if (!bookId || !memberId || !librarianId) {
      res.status(400);
      throw new Error("Необхідно вказати bookId, memberId та librarianId");
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
  });

  returnBook = asyncHandler(async (req, res) => {
    const { bookId } = req.body;

    if (!bookId) {
      res.status(400);
      throw new Error("Необхідно вказати bookId");
    }

    const result = await loanService.returnBook(parseInt(bookId));

    res.json({
      message: "Книгу успішно повернено",
      data: result,
    });
  });

  getLoans = asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit) || 50;
    const loans = await loanService.getAllLoans(limit);
    res.json(loans);
  });
}

module.exports = new LoanController();
