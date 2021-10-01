function getLiElementList() {
  const liElementList = document.querySelectorAll('ul > li');

  return liElementList;
}

function isMatchSearch(searchTerm, liElement) {
  console.log(searchTerm);
  if(searchTerm === '') return true;

  const liTitleElement = liElement.querySelector('.todo__title');

  return liTitleElement.textContent.toLowerCase().includes(searchTerm.toLowerCase());


}

function isMatchSelected(filterTerm, liElement) {
  console.log(filterTerm);
   return filterTerm === 'All' || (liElement.dataset.status === filterTerm);
}

function isMatch(params, liElement) {
  return (
    isMatchSearch(params.get('search'), liElement) && isMatchSelected(params.get('status'), liElement)
  )
}


function handlerFilterChange(filterName, filterValue) {
  const url = new URL(window.location);
  url.searchParams.set(filterName, filterValue);
  window.history.pushState({}, '', url);

  const liElementList = getLiElementList();
  liElementList.forEach(liElement => {
    const needToShow = isMatch(url.searchParams, liElement);
    liElement.hidden = !needToShow;
  });
}

function initSearchTodo(params) {
  const searchInput = document.getElementById('searchTerm');
  if(!searchInput) return;

  if(params.get('search')) {
    searchInput.value = params.get('search');
  }
  
  searchInput.addEventListener('input', () => {
    handlerFilterChange('search', searchInput.value);
  });
}

function initFilterTodo(params) {
  const selectElement = document.getElementById('selectList');
  if(!selectElement) return;

  if(params.get('status')) {
    selectElement.value = params.get('status');
  }

  selectElement.addEventListener('change', () => {
    handlerFilterChange('status', selectElement.value);
  });
}


(() => {
  const params = new URLSearchParams(window.location.search)
  initFilterTodo(params);
  initSearchTodo(params);
})();