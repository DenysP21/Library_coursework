# Library Management System

## Курсова робота з дисципліни "Бази даних"

Backend-додаток для автоматизації роботи бібліотеки. Система дозволяє керувати каталогом книг (CRUD, пагінація), обліком читачів, процесом видачі літератури та отримувати аналітичні звіти.

## Виконав: Пучков Денис ІМ-41

---

## Технологічний стек

- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL 14
- **ORM:** Prisma Client
- **Транзакції, CHECK-обмеження, Foreign Keys, Soft Delete**
- **Containerization:** Docker & Docker Compose
- **Testing:** Jest, Supertest
- **Frontend:** HTML5, Bootstrap 5 (Admin Dashboard)

---

## Інструкція з запуску

### Передумови

Встановлені [Docker Desktop](https://www.docker.com/) та [Node.js](https://nodejs.org/).

### Крок 1. Клонування репозиторію

```bash
git clone https://github.com/DenysP21/Library_coursework
cd library
```

### Крок 2. Налаштування змінних середовища

Створіть файл .env у корені проєкту. Ви можете скопіювати приклад:

```bash
cp .env.example .env
```

Вміст .env має виглядати так:

```
PORT=3000
DATABASE_URL="postgresql://user:password@localhost:5432/library_db_dev"
```

### Крок 3. Запуск бази даних

Використовуємо Docker Compose для підняття PostgreSQL:

```bash
docker-compose up -d db
```

### Крок 4. Встановлення та запуск

```Bash
# 1. Встановлення залежностей
npm install

# 2. Виконання міграцій (створення таблиць у БД)
npm run db:migrate

# 3. Наповнення бази тестовими даними (Seed)
npm run db:seed

# 4. Запуск сервера
npm start
```

Сервер запуститься за адресою: http://localhost:3000

### Доступ до інтерфейсу

- _Адмін-панель (Керування книгами, авторами, категоріями, перегляд історії)_: http://localhost:3000/admin.html
- _Клієнтська частина (Симуляція взяття книги читачем)_: http://localhost:3000/client.html

---

### Тестування

Проєкт покритий інтеграційними тестами, які перевіряють транзакції, валідацію, бізнес-логіку та коректність аналітичних запитів.

#### Запуск всіх тестів:

```bash
npm test
```

#### Запуск конкретного тестового файлу

Якщо потрібно запустити лише певний блок тестів (наприклад, тільки аналітику або тільки видачу книг), передайте назву файлу (або її частину) як аргумент:

```bash
# Тести звітів (SQL-аналітика, агрегації)
npm test reports

# Тести видачі книг (транзакції, блокування боржників)
npm test loans

# Тести видалення (Soft Delete)
npm test members

# Тести пагінації книг
npm test books

# Модульні (Unit): Валідація даних
npm test validation
```

---

## Приклади використання API

### 1. Книги (Books)

**Отримати список книг (з пагінацією та пошуком):**
`GET /api/books?page=1&limit=10&search=Kobzar`

**Додати нову книгу:**
`POST /api/books`

```json
{
  "title": "Кобзар",
  "publicationYear": 2020,
  "publisherId": 1,
  "authorId": 2,
  "categoryId": 3
}
```

### 2. Видача книг (Loans)

**Видати книгу читачу:**
`POST /api/loans`

```json
{
  "bookId": 10,
  "memberId": 5,
  "librarianId": 1
}
```

> _Примітка: Якщо книга вже видана, сервер поверне помилку 500 (валідація транзакції)._

**Повернути книгу:**
`POST /api/loans/return`

```json
{
  "bookId": 10
}
```

> _Примітка: Якщо є прострочка, автоматично нарахується штраф._

### 3. Звіти (Reports)

**Топ найактивніших читачів:**
`GET /api/reports/top-readers?limit=5`

**Статистика популярності жанрів:**
`GET /api/reports/categories`

---

## Аналітичні запити (SQL)

У `docs/queries.md` детально описані та пояснені SQL-запити, реалізовані через `prisma.$queryRaw`. Вони демонструють використання `JOIN`, агрегатних функцій та групування:

1.  **Топ читачів** — аналіз активності користувачів та їх фінансової дисципліни (штрафи).
2.  **Популярність категорій** — статистика видач книг за жанрами.

---

## Структура проєкту

```bash
.
├── src/
│ ├── controllers/      # Обробка HTTP запитів
│ ├── services/         # Бізнес-логіка, робота з БД, SQL-запити
│ ├── routes/           # Маршрути API
│ ├── middleware/       # Обробка помилок
│ ├── utils/            # Допоміжні функції (asyncHandler)
│ └── server.js         # Точка входу
├── prisma/
│ ├── schema.prisma     # Опис схеми БД
│ ├── migrations/       # Історія змін БД
│ └── seed.js            # Скрипт наповнення даними
├── public/             # Frontend (HTML/JS/CSS)
├── tests/              # Інтеграційні тести
├── docs/               # Додаткова документація
└── docker-compose.yml
```
