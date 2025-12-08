const loanController = require("../../src/controllers/loanController");

const mockRequest = (body) => ({
  body,
});

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("Unit: Loan Controller Validation", () => {
  test("createLoan має викликати next(error) зі статусом 400, якщо немає даних", async () => {
    const req = mockRequest({ memberId: 1, librarianId: 1 });
    const res = mockResponse();
    const next = jest.fn();

    await loanController.createLoan(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });

  test("returnBook має викликати next(error) зі статусом 400, якщо немає bookId", async () => {
    const req = mockRequest({});
    const res = mockResponse();
    const next = jest.fn();

    await loanController.returnBook(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});
