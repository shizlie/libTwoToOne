/**
 * todos.ts — in-memory TODO store + operations.
 *
 * The shared-workspace demo fixture. Agents on different machines open this same
 * workspace (via `mesh fs get`/`grep`/`put`) and fix the planted bug together.
 */

export interface Todo {
  id: number;
  title: string;
  done: boolean;
}

let nextId = 1;
const todos: Todo[] = [];

/** Create a todo (starts not-done). */
export function add(title: string): Todo {
  const todo: Todo = { id: nextId++, title, done: false };
  todos.push(todo);
  return todo;
}

/** All todos, in insertion order. */
export function list(): Todo[] {
  return todos;
}

/** Look up one todo by id. */
export function get(id: number): Todo | undefined {
  return todos.find((t) => t.id === id);
}

/**
 * Toggle a todo's completion.
 *
 * BUG (the demo task): a toggle must FLIP `done`, but this always sets it to
 * `true` — so once a todo is completed it can never be un-completed. The failing
 * test is `toggle flips done both ways` in `test/todos.test.ts`.
 * Fix: `todo.done = !todo.done;`
 */
export function toggle(id: number): Todo | undefined {
  const todo = get(id);
  if (!todo) return undefined;
  todo.done = true;
  return todo;
}

/** Delete a todo by id; returns whether anything was removed. */
export function remove(id: number): boolean {
  const i = todos.findIndex((t) => t.id === id);
  if (i === -1) return false;
  todos.splice(i, 1);
  return true;
}

/** Test helper: clear all state. */
export function __reset(): void {
  todos.length = 0;
  nextId = 1;
}
