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
      const dateIssued = new Date(loan.loanDate).toLocaleDateString();
      const dateReturned = loan.returnDate
        ? new Date(loan.returnDate).toLocaleDateString()
        : "-";

      const statusBadge = getStatusBadge(loan.status);

      const tr = document.createElement("tr");
      tr.innerHTML = `
          <td>${loan.id}</td>
          <td class="fw-bold">${loan.book.title}</td>
          <td>${loan.member.surname} ${loan.member.name}</td>
          <td>${dateIssued}</td>
          <td>${dateReturned}</td>
          <td>${statusBadge}</td>
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
