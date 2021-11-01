function getTodoList() {
  try {
    const todoList = localStorage.getItem("todo_list") || [];
    if(todoList.length === 0) return [];

    return JSON.parse(todoList);
  } catch (error) {
    console.log("can not get todoList from LocalStorage", error);
  }
}
function createTodo(todo) {
  if (!todo) return;

  const todoListTemplate = document.getElementById("todoTemplate");
  const liElementTodo =
    todoListTemplate.content.firstElementChild.cloneNode(true);

  // update title
  const titleTodo = liElementTodo.querySelector(".todo__title");
  if (titleTodo) {
    titleTodo.textContent = todo.title;
  }
  // update status & id
  liElementTodo.dataset.status = todo.status;
  liElementTodo.dataset.id = todo.id;

  let currentStatus = liElementTodo.dataset.status;
  // render div element background follow currentStatus
  const divElement = liElementTodo.querySelector(".todo");
  if (!divElement) return;

  const BgTodoClass =
    currentStatus === "pending" ? "alert-secondary" : "alert-success";
  divElement.classList.remove("alert-secondary", "alert-success");
  divElement.classList.add(BgTodoClass);

  // render finish-pending button
  const stateButton = liElementTodo.querySelector(".mark-as-done");
  if (!stateButton) return;

  const stateButtonText = currentStatus === "pending" ? "Pending" : "Finish";
  const stateButtonBg =
    currentStatus === "pending" ? "btn-dark" : "btn-success";

  stateButton.textContent = stateButtonText;
  stateButton.classList.remove("btn-dark", "btn-success");
  stateButton.classList.add(stateButtonBg);

  // add event for 3 buttons
  // remove button click
  const removeButton = liElementTodo.querySelector(".remove");
  if (!removeButton) return;

  removeButton.addEventListener("click", () => {
    // update localStorage
    const todoList = getTodoList();
    const newTodoList = todoList.filter((x) => x.id !== todo.id);

    localStorage.setItem("todo_list", JSON.stringify(newTodoList));
    //re-render DOm
    liElementTodo.remove();
  });
  // stateButton click
  stateButton.addEventListener("click", () => {
    currentStatus = currentStatus === "pending" ? "complete" : "pending";
    liElementTodo.dataset.status = currentStatus;
    // update localStorage
    const todoList = getTodoList();
    const index = todoList.findIndex((x) => x.id === todo.id);
    todoList[index].status = currentStatus;

    localStorage.setItem("todo_list", JSON.stringify(todoList));
    // re-render dom
    const stateButtonText = currentStatus === "pending" ? "Pending" : "Finish";
    const stateButtonBg =
      currentStatus === "pending" ? "btn-dark" : "btn-success";

    stateButton.textContent = stateButtonText;
    stateButton.classList.remove("btn-dark", "btn-success");
    stateButton.classList.add(stateButtonBg);
  });
  // edit button
  const editButton = liElementTodo.querySelector(".edit");
  if (editButton) {
    // handle edit button click
    editButton.addEventListener("click", () => {
      populateTodoForm(todo);
    });
  }

  return liElementTodo;
}

function populateTodoForm(todo) {
  const form = document.getElementById("todoForm");
  if (!form) return;
  const inputForm = form.querySelector("input[type=text]");
  if (!inputForm) return;

  // push value into inputForm
  inputForm.value = todo.title;
  // set mode edit for handleSubmitForm
  form.dataset.id = todo.id;
}

function renderTodoList(ulElementId, todoList) {
  const ulElementTodoList = document.getElementById(ulElementId);
  if (!ulElementTodoList) return;

  // reset todoList
  ulElementTodoList.textContent = "";

  todoList.forEach((todo) => {
    const liElement = createTodo(todo);
    ulElementTodoList.appendChild(liElement);
  });
}

function handleSubmitForm(e) {
  e.preventDefault();

  // get value from input
  const form = document.getElementById("todoForm");
  const inputForm = document.querySelector("#todoForm input[type=text]");
  if (!inputForm) return;
  const checkboxForm = document.querySelector("#todoForm input[type=checkbox]");
  const editMode = !!form.dataset.id;

  // edit todo
  if (editMode) {
    // update todo with id into localStorage
    const todoList = getTodoList();
    const index = todoList.findIndex(
      (x) => x.id === Number.parseInt(form.dataset.id)
    );
    todoList[index].title = inputForm.value;
    todoList[index].status = checkboxForm.checked ? "complete" : "pending";

    localStorage.setItem("todo_list", JSON.stringify(todoList));

    // re-render DOM
    const newTodoList = getTodoList();
    renderTodoList("todoList", newTodoList);
  } else {
    // add new todo into localStorage
    const newTodo = {
      id: Date.now(),
      title: inputForm.value,
      status: checkboxForm.checked ? "complete" : "pending",
    };

    const todoList = getTodoList();
    todoList.push(newTodo);
    localStorage.setItem("todo_list", JSON.stringify(todoList));
    // re-render DOM
    renderTodoList("todoList", todoList);
  }

  // reset form
  form.dataset.id = "";
  form.reset();
}

function initForm() {
  const form = document.getElementById("todoForm");
  if (!form) return;

  form.addEventListener("submit", handleSubmitForm);
}

function initSearch() {
  const searchTerm = document.getElementById("searchTerm");
  if (!searchTerm) return;

  searchTerm.addEventListener("input", (e) => {
    handleFilterChange("search", searchTerm.value);
  });
}

function initSelect() {
  const selectTerm = document.getElementById("selectList");
  if (!selectTerm) return;

  selectTerm.addEventListener("change", () => {
    handleFilterChange("select", selectTerm.value);
  });
}
function isMatchSearch(filterValue, liElement) {
  if (filterValue.length === 0) return true;

  const titleTodoElement = liElement.querySelector(".todo__title");
  return titleTodoElement.textContent
    .toLowerCase()
    .includes(filterValue.toLowerCase());
}

function isMatchSelect(filterValue, liElement) {
  if (filterValue === "All") return true;

  return liElement.dataset.status === filterValue;
}

function isMatch(params, liElement) {
  return (
    isMatchSearch(params.get("search"), liElement) &&
    isMatchSelect(params.get("select"), liElement)
  );
}

function handleFilterChange(filterName, filterValue) {
  // update url
  const url = new URL(window.location);
  url.searchParams.set(filterName, filterValue);
  history.pushState({}, "", url);

  // re-render DOM
  const ulTodoList = document.getElementById("todoList");
  if (!ulTodoList) return;

  const liTodoElementList = ulTodoList.querySelectorAll("li");
  if (!liTodoElementList) return;

  liTodoElementList.forEach((liTodoElement) => {
    const needToShow = isMatch(url.searchParams, liTodoElement);
    liTodoElement.hidden = !needToShow;
  });
}

(() => {
  initForm();
  initSearch();
  initSelect();

  const queryParams = new URLSearchParams(window.location.search);
  const searchInput = document.getElementById("searchTerm");
  const selectInput = document.getElementById("selectList");

  if (queryParams.get("search")) {
    searchInput.value = queryParams.get("search");
  }

  if (queryParams.get("select")) {
    selectInput.value = queryParams.get("select");
  }

  if(!window.location.search) {
    const url = new URL(window.location)
    url.searchParams.set('search', '')
    url.searchParams.set('select', 'All')
    history.pushState({}, '', url)
  }

  const todoList = getTodoList();
  renderTodoList("todoList", todoList);
})();
