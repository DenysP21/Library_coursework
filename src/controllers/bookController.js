const bookService = require("../services/bookService");

class BookController {
  async getFormOptions(req, res) {
    try {
      const data = await bookService.getFormOptions();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getAllBooks(req, res) {
    try {
      const books = await bookService.getAllBooks();
      res.json(books);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async createBook(req, res) {
    try {
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

      const newBook = await bookService.createBook(req.body);

      res.status(201).json({ message: "Книгу додано!", book: newBook });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Помилка сервера при створенні книги" });
    }
  }
  async updateBook(req, res) {
    try {
      const { id } = req.params;
      const updatedBook = await bookService.updateBook(id, req.body);
      res.json({ message: "Книгу оновлено!", book: updatedBook });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Помилка при оновленні книги" });
    }
  }
}

module.exports = new BookController();
