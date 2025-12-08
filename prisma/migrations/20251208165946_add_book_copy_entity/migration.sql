/*
  Warnings:

  - You are about to drop the column `book_id` on the `Loan` table. All the data in the column will be lost.
  - Added the required column `copy_id` to the `Loan` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Loan" DROP CONSTRAINT "Loan_book_id_fkey";

-- AlterTable
ALTER TABLE "Loan" DROP COLUMN "book_id",
ADD COLUMN     "copy_id" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "BookCopy" (
    "copy_id" SERIAL NOT NULL,
    "book_id" INTEGER NOT NULL,
    "inventory_number" TEXT NOT NULL,

    CONSTRAINT "BookCopy_pkey" PRIMARY KEY ("copy_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BookCopy_inventory_number_key" ON "BookCopy"("inventory_number");

-- AddForeignKey
ALTER TABLE "BookCopy" ADD CONSTRAINT "BookCopy_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "Book"("book_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Loan" ADD CONSTRAINT "Loan_copy_id_fkey" FOREIGN KEY ("copy_id") REFERENCES "BookCopy"("copy_id") ON DELETE RESTRICT ON UPDATE CASCADE;
