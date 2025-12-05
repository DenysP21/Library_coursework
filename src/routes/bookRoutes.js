const express = require("express");
const router = express.Router();
const bookController = require("../controllers/bookController");

router.get("/options", bookController.getFormOptions);
router.get("/", bookController.getAllBooks);
router.post("/", bookController.createBook);
router.put("/:id", bookController.updateBook);

module.exports = router;
