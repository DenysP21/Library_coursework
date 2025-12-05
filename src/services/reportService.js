const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class ReportService {
  async getTopReaders() {
    const result = await prisma.$queryRaw`
      SELECT 
        m.name, 
        m.surname, 
        m.phone_number,
        COUNT(l.loan_id)::int as total_loans,
        COUNT(f.fine_id)::int as total_fines,
        COALESCE(SUM(f.amount), 0) as total_fine_amount
      FROM "Member" m
      LEFT JOIN "Loan" l ON m.member_id = l.member_id
      LEFT JOIN "Fine" f ON l.loan_id = f.loan_id
      GROUP BY m.member_id, m.name, m.surname, m.phone_number
      HAVING COUNT(l.loan_id) > 0
      ORDER BY total_loans DESC
      LIMIT 5;
    `;

    return result.map((row) => ({
      ...row,
      total_loans: Number(row.total_loans),
      total_fines: Number(row.total_fines),
    }));
  }

  async getCategoryStats() {
    const result = await prisma.$queryRaw`
      SELECT 
        c.category_name as category,
        COUNT(l.loan_id)::int as loan_count
      FROM "Category" c
      JOIN "BookCategory" bc ON c.category_id = bc.category_id
      JOIN "Book" b ON bc.book_id = b.book_id
      JOIN "Loan" l ON b.book_id = l.book_id
      GROUP BY c.category_id, c.category_name
      ORDER BY loan_count DESC;
    `;

    return result.map((row) => ({
      ...row,
      loan_count: Number(row.loan_count),
    }));
  }
}

module.exports = new ReportService();
