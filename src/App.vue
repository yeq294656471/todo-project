<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'

// ==== 类型定义 ====
interface Todo {
  id: string
  text: string
  done: boolean
  createdAt: number
}

type FilterType = 'all' | 'active' | 'completed'

// ==== 状态数据 ====
const STORAGE_KEY = 'todo-list-data'
const todos = ref<Todo[]>([])
const inputText = ref('')
const currentFilter = ref<FilterType>('all')

// ==== 初始化：读取本地数据 ====
onMounted(() => {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (raw) {
    try {
      todos.value = JSON.parse(raw)
    } catch (e) {
      todos.value = []
    }
  }
})

// ==== 监听器：数据变化时自动保存 ====
watch(todos, (newVal) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newVal))
}, { deep: true })

// ==== 计算属性：过滤与统计 ====
// 计算当前应该显示的列表
const filteredTodos = computed(() => {
  if (currentFilter.value === 'active') return todos.value.filter(t => !t.done)
  if (currentFilter.value === 'completed') return todos.value.filter(t => t.done)
  return todos.value
})

// 统计已完成数量
const doneCount = computed(() => todos.value.filter(t => t.done).length)

// ==== 操作方法 ====
const addTodo = () => {
  const value = inputText.value.trim()
  if (!value) return
  
  todos.value.push({
    id: Date.now().toString() + Math.random().toString(36).slice(2, 6),
    text: value,
    done: false,
    createdAt: Date.now()
  })
  inputText.value = '' // 清空输入框
}

const toggleTodo = (todo: Todo) => {
  todo.done = !todo.done
}

const deleteTodo = (id: string) => {
  todos.value = todos.value.filter(t => t.id !== id)
}

const clearCompleted = () => {
  todos.value = todos.value.filter(t => !t.done)
}
</script>

<template>
  <div class="app">
    <h1>待办事项 (Vue 3 + TS)</h1>

    <form class="input-row" @submit.prevent="addTodo">
      <input
        type="text"
        v-model="inputText"
        placeholder="输入待办事项，按回车添加"
        autocomplete="off"
      />
      <button type="submit">添加</button>
    </form>

    <div class="filters">
      <button 
        :class="['filter', { active: currentFilter === 'all' }]" 
        @click="currentFilter = 'all'"
      >全部</button>
      <button 
        :class="['filter', { active: currentFilter === 'active' }]" 
        @click="currentFilter = 'active'"
      >未完成</button>
      <button 
        :class="['filter', { active: currentFilter === 'completed' }]" 
        @click="currentFilter = 'completed'"
      >已完成</button>
    </div>

    <ul class="todo-list">
      <!-- v-if 判断空状态 -->
      <li v-if="filteredTodos.length === 0" class="empty">
        {{ currentFilter === 'all' ? '暂无待办事项，先添加一个吧' : '没有符合条件的任务' }}
      </li>

      <!-- v-for 循环渲染列表，配合 TransitionGroup 实现动画 -->
      <TransitionGroup name="list">
        <li 
          v-for="todo in filteredTodos" 
          :key="todo.id" 
          :class="['todo-item', { done: todo.done }]"
        >
          <div class="checkbox" @click="toggleTodo(todo)"></div>
          <span class="text" @click="toggleTodo(todo)">{{ todo.text }}</span>
          <button class="delete-btn" @click="deleteTodo(todo.id)">删除</button>
        </li>
      </TransitionGroup>
    </ul>

    <div class="footer">
      <span>共 {{ todos.length }} 项，已完成 {{ doneCount }} 项</span>
      <button 
        id="clear-completed" 
        :disabled="doneCount === 0"
        :style="{ opacity: doneCount === 0 ? 0.5 : 1 }"
        @click="clearCompleted"
      >清除已完成</button>
    </div>
  </div>
</template>