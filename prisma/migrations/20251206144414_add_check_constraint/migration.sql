ALTER TABLE "Fine" 
ADD CONSTRAINT check_fine_positive CHECK (amount >= 0);

ALTER TABLE "Book" 
ADD CONSTRAINT check_book_year_valid CHECK ("publication_year" > 0 AND "publication_year" <= 2100);

ALTER TABLE "Author" 
ADD CONSTRAINT check_author_birth_valid CHECK ("birth_year" > 0);