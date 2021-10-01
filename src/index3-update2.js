function isMatchSearch(searchTerm, liElement) {
  if(searchTerm === '' || searchTerm === null) return true;
  
  const liTitleElement = liElement.querySelector('.todo__title');

  return liTitleElement.textContent.toLowerCase().includes(searchTerm.toLowerCase());


}

function isMatchSelected(filterTerm, liElement) {
  if(filterTerm === null) filterTerm = 'All';
   return filterTerm === 'All' || (liElement.dataset.status === filterTerm);
}

function isMatch(params, liElement) {
  return (
    isMatchSearch(params.get('search'), liElement) && isMatchSelected(params.get('status'), liElement)
  )
}

function createTodoElement(todo, params) {
  if(!todo) return 'todo does not exist';

  const todoTemplate = document.getElementById('todoTemplate');
  if(!todoTemplate) return 'todoTemplate does not exist';

  const liElement = todoTemplate.content.firstElementChild.cloneNode(true);
  liElement.dataset.status = todo.status;
  liElement.dataset.id = todo.id;

  const liTitleElement = liElement.querySelector('.todo__title');
  if(!liTitleElement) return 'li title does not exist';

  liTitleElement.textContent = todo.title;

  // check if we should show it or not
  liElement.hidden = !isMatch(params, liElement)


  const markAsDoneButton = liElement.querySelector('.mark-as-done');
  if(!markAsDoneButton) return 'mark-as-done button does not exist';
  
  const removeButton = liElement.querySelector('.remove');
  if(!removeButton) return 'remove button does not exist';

  const editButton = liElement.querySelector('.edit');
  if(editButton) {
    editButton.addEventListener('click', () => {
      //need to get todo from local storage
      // as to data can be outdated
      const todoList = getTodoList();
      const latestTodo = todoList.find(x => x.id === todo.id);
      if(!latestTodo) return;

      populateTodoForm(latestTodo);
    })
  }


  // render todo
  const divElement =  liElement.querySelector('.todo');
  if(divElement) {
    const alertClass = liElement.dataset.status === 'complete' ? 'alert-success' : 'alert-secondary';
    divElement.classList.remove('alert-secondary');
    divElement.classList.add(alertClass);

    //update button's content
    const buttonContent = liElement.dataset.status === 'complete' ? 'Reset' : 'Finish';
    markAsDoneButton.textContent = buttonContent;

    // update button's background color
    const buttonBg = liElement.dataset.status === 'complete' ? 'btn-success' : 'btn-dark';
    markAsDoneButton.classList.remove('btn-success');
    markAsDoneButton.classList.add(buttonBg);
  }

  // add event listeners
  markAsDoneButton.addEventListener('click', () => {
    //get status
    const currentStatus = liElement.dataset.status;
    //update status
    const newStatus = currentStatus === 'pending' ? 'complete' : 'pending';
    liElement.dataset.status = newStatus;

    // update localStorage when status changed
    const todoList = JSON.parse(localStorage.getItem('todo_list'));
    const index = todoList.findIndex(x => x.id === todo.id);
    todoList[index].status = newStatus;
    localStorage.setItem('todo_list', JSON.stringify(todoList));

    // update status class
    const newAlertClass = currentStatus === 'pending' ? 'alert-success' : 'alert-secondary';

    // add class
    divElement.classList.remove('alert-secondary', 'alert-success');
    divElement.classList.add(newAlertClass);

    // update button's content
    const buttonContent = currentStatus === 'pending' ? 'Reset' : 'Finish';
    markAsDoneButton.textContent = buttonContent;

    // update button's background
    const buttonBg = currentStatus === 'pending' ? 'btn-success' : 'btn-dark';
    markAsDoneButton.classList.remove('btn-success', 'btn-dark');
    markAsDoneButton.classList.add(buttonBg);
  })

  // remove element
  removeButton.addEventListener('click', () => {

    // update local storage when remove element
    const todoList = JSON.parse(localStorage.getItem('todo_list'));
    const newTodoList = todoList.filter((x) => x.id !== todo.id)
    localStorage.setItem('todo_list', JSON.stringify(newTodoList));

    liElement.remove();
  });

  return liElement;
}

function populateTodoForm(todo) {
  const todoForm = document.getElementById('todoForm');
  if(!todoForm) return;

  // update data-id to form to control between add and edit mode
  todoForm.dataset.id = todo.id;

  const todoInput = todoForm.querySelector('input[type=text]');
  if(todoInput) {
    todoInput.value = todo.title;
  }

}

function renderTodoList(todoList, ulElementId, params) {   
  if(!Array.isArray(todoList) || todoList.length === 0) return [];

  const ulElement = document.getElementById(ulElementId);
  if(!ulElement) return 'ul element does not exist';

  todoList.forEach(todo => {
    const liElement = createTodoElement(todo, params);
    ulElement.appendChild(liElement);
  });
}

// get data from local storage
function getTodoList() {
  try {
    return JSON.parse(localStorage.getItem('todo_list'))
  } catch {
    return [];
  }
}

//  handler form submit
function handlerFormSubmit(event) {
   event.preventDefault();
   
   const inputText = todoForm.querySelector('input[type=text]');
   if(!inputText) return;

   const inputStatus = document.querySelector("input[type=checkbox]");
   if(!inputStatus) return;

   const currentStatus = inputStatus.checked ? 'complete' : 'pending';

   // check update mode or add mode by data-id
   const isEdit = !!todoForm.dataset.id;
   if(isEdit) {
    const todoList = getTodoList();
    const index = todoList.findIndex(x => x.id + '' === todoForm.dataset.id);
   todoList[index].title = inputText.value;

   // update status to local storage
   todoList[index].status = currentStatus;

   // save
    localStorage.setItem('todo_list', JSON.stringify(todoList));

    // update li Element
    const liElement =  document.querySelector(`ul#todoList > li[data-id = '${todoForm.dataset.id}']`);
    if(liElement) {
      // update title
      const liTitleElement = liElement.querySelector('.todo__title');
      liTitleElement.textContent = inputText.value;

      // update status
      const alertClass = currentStatus === 'complete' ? 'alert-success' : 'alert-secondary';
      const buttonBackground = currentStatus === 'complete' ? 'btn-success' : 'btn-dark';
      const buttonText = currentStatus === 'complete' ? 'Reset' : 'Finish';

      const divElement = liElement.querySelector('.todo');
      if(!divElement) return;
      const markAsDoneButton = liElement.querySelector('.mark-as-done');

      divElement.classList.remove('alert-secondary', 'alert-success');
      divElement.classList.add(alertClass);

      markAsDoneButton.classList.remove('btn-success', 'btn-dark');
      markAsDoneButton.classList.add(buttonBackground);
      markAsDoneButton.textContent = buttonText;
    }

   } else {
     const newTodo = {
      id: Date.now(), 
      title: inputText.value, 
      status: currentStatus,
     }
  
     const todoList = getTodoList();
     todoList.push(newTodo);
     localStorage.setItem('todo_list', JSON.stringify(todoList));
  
     const newLiEleMent = createTodoElement(newTodo);
     const ulElement = document.getElementById('todoList');
     if(ulElement) {
       ulElement.appendChild(newLiEleMent);
     }
   }
   // reset form
   delete todoForm.dataset.id;
   todoForm.reset();
}

(() => {
  // const todoList = [
  //   {id: 1, title: 'Learn JavaScript', status: 'pending'},
  //   {id: 2, title: 'Learn VueJs', status: 'complete'},
  //   {id: 3, title: 'Learn ReactJs', status: 'pending'},
  //   {id: 4, title: 'Learn Everything', status: 'pending'},
  // ];
  const params = new URLSearchParams(window.location.search);

  const todoList = getTodoList();
  renderTodoList(todoList, 'todoList', params);

  // register submit event for todo format
  const todoForm = document.getElementById('todoForm');
  if(todoForm) {
    todoForm.addEventListener('submit', handlerFormSubmit);
  }

})();
