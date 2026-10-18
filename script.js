// ===== 数据层 =====
const STORAGE_KEY = 'todo-list-data';

// 工具函数：读取本地数据
function loadTodos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

$(document).ready(function () {
  let todos = loadTodos();
  let currentFilter = 'all';

  // ===== DOM 元素 =====
  const $form = $('#todo-form');
  const $input = $('#todo-input');
  const $listEl = $('#todo-list');
  const $countEl = $('#count');
  const $clearCompletedBtn = $('#clear-completed');
  const $filterBtns = $('.filter');

  // ===== 工具函数 =====
  function saveTodos() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }

  // ===== 渲染 =====
  function render() {
    $listEl.empty(); // 清空列表

    // 根据筛选条件获取要显示的列表
    let visibleTodos = todos;
    if (currentFilter === 'active') {
      visibleTodos = todos.filter((t) => !t.done);
    } else if (currentFilter === 'completed') {
      visibleTodos = todos.filter((t) => t.done);
    }

    // 渲染列表
    if (visibleTodos.length === 0) {
      const emptyMsg = currentFilter === 'all' ? '暂无待办事项，先添加一个吧' : '没有符合条件的任务';
      $listEl.append($('<li>').addClass('empty').text(emptyMsg));
    } else {
      $.each(visibleTodos, function (_, todo) {
        $listEl.append(createTodoItem(todo));
      });
    }

    // 底部统计
    const total = todos.length;
    const doneCount = todos.filter((t) => t.done).length;
    $countEl.text(`共 ${total} 项，已完成 ${doneCount} 项`);

    // 清除按钮状态
    if (doneCount === 0) {
      $clearCompletedBtn.prop('disabled', true).css('opacity', 0.5);
    } else {
      $clearCompletedBtn.prop('disabled', false).css('opacity', 1);
    }
  }

  function createTodoItem(todo) {
    // 使用 jQuery 链式操作快速创建 DOM
    const $li = $('<li>').addClass('todo-item').attr('data-id', todo.id);
    if (todo.done) $li.addClass('done');

    const $checkbox = $('<div>').addClass('checkbox');
    const $text = $('<span>').addClass('text').text(todo.text);
    const $delBtn = $('<button>').addClass('delete-btn').text('删除');

    // 事件绑定
    $checkbox.add($text).on('click', function() {
      toggleTodo(todo.id);
    });

    $delBtn.on('click', function(e) {
      e.stopPropagation();
      deleteTodo(todo.id);
    });

    return $li.append($checkbox, $text, $delBtn);
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
    // 使用 jQuery 的 $.each 或原生 find 查找
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;
    todo.done = !todo.done;
    saveTodos();
    render();
  }

  function deleteTodo(id) {
    // 添加淡出动画
    $(`li[data-id="${id}"]`).fadeOut(200, function() {
      todos = todos.filter((t) => t.id !== id);
      saveTodos();
      render();
    });
  }

  function clearCompleted() {
    todos = todos.filter((t) => !t.done);
    saveTodos();
    render();
  }

  // ===== 事件绑定 =====
  // 表单提交
  $form.on('submit', function (e) {
    e.preventDefault();
    addTodo($input.val());
    $input.val('').focus();
  });

  // 点击筛选按钮
  $filterBtns.on('click', function () {
    currentFilter = $(this).data('filter');
    $filterBtns.removeClass('active');
    $(this).addClass('active');
    render();
  });

  // 点击清除已完成
  $clearCompletedBtn.on('click', clearCompleted);

  // ===== 初始化 =====
  render();
});