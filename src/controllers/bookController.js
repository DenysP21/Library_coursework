const bookService = require("../services/bookService");
const asyncHandler = require("../utils/asyncHandler");

class BookController {
  getFormOptions = asyncHandler(async (req, res) => {
    const data = await bookService.getFormOptions();
    res.json(data);
  });

  getAllBooks = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;

    const result = await bookService.getAllBooks(page, limit);
    res.json(result);
  });

  createBook = asyncHandler(async (req, res) => {
    const { title, publicationYear, publisherId, authorId, categoryId } =
      req.body;

    if (
      !title ||
      !publicationYear ||
      !publisherId ||
      !authorId ||
      !categoryId
    ) {
      return res.status(400).json({ error: "Всі поля обов'язкові!" });
    }

    const cleanData = {
      title,
      publicationYear: parseInt(publicationYear),
      publisherId: parseInt(publisherId),
      authorId: parseInt(authorId),
      categoryId: parseInt(categoryId),
    };
    const newBook = await bookService.createBook(cleanData);

    res.status(201).json({ message: "Книгу додано!", book: newBook });
  });

  updateBook = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const cleanData = {
      title: req.body.title,
      publicationYear: parseInt(req.body.publicationYear),
      publisherId: parseInt(req.body.publisherId),
      authorId: parseInt(req.body.authorId),
      categoryId: parseInt(req.body.categoryId),
    };

    const updatedBook = await bookService.updateBook(parseInt(id), cleanData);
    res.json({ message: "Книгу оновлено!", book: updatedBook });
  });
}

module.exports = new BookController();
