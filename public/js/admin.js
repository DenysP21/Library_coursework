const API_URL = "http://localhost:3000/api";
let allBooks = [];
let editModal;

document.addEventListener("DOMContentLoaded", () => {
  editModal = new bootstrap.Modal(document.getElementById("editBookModal"));

  loadOptions();
  loadBooksList();
  loadLoansList();
});

async function loadOptions() {
  try {
    const res = await fetch(`${API_URL}/books/options`);
    const data = await res.json();

    fillSelect("publisherSelect", data.publishers, (p) => p.name);
    fillSelect("authorSelect", data.authors, (a) => `${a.surname} ${a.name}`);
    fillSelect("categorySelect", data.categories, (c) => c.name);
    fillSelect("editPublisherSelect", data.publishers, (p) => p.name);
    fillSelect(
      "editAuthorSelect",
      data.authors,
      (a) => `${a.surname} ${a.name}`
    );
    fillSelect("editCategorySelect", data.categories, (c) => c.name);
  } catch (err) {
    console.error("Помилка завантаження опцій:", err);
  }
}

function fillSelect(elementId, items, textFn) {
  const select = document.getElementById(elementId);
  select.innerHTML = '<option value="" selected disabled>Оберіть...</option>';

  items.forEach((item) => {
    const opt = document.createElement("option");
    opt.value = item.id;
    opt.textContent = textFn(item);
    select.appendChild(opt);
  });
}

document.getElementById("addBookForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const payload = {
    title: document.getElementById("title").value,
    publicationYear: document.getElementById("year").value,
    publisherId: document.getElementById("publisherSelect").value,
    authorId: document.getElementById("authorSelect").value,
    categoryId: document.getElementById("categorySelect").value,
  };

  try {
    const res = await fetch(`${API_URL}/books`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      alert("✅ Книгу успішно додано!");
      document.getElementById("addBookForm").reset();
      loadBooksList();
    } else {
      const err = await res.json();
      alert("❌ Помилка: " + err.error);
    }
  } catch (error) {
    console.error(error);
    alert("Помилка з'єднання");
  }
});

async function loadBooksList() {
  try {
    const res = await fetch(`${API_URL}/books`);
    const responseData = await res.json();

    allBooks = responseData.items ? responseData.items : responseData;

    const tbody = document.getElementById("booksTableBody");
    tbody.innerHTML = "";

    allBooks.forEach((b) => {
      const list = b.authors || [];
      const authors = list.map((item) => item.author.surname).join(", ");

      const tr = document.createElement("tr");
      tr.innerHTML = `
          <td>${b.id}</td>
          <td class="fw-bold">${b.title}</td>
          <td>${authors}</td>
          <td>${b.publicationYear}</td>
          <td>${b.publisher ? b.publisher.name : "-"}</td>
          <td>
            <button class="btn btn-sm btn-primary" onclick="openEditModal(${
              b.id
            })">✏️</button>
          </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (error) {
    console.error("Помилка завантаження книг:", error);
  }
}

window.openEditModal = (id) => {
  const book = allBooks.find((b) => b.id === id);
  if (!book) return;

  document.getElementById("editBookId").value = book.id;
  document.getElementById("editTitle").value = book.title;
  document.getElementById("editYear").value = book.publicationYear;
  document.getElementById("editPublisherSelect").value = book.publisherId;

  if (book.authors && book.authors.length > 0) {
    document.getElementById("editAuthorSelect").value =
      book.authors[0].authorId;
  }

  if (book.categories && book.categories.length > 0) {
    document.getElementById("editCategorySelect").value =
      book.categories[0].categoryId;
  }

  editModal.show();
};

document
  .getElementById("editBookForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const id = document.getElementById("editBookId").value;

    const payload = {
      title: document.getElementById("editTitle").value,
      publicationYear: document.getElementById("editYear").value,
      publisherId: document.getElementById("editPublisherSelect").value,
      authorId: document.getElementById("editAuthorSelect").value,
      categoryId: document.getElementById("editCategorySelect").value,
    };

    try {
      const res = await fetch(`${API_URL}/books/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert("✅ Книгу оновлено!");
        editModal.hide();
        loadBooksList();
      } else {
        const err = await res.json();
        alert("Помилка оновлення: " + (err.error || "Невідома помилка"));
      }
    } catch (err) {
      console.error(err);
      alert("Помилка з'єднання");
    }
  });
async function loadLoansList() {
  try {
    const res = await fetch(`${API_URL}/loans`);
    const loans = await res.json();

    const tbody = document.getElementById("loansTableBody");
    tbody.innerHTML = "";

    loans.forEach((loan) => {
      const dateIssued = new Date(loan.loanDate).toLocaleDateString("uk-UA");

      let dateReturned;
      if (loan.returnDate) {
        dateReturned = new Date(loan.returnDate).toLocaleDateString("uk-UA");
      } else {
        const deadline = new Date(loan.loanDate);
        deadline.setDate(deadline.getDate() + 14);
        dateReturned = `<span class="text-muted">до ${deadline.toLocaleDateString(
          "uk-UA"
        )}</span>`;
      }

      const statusBadge = getStatusBadge(loan.status);

      let actionBtn = "-";
      if (loan.status !== "RETURNED") {
        actionBtn = `
          <button 
            class="btn btn-sm btn-outline-success" 
            onclick="returnBook(${loan.book.id})"
            title="Повернути книгу"
          >
            📥 Повернути
          </button>
        `;
      }

      const tr = document.createElement("tr");
      tr.innerHTML = `
          <td>${loan.id}</td>
          <td class="fw-bold text-primary">${loan.book.title}</td>
          <td>${loan.member.surname} ${loan.member.name}</td>
          <td>${dateIssued}</td>
          <td>${dateReturned}</td>
          <td class="text-center">${statusBadge}</td>
          <td class="text-center">${actionBtn}</td>
      `;
      tbody.appendChild(tr);
    });
  } catch (error) {
    console.error("Помилка завантаження видач:", error);
  }
}

function getStatusBadge(status) {
  const badges = {
    ISSUED: '<span class="badge bg-warning text-dark">Видано</span>',
    RETURNED: '<span class="badge bg-success">Повернено</span>',
    OVERDUE: '<span class="badge bg-danger">Прострочено</span>',
  };

  return badges[status] || `<span class="badge bg-secondary">${status}</span>`;
}

document
  .getElementById("addCategoryForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const nameInput = document.getElementById("newCategoryName");
    const name = nameInput.value;

    try {
      const res = await fetch(`${API_URL}/categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (res.ok) {
        alert("✅ Категорію успішно створено!");

        nameInput.value = "";
        const modal = bootstrap.Modal.getInstance(
          document.getElementById("addCategoryModal")
        );
        modal.hide();

        loadOptions();
      } else {
        const err = await res.json();
        alert("Помилка: " + err.error);
      }
    } catch (error) {
      console.error(error);
      alert("Помилка з'єднання");
    }
  });

document
  .getElementById("addAuthorForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const payload = {
      name: document.getElementById("newAuthorName").value,
      surname: document.getElementById("newAuthorSurname").value,
      birthYear: document.getElementById("newAuthorYear").value,
      country: document.getElementById("newAuthorCountry").value,
    };

    try {
      const res = await fetch(`${API_URL}/authors`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert("✅ Автора успішно створено!");

        document.getElementById("addAuthorForm").reset();
        const modal = bootstrap.Modal.getInstance(
          document.getElementById("addAuthorModal")
        );
        modal.hide();

        loadOptions();
      } else {
        const err = await res.json();
        alert("Помилка: " + err.error);
      }
    } catch (error) {
      console.error(error);
      alert("Помилка з'єднання");
    }
  });

async function returnBook(bookId) {
  if (!confirm("Підтвердити повернення книги?")) return;

  try {
    const res = await fetch(`${API_URL}/loans/return`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookId: parseInt(bookId) }),
    });

    const data = await res.json();

    if (res.ok) {
      if (data.data.fine) {
        alert(
          `⚠️ Книгу повернено із запізненням!\n💰 Нараховано штраф: ${data.data.fine.amount} грн.`
        );
      } else {
        alert("✅ Книгу успішно повернено!");
      }

      loadLoansList();
      loadBooksList();
    } else {
      alert("Помилка: " + (data.error || "Щось пішло не так"));
    }
  } catch (err) {
    console.error(err);
    alert("Помилка з'єднання");
  }
}
