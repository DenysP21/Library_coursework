const categoryService = require("../services/categoryService");
const asyncHandler = require("../utils/asyncHandler");

class CategoryController {
  createCategory = asyncHandler(async (req, res) => {
    const { name } = req.body;

    if (!name) {
      res.status(400);
      throw new Error("Назва категорії обов'язкова!");
    }

    const newCategory = await categoryService.createCategory(name);
    res
      .status(201)
      .json({ message: "Категорію створено!", category: newCategory });
  });
}

module.exports = new CategoryController();
