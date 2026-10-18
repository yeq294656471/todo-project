$(document).ready(function () {
  // 从 localStorage 获取数据，如果没有则返回空数组
  let todos = JSON.parse(localStorage.getItem('jq-todos')) || [];
  let currentFilter = 'all'; // 新增：记录当前的筛选状态

  // 保存数据到 localStorage
  function saveData() {
    localStorage.setItem('jq-todos', JSON.stringify(todos));
    updateCount();
  }

  // 更新底部计数
  function updateCount() {
    const done = todos.filter((t) => t.done).length;
    $('#count').text(`共 ${todos.length} 项，已完成 ${done} 项`);
  }

  // 渲染列表
  function renderList() {
    const $list = $('#todo-list');
    $list.empty(); // 清空列表

    // 新增：根据筛选条件过滤数据
    let filteredTodos = todos.filter(function (todo) {
      if (currentFilter === 'active') return !todo.done;
      if (currentFilter === 'completed') return todo.done;
      return true; // 'all'
    });

    if (filteredTodos.length === 0) {
      $list.append('<li style="text-align:center;color:#ccc;padding:20px;">暂无符合条件的待办事项</li>');
    }

    // 遍历数据并生成 HTML
    // 注意：这里的 index 是 filteredTodos 的索引，我们需要去 todos 里找真实的数据
    $.each(filteredTodos, function (_, todo) {
      const doneClass = todo.done ? 'done' : '';
      // 获取该 todo 在原始 todos 数组中的真实索引
      const originalIndex = todos.indexOf(todo);
      
      const $li = $('<li>').addClass('todo-item ' + doneClass).attr('data-index', originalIndex);
      
      const $checkbox = $('<div>').addClass('checkbox');
      const $text = $('<span>').addClass('text').text(todo.text);
      const $delBtn = $('<button>').addClass('delete-btn').text('删除');

      // 点击切换完成状态
      $checkbox.add($text).on('click', function () {
        todos[originalIndex].done = !todos[originalIndex].done;
        saveData();
        renderList();
      });

      // 点击删除
      $delBtn.on('click', function (e) {
        e.stopPropagation();
        $(this).parent().fadeOut(300, function () {
          todos.splice(originalIndex, 1);
          saveData();
          renderList();
        });
      });

      $li.append($checkbox, $text, $delBtn);
      $list.append($li);
    });
  }

  // 添加待办事项
  function addTodo() {
    const text = $('#todo-input').val().trim();
    if (text === '') return;

    todos.push({
      text: text,
      done: false,
    });

    $('#todo-input').val('');
    saveData();
    renderList();
  }

  // 绑定事件：添加
  $('#add-btn').on('click', addTodo);
  $('#todo-input').on('keypress', function (e) {
    if (e.which === 13) addTodo();
  });

  // 新增事件：点击筛选按钮
  $('.filter').on('click', function () {
    currentFilter = $(this).data('filter'); // 获取当前点击的 filter 值
    $('.filter').removeClass('active');     // 移除所有按钮的 active 类
    $(this).addClass('active');             // 给当前按钮加上 active 类
    renderList();                           // 重新渲染
  });

  // 清除已完成
  $('#clear-completed').on('click', function () {
    todos = todos.filter((t) => !t.done);
    saveData();
    renderList();
  });

  // 初始化渲染
  updateCount();
  renderList();
});