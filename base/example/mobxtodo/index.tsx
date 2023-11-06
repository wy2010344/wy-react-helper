


import React from 'react'

export default function index() {
  return (
    <div>index</div>
  )
}


import { observer } from 'mobx-react'

const TodoList = ({ store }: { store: ObservableTodoStore }) => {
  const onNewTodo = () => {
    const task = prompt('Enter a new todo:', 'coffee plz')
    if (task) {
      store.addTodo(task);
    }
  }

  return (
    <div>
      {store.report}
      <ul>
        {store.todos.map(
          (todo, idx) => <TodoView todo={todo} key={idx} />
        )}
      </ul>
      {store.pendingRequests > 0 ? <div>Loading...</div> : null}
      <button onClick={onNewTodo}>New Todo</button>
      <small> (double-click a todo to edit)</small>
      <RenderCounter />
    </div>
  );
}

const TodoView = observer(({ todo }: {
  todo: Todo
}) => {
  const onToggleCompleted = () => {
    todo.completed = !todo.completed;
  }

  const onRename = () => {
    todo.task = prompt('Task name', todo.task) || todo.task;
  }

  return (
    <li onDoubleClick={onRename}>
      <input
        type='checkbox'
        checked={todo.completed}
        onChange={onToggleCompleted}
      />
      {todo.task}
      {todo.assignee
        ? <small>{todo.assignee.name}</small>
        : null
      }
      <RenderCounter />
    </li>
  );
})

function RenderCounter() {
  return <>
    total:{observableTodoStore.todos.length}
  </>
}


const OBTodoList = observer(TodoList)
export function TodoApp() {
  return <TodoList store={observableTodoStore} />
}
export function OBTodoApp() {
  return <OBTodoList store={observableTodoStore} />
}
import { makeObservable, observable, computed, action, autorun } from 'mobx'


interface Todo {
  task: string,
  completed: boolean,
  assignee?: {
    name: string
  }
}
class ObservableTodoStore {
  todos: Todo[] = [];
  pendingRequests = 0;

  constructor() {
    makeObservable(this, {
      todos: observable,
      pendingRequests: observable,
      completedTodosCount: computed,
      report: computed,
      addTodo: action,
    });
    autorun(() => console.log(this.report));
  }

  get completedTodosCount() {
    return this.todos.filter(
      todo => todo.completed === true
    ).length;
  }

  get report() {
    if (this.todos.length === 0)
      return "<none>";
    const nextTodo = this.todos.find(todo => todo.completed === false);
    return `Next todo: "${nextTodo ? nextTodo.task : "<none>"}". ` +
      `Progress: ${this.completedTodosCount}/${this.todos.length}`;
  }

  addTodo(task: string) {
    this.todos.push({
      task: task,
      completed: false
    });
  }
}

const observableTodoStore = new ObservableTodoStore();