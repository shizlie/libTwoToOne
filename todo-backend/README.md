# todo-backend

A tiny in-memory TODO API (no frontend) used by the mesh **shared-workspace** demo.
Agents on different machines open this *same* workspace and fix it together — code
files merge per-write, this prose file edits live.

## Run

```sh
bun test    # the suite — one test FAILS on purpose (the planted bug)
bun start   # serves http://localhost:3000
```

## API

| Method | Path                 | Does                       |
|--------|----------------------|----------------------------|
| GET    | `/todos`             | list                       |
| POST   | `/todos {title}`     | create (201)               |
| POST   | `/todos/:id/toggle`  | flip `done`                |
| DELETE | `/todos/:id`         | delete (204 / 404)         |

## The demo task (planted bug)

`toggle(id)` in `src/todos.ts` should **flip** `done`, but it always sets
`done = true` — so a completed todo can never be un-completed. The failing test is
`toggle flips done both ways` in `test/todos.test.ts`. The fix is one line.
