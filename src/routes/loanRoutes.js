const express = require("express");
const router = express.Router();
const loanController = require("../controllers/loanController");

router.post("/", loanController.createLoan);
router.post("/return", loanController.returnBook);
router.get("/", loanController.getLoans);

module.exports = router;
