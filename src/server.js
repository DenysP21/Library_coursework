const express = require("express");
const cors = require("cors");
const path = require("path");

const loanRoutes = require("./routes/loanRoutes");
const memberRoutes = require("./routes/memberRoutes");
const reportRoutes = require("./routes/reportRoutes");
const bookRoutes = require("./routes/bookRoutes");
const librarianRoutes = require("./routes/librarianRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const authorRoutes = require("./routes/authorRoutes");
const settingsRoutes = require("./routes/settingsRoutes");
const errorHandler = require("./middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

app.use((req, res, next) => {
  console.log(`[LOG] ${req.method} ${req.url}`);
  next();
});

app.use("/api/loans", loanRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/librarians", librarianRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/authors", authorRoutes);
app.use("/api/settings", settingsRoutes);

app.get("/health", async (req, res) => {
  res.json({ status: "OK", timestamp: new Date() });
});

app.use(express.static(path.join(__dirname, "../public")));
app.use(errorHandler);

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

module.exports = app;
