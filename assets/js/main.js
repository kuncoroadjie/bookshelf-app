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
    if (isStorageExist()) {
      loadDataFromStorage();
    }
});

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

function searchBooks() {
  const inputSearchValue = document.getElementById("searchBook").value.toLowerCase();
  const incompleteBookShelf = document.getElementById("incomplete-books");
  const completeBookShelf = document.getElementById("complete-books");
  incompleteBookShelf.innerHTML = "";
  completeBookShelf.innerHTML = "";
  
  if (inputSearchValue == "") {
     document.dispatchEvent(new Event(RENDER_EVENT));
     return;
  }

  for (const book of books) {
     if (book.title.toLowerCase().includes(inputSearchValue)) {
        if (book.isComplete == false) {
           let el = `
           <article class="book-item">
            <div class="book-data">  
              <h3>${book.title}</h3>
              <p>Penulis : ${book.author}</p>
              <p>Tahun : ${book.year}</p>
            </div>
            <button class="check-button fas fa-check-circle" onclick="addBookToComplete(${book.id})"></button>
            <button class="trash-button fas fa-trash-alt" onclick="removeBookFromCompleted(${book.id}")></button>
           </article>
           `;

           incompleteBookShelf.innerHTML += el;
        } else {
           let el = `
           <article class="book-item">
              <div class="book-data">
                <h3>${book.title}</h3>
                <p>Penulis : ${book.author}</p>
                <p>Tahun : ${book.year}</p>
              </div>
              <button class="undo-button fas fa-undo-alt" onclick=undoBookFromCompleted(${book.id})></button>
              <button class="trash-button fas fa-trash-alt" onclick="removeBookFromCompleted(${book.id}"></button>
           </article>
           `;

           completeBookShelf.innerHTML += el;
        }
     }
  }
}
