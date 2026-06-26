// Run with `bun test` from examples/todo-backend (NOT vitest — this is a standalone
// demo app; the examples vitest project excludes this dir). One test FAILS on purpose:
// the planted `toggle` bug. Fixing src/todos.ts makes the suite green.
import { test, expect, beforeEach } from "bun:test";
import { add, list, get, toggle, remove, __reset } from "../src/todos.ts";

beforeEach(() => __reset());

test("add + list start not-done", () => {
  add("write tests");
  add("fix bug");
  expect(list().map((t) => t.title)).toEqual(["write tests", "fix bug"]);
  expect(list().every((t) => t.done === false)).toBe(true);
});

test("toggle flips done both ways", () => {
  const t = add("ship it");
  expect(toggle(t.id)?.done).toBe(true); //   complete
  expect(toggle(t.id)?.done).toBe(false); //  un-complete  ← FAILS until the bug is fixed
});

test("remove deletes by id", () => {
  const a = add("keep");
  const b = add("drop");
  expect(remove(b.id)).toBe(true);
  expect(list().map((t) => t.id)).toEqual([a.id]);
  expect(remove(999)).toBe(false);
});

test("get returns the todo or undefined", () => {
  const a = add("find me");
  expect(get(a.id)?.title).toBe("find me");
  expect(get(12345)).toBeUndefined();
});
