const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");

router.get("/top-readers", reportController.getTopReaders);
router.get("/categories", reportController.getCategoryStats);

module.exports = router;
