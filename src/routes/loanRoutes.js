const express = require("express");
const router = express.Router();
const loanController = require("../controllers/loanController");

router.post("/", loanController.createLoan);
router.post("/return", loanController.returnBook);

module.exports = router;
