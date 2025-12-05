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
  test("createLoan має повернути 400, якщо немає bookId", async () => {
    const req = mockRequest({ memberId: 1, librarianId: 1 });
    const res = mockResponse();

    await loanController.createLoan(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.stringContaining("Необхідно вказати"),
      })
    );
  });

  test("createLoan має повернути 400, якщо немає memberId", async () => {
    const req = mockRequest({ bookId: 1, librarianId: 1 });
    const res = mockResponse();

    await loanController.createLoan(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });
});
