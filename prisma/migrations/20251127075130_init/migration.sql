-- CreateEnum
CREATE TYPE "PositionName" AS ENUM ('Провідний бібліотекар', 'Бібліотекар І категорії', 'Бібліотекар ІІ категорії', 'Бібліотекар');

-- CreateEnum
CREATE TYPE "DepartmentName" AS ENUM ('Відділ електронної бібліотеки', 'Відділ читальних залів', 'Відділ рідкісних і цінних книг');

-- CreateEnum
CREATE TYPE "LoanStatus" AS ENUM ('Видано', 'Повернено', 'Прострочено');

-- CreateEnum
CREATE TYPE "FineStatus" AS ENUM ('Нараховано', 'Сплачено', 'Списано');

-- CreateTable
CREATE TABLE "Category" (
    "category_id" SERIAL NOT NULL,
    "category_name" VARCHAR(32) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("category_id")
);

-- CreateTable
CREATE TABLE "Publisher" (
    "pub_id" SERIAL NOT NULL,
    "name" VARCHAR(32) NOT NULL,
    "address" TEXT NOT NULL,

    CONSTRAINT "Publisher_pkey" PRIMARY KEY ("pub_id")
);

-- CreateTable
CREATE TABLE "Author" (
    "author_id" SERIAL NOT NULL,
    "name" VARCHAR(32) NOT NULL,
    "surname" VARCHAR(32) NOT NULL,
    "birth_year" SMALLINT,
    "country" VARCHAR(32),

    CONSTRAINT "Author_pkey" PRIMARY KEY ("author_id")
);

-- CreateTable
CREATE TABLE "Book" (
    "book_id" SERIAL NOT NULL,
    "title" VARCHAR(64) NOT NULL,
    "publication_year" SMALLINT,
    "pub_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Book_pkey" PRIMARY KEY ("book_id")
);

-- CreateTable
CREATE TABLE "AuthorBook" (
    "author_id" INTEGER NOT NULL,
    "book_id" INTEGER NOT NULL,

    CONSTRAINT "AuthorBook_pkey" PRIMARY KEY ("author_id","book_id")
);

-- CreateTable
CREATE TABLE "BookCategory" (
    "category_id" INTEGER NOT NULL,
    "book_id" INTEGER NOT NULL,

    CONSTRAINT "BookCategory_pkey" PRIMARY KEY ("category_id","book_id")
);

-- CreateTable
CREATE TABLE "Librarian" (
    "librarian_id" SERIAL NOT NULL,
    "name" VARCHAR(32) NOT NULL,
    "surname" VARCHAR(32) NOT NULL,
    "position" "PositionName",
    "department" "DepartmentName",
    "email" VARCHAR(32) NOT NULL,

    CONSTRAINT "Librarian_pkey" PRIMARY KEY ("librarian_id")
);

-- CreateTable
CREATE TABLE "Member" (
    "member_id" SERIAL NOT NULL,
    "name" VARCHAR(32) NOT NULL,
    "surname" VARCHAR(32) NOT NULL,
    "address" TEXT NOT NULL,
    "phone_number" VARCHAR(13),
    "registration_date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Member_pkey" PRIMARY KEY ("member_id")
);

-- CreateTable
CREATE TABLE "Loan" (
    "loan_id" SERIAL NOT NULL,
    "member_id" INTEGER NOT NULL,
    "book_id" INTEGER NOT NULL,
    "librarian_id" INTEGER NOT NULL,
    "loan_date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "return_date" DATE,
    "status" "LoanStatus" NOT NULL DEFAULT 'Видано',

    CONSTRAINT "Loan_pkey" PRIMARY KEY ("loan_id")
);

-- CreateTable
CREATE TABLE "Fine" (
    "fine_id" SERIAL NOT NULL,
    "loan_id" INTEGER NOT NULL,
    "amount" DECIMAL(6,2) NOT NULL,
    "status" "FineStatus" NOT NULL DEFAULT 'Нараховано',

    CONSTRAINT "Fine_pkey" PRIMARY KEY ("fine_id")
);

-- CreateIndex
CREATE INDEX "Author_surname_idx" ON "Author"("surname");

-- CreateIndex
CREATE INDEX "Book_title_idx" ON "Book"("title");

-- CreateIndex
CREATE UNIQUE INDEX "Librarian_email_key" ON "Librarian"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Member_phone_number_key" ON "Member"("phone_number");

-- CreateIndex
CREATE INDEX "Member_phone_number_idx" ON "Member"("phone_number");

-- CreateIndex
CREATE INDEX "Loan_status_idx" ON "Loan"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Fine_loan_id_key" ON "Fine"("loan_id");

-- AddForeignKey
ALTER TABLE "Book" ADD CONSTRAINT "Book_pub_id_fkey" FOREIGN KEY ("pub_id") REFERENCES "Publisher"("pub_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuthorBook" ADD CONSTRAINT "AuthorBook_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "Author"("author_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuthorBook" ADD CONSTRAINT "AuthorBook_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "Book"("book_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookCategory" ADD CONSTRAINT "BookCategory_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "Category"("category_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookCategory" ADD CONSTRAINT "BookCategory_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "Book"("book_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Loan" ADD CONSTRAINT "Loan_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "Member"("member_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Loan" ADD CONSTRAINT "Loan_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "Book"("book_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Loan" ADD CONSTRAINT "Loan_librarian_id_fkey" FOREIGN KEY ("librarian_id") REFERENCES "Librarian"("librarian_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fine" ADD CONSTRAINT "Fine_loan_id_fkey" FOREIGN KEY ("loan_id") REFERENCES "Loan"("loan_id") ON DELETE RESTRICT ON UPDATE CASCADE;
