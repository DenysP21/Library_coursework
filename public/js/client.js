const API_URL = "http://localhost:3000/api";

document.addEventListener("DOMContentLoaded", async () => {
  await loadUsers();
  await loadBooks();
});

async function loadUsers() {
  try {
    const res = await fetch(`${API_URL}/members?limit=100`);
    const json = await res.json();
    const members = json.data || json;

    const select = document.getElementById("userSelect");
    members.forEach((m) => {
      const opt = document.createElement("option");
      opt.value = m.id;
      opt.textContent = `${m.surname} ${m.name} (ID: ${m.id})`;
      select.appendChild(opt);
    });
  } catch (err) {
    console.error("Помилка завантаження юзерів:", err);
  }
}

async function loadBooks() {
  try {
    const res = await fetch(`${API_URL}/books`);
    const books = await res.json();

    const container = document.getElementById("booksContainer");
    container.innerHTML = "";

    books.forEach((book) => {
      const authors = book.authorBooks
        .map((ab) => `${ab.author.name} ${ab.author.surname}`)
        .join(", ");

      const col = document.createElement("div");
      col.className = "col-md-6 col-lg-4 mb-3";
      col.innerHTML = `
                <div class="card h-100">
                    <div class="card-body">
                        <h5 class="card-title text-primary">${book.title}</h5>
                        <p class="card-text text-muted mb-2">Автор: ${
                          authors || "Невідомий"
                        }</p>
                        <p class="card-text"><small>Рік: ${
                          book.publicationYear
                        }</small></p>
                        <button onclick="takeBook(${
                          book.id
                        })" class="btn btn-success w-100 mt-2">
                            Взяти книгу
                        </button>
                    </div>
                </div>
            `;
      container.appendChild(col);
    });
  } catch (err) {
    console.error("Помилка завантаження книг:", err);
    document.getElementById("booksContainer").innerHTML =
      "<p class='text-danger'>Не вдалося завантажити книги</p>";
  }
}

async function takeBook(bookId) {
  const memberId = document.getElementById("userSelect").value;

  if (!memberId) {
    alert("Будь ласка, оберіть 'Хто ви?' у списку зверху!");
    return;
  }

  let librarianId = 1;
  try {
    const libRes = await fetch(`${API_URL}/librarians/first`);
    const lib = await libRes.json();
    if (lib && lib.id) librarianId = lib.id;
  } catch (e) {}

  const payload = {
    bookId: parseInt(bookId),
    memberId: parseInt(memberId),
    librarianId: parseInt(librarianId),
  };

  try {
    const res = await fetch(`${API_URL}/loans`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (res.ok) {
      alert(
        `Успіх! Ви взяли книгу "${
          data.data.book.title
        }". Повернути до: ${new Date(
          data.data.returnDate
        ).toLocaleDateString()}`
      );
    } else {
      alert("Помилка: " + (data.error || "Щось пішло не так"));
    }
  } catch (err) {
    console.error(err);
    alert("Помилка з'єднання з сервером");
  }
}
