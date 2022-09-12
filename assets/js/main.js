// Modal function
function openModal(){
    document.getElementById("modal").classList.add("modal-active");
}
function closeModal(){
    document.querySelector(".modal-confirm-delete").classList.remove("modal-active");
    document.querySelector(".modal-profile").classList.remove("modal-active");
}

// Book Event
const books = [];
const RENDER_EVENT = 'render-book';

document.addEventListener('DOMContentLoaded', function () {
  const submitForm = document.getElementById('formBook');
    submitForm.addEventListener('submit', function (event) {
      event.preventDefault();
      addBook();
      submitForm.reset();
    });
    const searchForm = document.getElementById('searchBook');
    searchForm.addEventListener('keyup', searchBookItem); 
    
    if (isStorageExist()) {
      loadDataFromStorage();
    }
});

function searchBookItem(event) {
  const searchItem = event.target.value.toLowerCase();
  let itemList = document.querySelectorAll('.book-data');
  
  itemList.forEach((item) => {
    const itemValue = item.textContent.toLowerCase();

    if (itemValue.indexOf(searchItem) != -1) {
      item.parentElement.setAttribute('style', 'display: flex;');
    } else {
      item.parentElement.setAttribute('style', 'display: none !important;');
    }
  });
}
function addBook() {
    const bookTitle = document.getElementById('book-title').value;
    const author = document.getElementById('author').value;
    const year = document.getElementById('year').value;
   
    const generatedID = generateId();
    const bookObject = generateBookObject(generatedID, bookTitle, author, year, false);
    books.push(bookObject);
   
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function generateId() {
    return +new Date();
}

function generateBookObject(id, title, author, year, isComplete) {
    return {
      id,
      title,
      author,
      year,
      isComplete
    }
}

document.addEventListener(RENDER_EVENT, function () {
    bookCount();
});

function makeBookItem(bookObject) {
    const bookTitle = document.createElement('h3');
    bookTitle.innerText = bookObject.title;
   
    const author = document.createElement('p');
    author.innerText = 'Penulis : '+bookObject.author;
   
    const year = document.createElement('p');
    year.innerText = 'Tahun : '+bookObject.year;

    const textContainer = document.createElement('div');
    textContainer.classList.add('book-data');
    textContainer.append(bookTitle, author, year);
   
    const container = document.createElement('article');
    container.classList.add('book-item');
    container.append(textContainer);
    container.setAttribute('id', `book-${bookObject.id}`);
   
    if (bookObject.isComplete) {
        const undoButton = document.createElement('button');
        undoButton.classList.add('undo-button', 'fas', 'fa-undo-alt');
     
        undoButton.addEventListener('click', function () {
          undoBookFromCompleted(bookObject.id);
        });
     
        const trashButton = document.createElement('button');
        trashButton.classList.add('trash-button', 'fas', 'fa-trash-alt');
     
        trashButton.addEventListener('click', function () {
          const modalDelete = document.querySelector(".modal-confirm-delete");
          modalDelete.classList.add("modal-active");
          document.querySelector('.btn-confirm').addEventListener('click', function () {
            removeBookFromCompleted(bookObject.id);
          });
        });
     
        container.append(undoButton, trashButton);
      } else {
        const checkButton = document.createElement('button');
        checkButton.classList.add('check-button','fas', 'fa-check-circle');
        
        checkButton.addEventListener('click', function () {
          addBookToComplete(bookObject.id);
        });
        
        const trashButton = document.createElement('button');
        trashButton.classList.add('trash-button', 'fas', 'fa-trash-alt');
     
        trashButton.addEventListener('click', function () {
          const modalDelete = document.querySelector(".modal-confirm-delete");
          modalDelete.classList.add("modal-active");
          document.querySelector('.btn-confirm').addEventListener('click', function () {
            removeBookFromCompleted(bookObject.id);
          });
        });

        container.append(checkButton, trashButton);
      }
      return container;
}

document.addEventListener(RENDER_EVENT, function () {
    const incompletedBookList = document.getElementById('incomplete-books');
    incompletedBookList.innerHTML = '';
   
    for (const bookItem of books) {
      const bookElement = makeBookItem(bookItem);
      incompletedBookList.append(bookElement);
    }
  });

function addBookToComplete(bookId) {
    const bookTarget = findBook(bookId);
   
    if (bookTarget == null) return;
   
    bookTarget.isComplete = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function findBook(bookId) {
  for (const bookItem of books) {
    if (bookItem.id === bookId) {
      return bookItem;
    }
  }
  return null;
}

document.addEventListener(RENDER_EVENT, function () {
  const incompletedBookList = document.getElementById('incomplete-books');
  incompletedBookList.innerHTML = '';
 
  const completedBookList = document.getElementById('complete-books');
  completedBookList.innerHTML = '';
 
  for (const bookItem of books) {
    const bookElement = makeBookItem(bookItem);
    if (!bookItem.isComplete)
      incompletedBookList.append(bookElement);
    else
      completedBookList.append(bookElement);
  }
});

function removeBookFromCompleted(bookId) {
  const bookTarget = findBookIndex(bookId);
    if (bookTarget === -1) return;
 
    books.splice(bookTarget, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));
  
  saveData();
}
 
 
function undoBookFromCompleted(bookId) {
  const bookTarget = findBook(bookId);
 
  if (bookTarget == null) return;
 
  bookTarget.isComplete = false;
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

function bookCount(){
  let countCompletedRead=0;
  let countIncompletedRead=0;
  for(let i=0;i<books.length;i++){
    if(books[i].isComplete == false){
      countIncompletedRead++;
    }else if(books[i].isComplete == true){
      countCompletedRead++;
    }
  }
  document.getElementById('count-incompleted').innerText=countIncompletedRead;
  document.getElementById('count-completed').innerText=countCompletedRead;
  document.querySelector('.books-total').innerText=books.length;
}

function findTitleBook(){
  const input = document.getElementById('searchBook').value;
  // const moveBook = document.querySelectorAll(".move");

  for(let i=0;i<books.length;i++){
      if (input == books[i].title){
        console.log('hore');
        document.dispatchEvent(new Event(RENDER_EVENT));
      }else{
        console.log('horesdkdksjd');
      }
  }
}

// Web Storage
const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'BOOKSHELF_APPS';

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

function isStorageExist() /* boolean */ {
  if (typeof (Storage) === undefined) {
    alert('Browser kamu tidak mendukung local storage');
    return false;
  }
  return true;
}

document.addEventListener(SAVED_EVENT, function () {
  console.log(localStorage.getItem(STORAGE_KEY));
});

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