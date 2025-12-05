const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

router.get("/first", async (req, res) => {
  try {
    const lib = await prisma.librarian.findFirst();
    res.json(lib);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
