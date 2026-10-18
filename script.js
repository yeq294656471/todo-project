// ===== 数据层 =====
const STORAGE_KEY = 'todo-list-data';

// 从 localStorage 读取，没有则返回空数组
let todos = loadTodos();
let currentFilter = 'all';

// ===== DOM 元素 =====
const form = document.getElementById('todo-form');
const input = document.getElementById('todo-input');
const listEl = document.getElementById('todo-list');
const countEl = document.getElementById('count');
const clearCompletedBtn = document.getElementById('clear-completed');
const filterBtns = document.querySelectorAll('.filter');

// ===== 工具函数 =====
function loadTodos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveTodos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

// ===== 渲染 =====
function getVisibleTodos() {
  if (currentFilter === 'active') return todos.filter((t) => !t.done);
  if (currentFilter === 'completed') return todos.filter((t) => t.done);
  return todos;
}

function render() {
  const visible = getVisibleTodos();
  listEl.innerHTML = '';

  if (visible.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'empty';
    empty.textContent =
      currentFilter === 'all'
        ? '暂无待办事项，先添加一个吧'
        : '没有符合条件的任务';
    listEl.appendChild(empty);
  } else {
    visible.forEach((todo) => {
      listEl.appendChild(createTodoItem(todo));
    });
  }

  // 底部统计
  const total = todos.length;
  const doneCount = todos.filter((t) => t.done).length;
  countEl.textContent = `共 ${total} 项，已完成 ${doneCount} 项`;

  // 清除按钮只在有已完成项时可用
  clearCompletedBtn.disabled = doneCount === 0;
  clearCompletedBtn.style.opacity = doneCount === 0 ? 0.5 : 1;
}

function createTodoItem(todo) {
  const li = document.createElement('li');
  li.className = 'todo-item' + (todo.done ? ' done' : '');
  li.dataset.id = todo.id;

  // 勾选圆圈
  const checkbox = document.createElement('div');
  checkbox.className = 'checkbox';
  checkbox.addEventListener('click', () => toggleTodo(todo.id));

  // 文本
  const text = document.createElement('span');
  text.className = 'text';
  text.textContent = todo.text;
  text.addEventListener('click', () => toggleTodo(todo.id));

  // 删除按钮
  const delBtn = document.createElement('button');
  delBtn.className = 'delete-btn';
  delBtn.textContent = '删除';
  delBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    deleteTodo(todo.id);
  });

  li.appendChild(checkbox);
  li.appendChild(text);
  li.appendChild(delBtn);
  return li;
}

// ===== 操作 =====
function addTodo(text) {
  const value = text.trim();
  if (!value) return;
  todos.push({
    id: Date.now().toString() + Math.random().toString(36).slice(2, 6),
    text: value,
    done: false,
    createdAt: Date.now(),
  });
  saveTodos();
  render();
}

function toggleTodo(id) {
  const todo = todos.find((t) => t.id === id);
  if (!todo) return;
  todo.done = !todo.done;
  saveTodos();
  render();
}

function deleteTodo(id) {
  todos = todos.filter((t) => t.id !== id);
  saveTodos();
  render();
}

function clearCompleted() {
  todos = todos.filter((t) => !t.done);
  saveTodos();
  render();
}

// ===== 事件绑定 =====
form.addEventListener('submit', (e) => {
  e.preventDefault();
  addTodo(input.value);
  input.value = '';
  input.focus();
});

filterBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    currentFilter = btn.dataset.filter;
    filterBtns.forEach((b) => b.classList.toggle('active', b === btn));
    render();
  });
});

clearCompletedBtn.addEventListener('click', clearCompleted);

// ===== 初始化 =====
render();