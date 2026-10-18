import { useState, useEffect, useMemo } from 'react'
import './App.css' // 稍后添加样式

// ==== 类型定义 ====
interface Todo {
  id: string
  text: string
  done: boolean
  createdAt: number
}

type FilterType = 'all' | 'active' | 'completed'

const STORAGE_KEY = 'todo-list-data'

function App() {
  // ==== 状态定义 ====
  const [todos, setTodos] = useState<Todo[]>(() => {
    // 惰性初始化：从 localStorage 读取初始数据
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  })
  
  const [inputText, setInputText] = useState('')
  const [currentFilter, setCurrentFilter] = useState<FilterType>('all')

  // ==== 副作用：监听 todos 变化，自动存入 localStorage ====
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
  }, [todos])

  // ==== 派生数据：过滤列表与统计（使用 useMemo 优化性能）====
  const filteredTodos = useMemo(() => {
    if (currentFilter === 'active') return todos.filter(t => !t.done)
    if (currentFilter === 'completed') return todos.filter(t => t.done)
    return todos
  }, [todos, currentFilter])

  const doneCount = useMemo(() => todos.filter(t => t.done).length, [todos])

  // ==== 操作逻辑 ====
  const addTodo = (e: React.FormEvent) => {
    e.preventDefault() // 阻止表单默认刷新
    const value = inputText.trim()
    if (!value) return

    const newTodo: Todo = {
      id: Date.now().toString() + Math.random().toString(36).slice(2, 6),
      text: value,
      done: false,
      createdAt: Date.now()
    }
    
    setTodos([...todos, newTodo])
    setInputText('') // 清空输入框
  }

  const toggleTodo = (id: string) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, done: !todo.done } : todo
    ))
  }

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id))
  }

  const clearCompleted = () => {
    setTodos(todos.filter(todo => !todo.done))
  }

  // ==== 渲染视图 (JSX) ====
  return (
    <div className="app">
      <h1>待办事项 (React + TS)</h1>

      <form className="input-row" onSubmit={addTodo}>
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="输入待办事项，按回车添加"
          autoComplete="off"
        />
        <button type="submit">添加</button>
      </form>

      <div className="filters">
        {(['all', 'active', 'completed'] as const).map(filter => (
          <button
            key={filter}
            className={`filter ${currentFilter === filter ? 'active' : ''}`}
            onClick={() => setCurrentFilter(filter)}
          >
            {filter === 'all' ? '全部' : filter === 'active' ? '未完成' : '已完成'}
          </button>
        ))}
      </div>

      <ul className="todo-list">
        {filteredTodos.length === 0 ? (
          <li className="empty">
            {currentFilter === 'all' ? '暂无待办事项，先添加一个吧' : '没有符合条件的任务'}
          </li>
        ) : (
          filteredTodos.map(todo => (
            <li key={todo.id} className={`todo-item ${todo.done ? 'done' : ''}`}>
              <div className="checkbox" onClick={() => toggleTodo(todo.id)}></div>
              <span className="text" onClick={() => toggleTodo(todo.id)}>
                {todo.text}
              </span>
              <button className="delete-btn" onClick={() => deleteTodo(todo.id)}>
                删除
              </button>
            </li>
          ))
        )}
      </ul>

      <div className="footer">
        <span>共 {todos.length} 项，已完成 {doneCount} 项</span>
        <button 
          id="clear-completed" 
          disabled={doneCount === 0}
          style={{ opacity: doneCount === 0 ? 0.5 : 1 }}
          onClick={clearCompleted}
        >
          清除已完成
        </button>
      </div>
    </div>
  )
}

export default App