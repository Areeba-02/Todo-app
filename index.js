(function(){
  const taskInput = document.getElementById('taskInput');
  const addBtn = document.getElementById('addBtn');
  const listEl = document.getElementById('todoList');
  const counterNum = document.getElementById('counterNum');
  const progressFill = document.getElementById('progressFill');

  let todos = loadTodos();
 function loadTodos(){
    try{
      const raw = localStorage.getItem('todos_v1');
      return raw ? JSON.parse(raw) : [];
    }catch(e){
      return [];
    }
  }
  function saveTodos(){
    localStorage.setItem('todos_v1', JSON.stringify(todos));
  }

  function render(){
    listEl.innerHTML = '';
    todos.forEach((t, idx) => {
      const row = document.createElement('div');
      row.className = 'todo';
      row.dataset.index = idx;

      const left = document.createElement('div');
      left.className = 'left';

      const cb = document.createElement('button');
      cb.className = 'checkbox' + (t.done ? ' checked' : '');
      cb.setAttribute('aria-label', t.done ? 'Mark as not done' : 'Mark as done');
      cb.innerHTML = t.done ? '&#10003;' : '';

      cb.addEventListener('click', () => {
        todos[idx].done = !todos[idx].done;
        saveTodos();
        render();
      });
const text = document.createElement('div');
      text.className = 'text' + (t.done ? ' done' : '');
      text.textContent = t.text;
      text.title = 'Double-click to edit';

      // double click to edit
      text.addEventListener('dblclick', ()=> {
        startEdit(idx, text);
      });

      left.appendChild(cb);
      left.appendChild(text);
const actions = document.createElement('div');
      actions.className = 'actions';

      const editBtn = document.createElement('button');
      editBtn.className = 'icon-btn edit';
      editBtn.innerHTML = '&#9998;'; // pencil
      editBtn.title = 'Edit';
      editBtn.addEventListener('click', ()=> startEdit(idx, text));

      const delBtn = document.createElement('button');
      delBtn.className = 'icon-btn delete';
      delBtn.innerHTML = '&#128465;'; // trash
      delBtn.title = 'Delete';
      delBtn.addEventListener('click', ()=>{
        if(confirm('Delete this task?')){
          todos.splice(idx,1);
          saveTodos();
          render();
        }
      });

      actions.appendChild(editBtn);
      actions.appendChild(delBtn);

      row.appendChild(left);
      row.appendChild(actions);
      listEl.appendChild(row);
    });

    updateProgress();
  }

  function updateProgress(){
    const total = todos.length;
    const done = todos.filter(t => t.done).length;
    const percent = total === 0 ? 0 : Math.round((done/total)*100);
    progressFill.style.width = percent + '%';
    counterNum.textContent = done + ' / ' + total;
    // accessible label
    progressFill.setAttribute('aria-valuenow', percent);
  }

  function addTask(text){
    const trimmed = (text || '').trim();
    if(!trimmed) return;
    todos.unshift({ text: trimmed, done:false, created: Date.now() });
    saveTodos();
    render();
  }

  addBtn.addEventListener('click', ()=>{
    addTask(taskInput.value);
    taskInput.value = '';
    taskInput.focus();
  });

  // Enter to add
  taskInput.addEventListener('keydown', (e)=>{
    if(e.key === 'Enter'){
      addTask(taskInput.value);
      taskInput.value = '';
    }
  });

  // Edit flow: replace text element with input when editing
  function startEdit(idx, textEl){
    const original = todos[idx].text;
    // prevent multiple editors
    const input = document.createElement('input');
    input.type = 'text';
    input.value = original;
    input.className = 'input';
    input.style.padding = '8px 12px';
    input.style.borderRadius = '10px';
    input.style.minWidth = '220px';
    input.style.fontSize = '15px';
    textEl.replaceWith(input);
    input.focus();
    input.select();

    function finish(save){
      const parent = input.parentElement || document.createElement('div');
      // restore text element or update
      if(save){
        const v = input.value.trim();
        if(v) todos[idx].text = v;
      }
      saveTodos();
      render();
    }

    input.addEventListener('keydown', (e)=>{
      if(e.key === 'Enter'){ finish(true); }
      else if(e.key === 'Escape'){ finish(false); }
    });
    input.addEventListener('blur', ()=> finish(true));
  }

  // initialize
  render();

  // expose to window for debugging (optional)
  window._todos = todos;
})();
