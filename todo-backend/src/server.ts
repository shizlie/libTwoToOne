/**
 * server.ts — a tiny TODO HTTP API (no frontend), served with Bun.serve.
 *
 * Routes:
 *   GET    /todos              list
 *   POST   /todos {title}      create (201)
 *   POST   /todos/:id/toggle   flip `done`
 *   DELETE /todos/:id          delete (204 / 404)
 */
import { add, list, toggle, remove } from "./todos.ts";

const server = Bun.serve({
  port: Number(process.env.PORT ?? 3000),
  async fetch(req) {
    const url = new URL(req.url);
    const parts = url.pathname.split("/").filter(Boolean); // e.g. ["todos","1","toggle"]

    if (req.method === "GET" && url.pathname === "/todos") {
      return Response.json(list());
    }
    if (req.method === "POST" && url.pathname === "/todos") {
      const body = (await req.json().catch(() => ({}))) as { title?: string };
      if (!body.title) return new Response("title required", { status: 400 });
      return Response.json(add(body.title), { status: 201 });
    }
    if (req.method === "POST" && parts[0] === "todos" && parts[2] === "toggle") {
      const t = toggle(Number(parts[1]));
      return t ? Response.json(t) : new Response("not found", { status: 404 });
    }
    if (req.method === "DELETE" && parts[0] === "todos" && parts.length === 2) {
      return remove(Number(parts[1]))
        ? new Response(null, { status: 204 })
        : new Response("not found", { status: 404 });
    }
    return new Response("not found", { status: 404 });
  },
});

console.log(`todo-backend listening on http://localhost:${server.port}`);
