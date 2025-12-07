const authorService = require("../services/authorService");
const asyncHandler = require("../utils/asyncHandler");

class AuthorController {
  createAuthor = asyncHandler(async (req, res) => {
    const { name, surname, birthYear, country } = req.body;

    if (!name || !surname) {
      res.status(400);
      throw new Error("Ім'я та Прізвище автора обов'язкові!");
    }

    const newAuthor = await authorService.createAuthor({
      name,
      surname,
      birthYear,
      country,
    });
    res.status(201).json({ message: "Автора створено!", author: newAuthor });
  });
}

module.exports = new AuthorController();
