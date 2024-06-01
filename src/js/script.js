const books = [];
const RENDER_EVENT = "render-book";
const SAVED_EVENT = "saved-book";
const STORAGE_KEY = "BOOK-SHELF-APPS";
const addBook = document.querySelector(".btn-add-book");

document.addEventListener("DOMContentLoaded", function () {
  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

addBook.addEventListener("click", async () => {
  const { value: formValues } = await Swal.fire({
    title: "Enter book details",
    html: `
        <label for="title">Title</label>
        <input class="form-control" id="title" type="text" placeholder="Book title" style="margin-bottom: 10px;"> <br>
        <label for="author">Author</label>
        <input class="form-control" id="author" type="text" placeholder="Book author" style="margin-bottom: 10px;"> <br>
        <label for="year">Year</label>
        <input class="form-control" id="year" type="number" placeholder="Year publish" style="margin-bottom: 10px;"> <br>
        <input id="isComplete" type="checkbox">
        <label for="isComplete">Already read?</label>
        `,
    focusConfirm: false,

    preConfirm: () => {
      const title = document.getElementById("title").value;
      const author = document.getElementById("author").value;
      const year = document.getElementById("year").value;
      if (!title || !author || !year) {
        Swal.showValidationMessage("Please fill out all fields");
        return false;
      }
      return {
        title: title,
        author: author,
        year: year,
        isComplete: document.getElementById("isComplete").checked,
      };
    },
  });
  if (formValues) {
    createBook(formValues);
  }
});

function createBook(bookData) {
  const { title, author, year, isComplete } = bookData;
  const yearBook = parseInt(year);
  const generatedID = generateId();
  const bookObject = generateBookObject(generatedID, title, author, yearBook, isComplete);
  books.push(bookObject);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();

  if (isComplete) Swal.fire(`${title} added in the finished reading section`);
  else Swal.fire(`${title} added in the unread section`);
}

function generateBookObject(id, title, author, year, isComplete) {
  return {
    id,
    title,
    author,
    year,
    isComplete,
  };
}

function generateId() {
  return +new Date();
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

function isStorageExist() {
  if (typeof Storage === undefined) {
    alert("Browser kamu tidak mendukung local storage");
    return false;
  }
  return true;
}

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}

document.addEventListener(RENDER_EVENT, function () {
  const uncompletedBOOKList = document.getElementById("incompleteBookshelfList");
  uncompletedBOOKList.innerHTML = "";

  const completeBOOKList = document.getElementById("completeBookshelfList");
  completeBOOKList.innerHTML = "";

  for (const bookItem of books) {
    const bookElement = makeInputBook(bookItem);
    if (!bookItem.isComplete) uncompletedBOOKList.append(bookElement);
    else completeBOOKList.append(bookElement);
  }
});

function renderBookList(bookList) {
  const uncompletedBOOKList = document.getElementById("incompleteBookshelfList");
  uncompletedBOOKList.innerHTML = "";

  const completeBOOKList = document.getElementById("completeBookshelfList");
  completeBOOKList.innerHTML = "";

  for (const bookItem of bookList) {
    const bookElement = makeInputBook(bookItem);
    if (!bookItem.isComplete) uncompletedBOOKList.append(bookElement);
    else completeBOOKList.append(bookElement);
  }
}

function makeInputBook(bookObject) {
  const textTitle = document.createElement("h3");
  textTitle.innerText = bookObject.title;

  const textAuthor = document.createElement("p");
  textAuthor.innerText = `Penulis : ${bookObject.author}`;

  const textYear = document.createElement("p");
  textYear.innerText = `Tahun : ${bookObject.year}`;

  const textArticle = document.createElement("article");
  textArticle.classList.add("book_item");
  textArticle.append(textTitle, textAuthor, textYear);

  const article = document.createElement("article");
  article.classList.add("book_item");
  article.append(textArticle);
  article.setAttribute("id", `Book-${bookObject.id}`);

  const actionDiv = document.createElement("div");
  actionDiv.classList.add("action");

  if (bookObject.isComplete) {
    const unreadButton = document.createElement("button");
    unreadButton.classList.add("green");
    unreadButton.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#fff"> <title>unread Book</title> <path d="M866-682H595v-111h271v111ZM166-69v-679q0-53 36.5-89.5T292-874h223v126H292v488l188-80 188 80v-262h126v453L480-203 166-69Zm126-679h223-223Z"/></svg>';

    unreadButton.addEventListener("click", function () {
      undoBookFromRead(bookObject.id);
      Swal.fire(`${bookObject.title} move to unread section`);
    });

    const removeBook = document.createElement("button");
    removeBook.classList.add("red");
    removeBook.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#fff"> <title>Delete Book</title> <path d="M269-86q-53 0-89.5-36.5T143-212v-497H80v-126h257v-63h284v63h259v126h-63v497q0 53-36.5 89.5T691-86H269Zm422-623H269v497h422v-497ZM342-281h103v-360H342v360Zm173 0h103v-360H515v360ZM269-709v497-497Z"/></svg>';

    removeBook.addEventListener("click", function () {
      Swal.fire({
        title: `Are you sure want to delete ${bookObject.title}?`,
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: "Delete",
        denyButtonText: `Don't Delete`,
      }).then((result) => {
        if (result.isConfirmed) {
          Swal.fire("Saved!", `${bookObject.title} has been deleted`, "success");
          deleteBook(bookObject.id);
        } else if (result.isDenied) {
          Swal.fire("Deletion cancelled", "", "info");
        }
      });
    });

    actionDiv.append(unreadButton, removeBook);
  } else {
    const readBook = document.createElement("button");
    readBook.classList.add("green");
    readBook.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#fff"> <title>Read Book</title> <path d="M730-602 595-737l78-78 57 57 141-142 78 78-219 220ZM166-69v-679q0-53 36.5-89.5T292-874h223v126H292v488l188-80 188 80v-262h126v453L480-203 166-69Zm126-679h223-223Z"/></svg>';

    readBook.addEventListener("click", function () {
      moveBooktoRead(bookObject.id);
      Swal.fire(`${bookObject.title} has been moved to finished reading section`);
    });

    const removeBook = document.createElement("button");
    removeBook.classList.add("red");
    removeBook.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#fff"> <title>Delete Book</title> <path d="M269-86q-53 0-89.5-36.5T143-212v-497H80v-126h257v-63h284v63h259v126h-63v497q0 53-36.5 89.5T691-86H269Zm422-623H269v497h422v-497ZM342-281h103v-360H342v360Zm173 0h103v-360H515v360ZM269-709v497-497Z"/></svg>';

    removeBook.addEventListener("click", function () {
      Swal.fire({
        title: `Are you sure want to delete ${bookObject.title}?`,
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: "Delete",
        denyButtonText: `Don't Delete`,
      }).then((result) => {
        if (result.isConfirmed) {
          Swal.fire("Saved!", `${bookObject.title} has been deleted`, "success");
          deleteBook(bookObject.id);
        } else if (result.isDenied) {
          Swal.fire("Deletion cancelled", "", "info");
        }
      });
    });

    actionDiv.append(readBook, removeBook);
  }

  article.append(actionDiv);

  return article;
}

document.addEventListener("DOMContentLoaded", function () {
  const searchForm = document.getElementById("searchBook");
  searchForm.addEventListener("input", function (event) {
    event.preventDefault();
    searchBook();
  });
});

function searchBook() {
  const searchTitle = document.getElementById("searchBookTitle").value.toLowerCase();

  const filteredBooks = books.filter(function (book) {
    return book.title.toLowerCase().includes(searchTitle);
  });

  renderBookList(filteredBooks);
}

function findBook(bookId) {
  for (const bookItem of books) {
    if (bookItem.id === bookId) {
      return bookItem;
    }
  }
  return null;
}

function undoBookFromRead(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isComplete = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function moveBooktoRead(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isComplete = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function deleteBook(bookId) {
  const bookTarget = findBookIndex(bookId);

  if (bookTarget === -1) return;

  books.splice(bookTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function findBookIndex(bookId) {
  for (const index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }

  return -1;
}
