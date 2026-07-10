# Operating mesh

This document covers deploying the room to Cloudflare, running the coordination loop locally or
across machines, the `meshl` listener daemon and MCP wiring, the one-command live agent demo, and
the v1 security model. The human entry point is [`../README.md`](../README.md).

## Room (Cloudflare Durable Object)

The room is a Cloudflare Worker + Durable Object defined in `packages/room`. One DO
instance exists per room; the DO is the sequencer, log store, claim table, roster, and
timer source.

### Deploy to production

```sh
cd packages/room
bunx wrangler deploy
```

`wrangler.jsonc` names the Worker `mesh-room` and binds a single DO class `RoomDO`
with SQLite storage (`new_sqlite_classes`). The DO migration tag is `v1`; Cloudflare
applies it on first deploy. The Worker URL after deployment is:

```
https://mesh-room.<your-account>.workers.dev
```

Use that URL in `mesh create-room --url` and in `mesh.yml room.url`.

### Run locally (development)

```sh
cd packages/room
bunx wrangler dev
# Listening at http://localhost:8787
```

The local DO state lives in `.wrangler/state/`. It is not persistent across `wrangler dev`
restarts unless you pass `--persist-to <dir>`.

### Monitor

Use the Cloudflare dashboard (Workers → mesh-room → Real-time logs) to watch request
logs. Errors from the sequencer surface as HTTP 4xx/5xx responses and are logged by
the Worker. The DO does not emit structured metrics in v1; rate-limit events
(`429 rate_limited`) and state-machine errors (`409 invalid_transition`) appear in the
request log body.

The `GET /healthz` endpoint is unauthenticated and always returns `200 {"ok":true}` if the
Worker is up. Use it for external health checks.

### Rotating the join secret & inviting participants

The room stores only `sha256(join_secret)`; the plaintext lives in the invite token
(`<room_id>.<join_secret>`) held by the room creator (`rooms.json`). Invite lifecycle:

- `mesh room invite --show` — reprint the stored invite (creator's MESH_HOME only).
- `mesh room invite --rotate` — owner-only `POST /invite`: mints a fresh secret, the old
  one is immediately invalid. Rotation does not evict existing participants — their
  bearer tokens and id↔pubkey bindings remain valid. New room = clean slate.

**Passphrase invites (single-use, per-participant).** When sharing the full invite token
is awkward, the owner can mint a short human-relayable phrase scoped to exactly one
participant id:

```sh
mesh room invite --for "back-end worker" --passphrase angry-lion   # or omit --passphrase to auto-generate
mesh room invite --list                                            # pending invites (owner only)
mesh room invite --revoke "back-end worker"                        # cancel before use
```

The joiner needs only the room URL, the room id, and the phrase:

```sh
mesh keygen --id "back-end worker"
mesh room join <room-url> <room_id> --passphrase angry-lion
```

The room stores only a salted hash. A phrase is deliberately low-entropy, so it is safe
only because it is **single-use** (consumed on the first successful join), **id-scoped**
(admits only a card whose id matches exactly), **attempt-capped** (burned after 5 wrong
guesses), and **short-lived** (default TTL 1 h, `--ttl <seconds>`, capped at 7 days).
TOFU still applies: if the id is already bound to a different pubkey, the join fails
`id_taken` and the invite is not consumed.

### Storage ceiling and compaction

v1 uses the DO SQLite store for the append-only log, claim table, roster, and timer queue.
The Cloudflare DO SQLite limit is 1 GB per DO.

Compaction is deferred to v1.1. The `GET /v1/rooms/:room/snapshot` endpoint returns a
signed checkpoint `{head, claims[], roster[], room_sig}` so a reconnecting client or
daemon can start from a recent snapshot rather than replaying from genesis. The snapshot
is synthesized on read in v1 and is not a compaction point — the full log remains.

When the log grows large (many thousands of entries), reconnect time increases because
the daemon replays from its wake cursor. The cursor is stored locally in
`state_dir/wake_cursor.json`; resetting it (deleting the file) causes a full replay on
the next `meshl run`.

---
## Artifact store (R2)

Deliveries upload a tar.gz of the delivered directory to R2, referenced by `r2:<sha256>`.

One-time setup (prod):
```sh
wrangler r2 bucket create mesh-artifacts
```

Retention: configure a 30-day expiry lifecycle rule:
```sh
wrangler r2 bucket lifecycle add mesh-artifacts --prefix "" --expire-days 30
```

Local dev/tests need no setup — miniflare provides a local R2.
Artifacts are room-scoped (`<room>/<hash>`), membership-gated, 25 MB max, and
wiped when the room is deleted.

---
## File plane (foundation)

The file plane turns a room into a live shared folder: agents post `file.write` and
`file.delete` performatives; the room DO reduces them into an in-DO metadata tree
(`file_tree` table) and exposes it at `GET /v1/rooms/:room/tree`.

File content reuses the existing R2 artifact store (`r2:<sha256>`); the tree entry
records `{path, content_hash, size, tip_seq}` only — bytes are fetched per-file on demand.

### `mesh fs` verbs

**Identity contract:** a file's identity is `normalizeId(path relative to the workspace
root)` — identical in the owner's folder, the room tree, and every agent's folder; byte
freshness (in sync / ahead / behind / diverged) is orthogonal and tracked per-machine (see
`mesh fs status`). Every fs verb below resolves local bytes against ONE workspace root,
default the current directory (files land in place — no `.mesh/fs` shadow copy). `--root
<dir>` overrides the root; `--into <dir>` remains as an explicit alias for one-off scratch
staging (`--into` wins if both are given).

| command | action |
|---------|--------|
| `mesh fs put <path> [--as <repopath>]` | Upload a file to R2 and post a `file.write` entry (OCC merge-on-write) |
| `mesh fs ls [<prefix>] [-f] [--into <dir>\|--root <dir>]` | List the shared file tree; `-f` = live view (clears + redraws on file-plane events, 5s TTL tick): tree · policy · leases (holder + remaining TTL) · editing · `local` column showing which bytes are hydrated under the workspace root (default: cwd) |
| `mesh fs get <repopath> [--into <dir>\|--root <dir>]` | Hydrate a file from R2 into the workspace root (default: cwd) |
| `mesh fs rm <repopath>` | Post a `file.delete` entry (removes the path from the tree) |
| `mesh fs edit <path> [--into <dir>\|--root <dir>]` | Subscribe + hydrate Yjs CRDT doc; relay updates; dirty-check against a local sidecar and 3-way-merge on re-invoke; publish snapshot on exit |
| `mesh fs lock <path>` | Acquire an exclusive lease on a path (`file.lock` performative); auto-subscribes a watch on the path (also on `423 path_locked` rejection) |
| `mesh fs unlock <path>` | Release an exclusive lease (`file.unlock` performative); deletes the matching auto-watch |
| `mesh fs grep <query> [--prefix p] [--limit n] [--hydrate]` | FTS content search via `/search`; `--hydrate` also fetches matched winners |
| `mesh fs hydrate [<prefix>] [--into <dir>\|--root <dir>]` | Bulk-download a subtree to disk, into the workspace root (default: cwd) |
| `mesh fs log [-f]` | Show workspace changes (`file.*`, `system.grant`/`role`/`revoke`/`lease_clear`/`config`) |
| `mesh fs grant <subject> <path> <grade>` | Issue a path grant (owner only; grade: `discover\|read\|write\|exclusive`) |
| `mesh fs grants` | List all path grants in the room |
| `mesh fs revoke <subject> <path>` | Revoke a previously issued path grant (owner only; `404 unknown_grant` if none matches) |
| `mesh fs role <participant> <role>` | Bind a participant to a file-plane role (owner only) |
| `mesh fs roles` | List all role bindings in the room |
| `mesh fs role-rm <participant> <role>` | Unbind a participant's file-plane role (owner only; `404 unknown_role` if none matches) |
| `mesh fs leases` | List all active file leases in the room |
| `mesh fs config <open\|closed>` | Set the room's `default_access` posture (owner only) |
| `mesh fs deps <path>` | Walk a file's transitive import closure; flag each dependency `[readable]`/`[unreadable]` |
| `mesh fs request <path> [--grade read]` | Post an advisory `file.request` so the owner sees which files a scoped agent needs |

Path identity is cross-OS safe: paths are normalised to lowercase, NFC Unicode, forward
slashes, and Windows-reserved names are rejected at the proto layer.

### `/tree` endpoint

```sh
GET /v1/rooms/:room/tree[?prefix=<path>]
# → { tree: [{ path, content_hash, size, tip_seq }, …] }
```

Requires a valid bearer token (membership-gated). The response covers the entire namespace
(or a prefix subtree). The tree is KB–MB even for a large repo; content bytes are never
included — call `mesh fs get` or `GET /v1/rooms/:room/artifacts/<hash>` per file.

---
## Write policies

Every file path has a write policy. The policy governs what happens when two agents edit the
same file concurrently. Reads are never gated by write policy — a reader always sees the latest
committed tip.

### Policy table

| Policy | Paths | Behaviour |
|--------|-------|-----------|
| `merge` | Code (`.ts`, `.go`, `.rs`, `.py`, `.js`, `.sql`, …) | Optimistic merge-on-write (OCC). Default for all code extensions. |
| `shared` | Prose, data, unknown, no-extension | Yjs CRDT relay (`mesh fs edit`). Default for everything else. |
| `exclusive` | Opt-in only (via override) | Exclusive lease required. Non-holders get `path_locked` (423). |

The policy is determined client-side by `policyFor(path, overrides?)` in `@mesh/proto`. An
`overrides` list of `{ glob, policy }` objects is checked first (first-match); then extension
lookup; then the default `shared`.

### Merge-on-write (code paths)

`mesh fs put` and `mesh fs edit` use optimistic concurrency control (OCC):

1. Client reads the current tip hash (`GET /tree`) and records it as `base_hash`.
2. Client uploads new bytes to R2 and posts `file.write { path, content_hash, size, base_hash }`.
3. **Server CAS check:** if `base_hash` ≠ current tip, the server rejects with `409 stale_base`
   and returns the current tip hash in `hint`.
4. **Client merge:** on `stale_base`, the client fetches the base blob and tip blob from R2, runs
   `diff3` three-way merge (base = common ancestor, ours = local edits, theirs = tip):
   - **Non-overlapping edits** → clean merge; both sets of changes land. Client re-posts with
     the merged content and the tip as the new `base_hash`.
   - **Overlapping edits** → conflict markers are written to the local file:
     ```
     <<<<<<< mine
     … your edits …
     =======
     … concurrent tip edits …
     >>>>>>> tip
     ```
     The conflicted file is NOT re-posted; the agent resolves manually and re-runs `mesh fs put`.

### Shared CRDT relay (prose / data paths)

`mesh fs edit <path>` runs a live CRDT session:

1. **Subscribe first** — opens a WebSocket (`/stream`) and buffers incoming `crdt` frames for
   the target path before hydrating the snapshot, so no update is lost.
2. **Hydrate** — fetches the latest R2 blob for the path (Yjs snapshot or plain-text fallback),
   applies any buffered frames, writes the result to `<into>/<path>` (default: the workspace root, i.e. cwd).
3. **Relay** — broadcasts the current doc state via `POST /relay` so late-joining peers
   reconverge immediately.
4. **Publish** — writes a `file.write` snapshot to R2 every 30 s and on `SIGINT`/`SIGTERM`,
   so the stable tree tip stays current. The un-snapshotted window between publishes is bounded
   and visible in the log.

The relay endpoint (`POST /v1/rooms/:room/relay`) is ephemeral: it broadcasts the opaque update
over WebSocket to all connected peers but does NOT append it to the log.

### Exclusive opt-in lease

For paths requiring strict serialisation (e.g. generated files or lock files), an agent can
acquire an exclusive lease:

```sh
mesh fs lock src/generated/schema.ts     # acquire
# … edits …
mesh fs unlock src/generated/schema.ts   # release
```

The `file.lock` performative is a CAS against the `file_lease` table (pure reducer in
`@mesh/proto`). The lease expires automatically after `lease_ttl_s` (room default: 1800 s).
A holder's `file.write` (or explicit `POST /leases/heartbeat`) auto-renews the lease. On
expiry the room appends a `system.lease_clear` log entry (`{path, holder, reason:
"lease_expired"}`) and clears the row — a logged, watchable event, not a silent internal
delete, so any daemon watching the path is told.

A `file.write` or relay from a **non-holder** to a locked path returns `path_locked` (423):
the non-holder must wait for the holder to unlock (or for the lease to expire) before writing.

| Error | Cause |
|-------|-------|
| `path_locked` (423) | Path is exclusively locked by another agent |
| `not_holder` (403) | `file.unlock` called by someone other than the lock holder |

### Per-path ACL grants

The room owner can restrict write access to specific path subtrees:

```sh
# HTTP — owner's bearer token required
POST /v1/rooms/:room/grants
{ "path_prefix": "infra/**", "subject": "agentB@team-be", "access": "read" }

# CLI equivalent
mesh fs grant agentB@team-be infra/** read
```

To revoke a previously issued grant (owner only; `404 unknown_grant` if no matching grant exists):

```sh
POST /v1/rooms/:room/grants/revoke
{ "path_prefix": "infra/**", "subject": "agentB@team-be" }

# CLI equivalent
mesh fs revoke agentB@team-be infra/**
```

Revoking is logged as a `system.revoke` entry `{grant: {path_prefix, subject}}` and fires any
watch registered on the affected path (S-E14: revoking access is as visible as granting it).

The grant is logged as a `system.grant` entry and stored in the `grants` table. Resolution:

- **No matching grant** → default allow (membership parity).
- **Matching grant with `access: "write"`** → write allowed.
- **Matching grant with `access: "read"`** → write blocked (`not_authorized_path` 403).
- **Owner** → always authorized, regardless of grants.
- Most-specific matching `path_prefix` wins (longest prefix first).

`path_prefix` patterns: `infra/**` (any depth below `infra/`), `infra/*` (one level), or an
exact path.

**v1 read-ACL note:** per-path read confidentiality is v2 (CONTEXT §12.7.5). In v1, reads are
membership-gated: any room member can read any file via `/tree` and `/artifacts/:hash`, regardless
of grants. Grants narrow *write* access only. For sensitive paths, use a separate room.

---
## Content search

The room DO maintains a FTS5 full-text index (`file_fts`) over all uploaded file content.
Agents can search anywhere in the shared folder without materialising the whole repo — the
response carries **snippets only, not file bytes**. Callers hydrate only the matched winners.

### How it works

1. Every `file.write` triggers an async R2 blob fetch (via `ctx.waitUntil` — **off the storage
   input gate**; the writer's response is not delayed by indexing). The DO decodes the blob as
   UTF-8 and upserts `(path, content)` into `file_fts`. Indexing is content-addressed: a
   re-write with the same `content_hash` is a no-op.
2. `file.delete` removes the path from the index immediately.
3. Binary or oversize content (> 1 MB / invalid UTF-8) is silently skipped — the path stays
   in the metadata tree but is not searchable.

### `GET /search` API

```sh
GET /v1/rooms/:room/search?q=<fts-query>&prefix=<path-prefix>&limit=<n>
# → { results: [{ path, snippet, score }, …] }
```

Requires a valid bearer token (membership-gated). `prefix` scopes results to a path subtree.
`limit` defaults to 50, capped at 200.

| Status | Meaning |
|--------|---------|
| `200` | matches found (possibly empty `results: []`) |
| `400 invalid_query` | malformed FTS5 `MATCH` expression — fix the query |
| `503 search_unavailable` | FTS index or SQL unavailable (R-E2) — transient; retry later |

The response **never includes file bytes** — only `path` and a contextual `snippet`. To read
a matched file, call `mesh fs get <path>` or `GET /artifacts/<hash>`.

### `mesh fs grep`

```sh
mesh fs grep "TODO" [--prefix src/] [--limit 20] [--hydrate]
# prints:  src/server.ts:  … TODO: validate input …
# with --hydrate: also runs `mesh fs get` on each matched file (winners only)
```

`mesh fs grep` is the client-facing interface to `/search`. It prints `path: snippet` per
match. `--hydrate` materialises each matched winner locally (into the workspace root by default);
the rest of the repo is **never fetched**. This satisfies S-E3: the search response plus the
hydrated winners is typically > 100× smaller than the full repository.

If the search host is unreachable or returns `503`, `mesh fs grep` prints `search unavailable`
— it never silently returns an empty result on a connectivity failure (R-E2).

### Storage ceiling and the large-repo path (A8)

**v1 ceiling:** `file_fts` lives in the room DO's SQLite store, which shares the 1 GB
Cloudflare DO SQLite ceiling with the log, claim table, roster, and metadata tree. For small
to medium repos this is ample, but **v1 in-DO FTS is not the answer for a large monorepo**.

**Scale path (`CONTEXT §12.7.6`):** at scale, replace the room-side FTS index with a
dedicated external index Worker that subscribes to the room log, builds and serves the search
index separately, and implements the same `/search` contract. The `MeshClient.search()` call
and `mesh fs grep` are unchanged — only the index host moves out of the DO. This swap is a
deployment concern; no client code changes.

**Guidance:** use v1 DO FTS for any repo whose indexed-text footprint is comfortably below
the ceiling (hundreds of MB of source text is fine); plan the external-index Worker before
hitting that boundary on a large monorepo.

---
## Transparent file tools (shim)

The shim layer makes ordinary tools (`ls`, `find`, `grep`, `cat`) transparently aware of the
shared file plane — without modifying the tools themselves. The agent writes normal shell
commands; the shim routes each call to the right plane service (metadata tree, FTS search, or
artifact hydration) and returns results in the format the real tool would have.

### Opt-in launch: `meshl exec`

The shim environment is **sovereign and opt-in**: it is activated only for processes launched
through `meshl exec`. The operator (or CI step) starts the agent with:

```sh
meshl exec --config mesh.yml -- <agent-cmd>
# e.g.:
meshl exec --config mesh.yml -- claude
meshl exec --config mesh.yml -- bun run my-agent.ts
```

`meshl exec` does three things, then `exec`s the agent (no parent process lingers):
1. **Prepends the shim bin dir to `PATH`** — shim scripts for `ls`, `find`, `grep`, `cat` shadow
   the real tools for all child processes.
2. **Sets `cwd` to the workspace root** (from `mesh.yml` `workspace` field, if set).
3. **Injects `MESH_SHIM_SOCKET`** (daemon IPC socket path) and **`MESH_SHIM_WORKSPACE`** into the
   child environment so shim scripts can reach the daemon.

No other process is affected (no system-wide PATH change). An agent NOT launched via
`meshl exec` sees the real tools as usual.

**Alternative (operator-setup):** the operator prepends the shim bin dir to PATH and `cd`s into
the workspace before starting the agent. The shim scripts themselves only need `MESH_SHIM_SOCKET`
and `MESH_SHIM_WORKSPACE` in their environment; how they get there is up to the operator.

### Tool routing table

| Tool invocation | Route | How |
|-----------------|-------|-----|
| `ls [path]` — in-workspace path | **metadata** | `/tree?prefix=<path>` → format as directory listing |
| `find <dir> -name <glob>` — in-workspace | **metadata** | `/tree?prefix=<dir>` → filter by glob |
| `find <dir> -type f` — in-workspace | **metadata** | `/tree?prefix=<dir>` → emit file paths |
| `grep <query> <files>` — in-workspace files | **search** | `/search?q=<query>&prefix=<dir>` → snippets |
| `cat <file>` — in-workspace path | **hydrate** | `/artifacts/<hash>` → stdout (cached) |
| `head`/`tail <file>` — in-workspace | **hydrate** | same as `cat`; truncated by the shim |
| `ls /etc`, `cat /etc/passwd` — absolute/out-of-workspace | **passthrough** | exec real binary with original args (A3) |
| `find <dir> -exec …`, `-mtime …` — unsupported flag | **fail loud** | exit 1 with a clear error; never partial-scan (A4) |

**Path scoping (A3):** shims route ONLY workspace-relative or in-workspace paths. Absolute or
out-of-workspace paths pass straight through to the real tool — the shim never hijacks `ls /etc`.

**Fail loud (A4):** if a `find` flag (e.g. `-exec`, `-mtime`) cannot be served by the metadata
tree, the shim exits 1 with a descriptive error rather than running the predicate against the
partial cache and returning wrong results.

**Search gating (A1):** `grep` routes to the room `/search` endpoint (requires Plan 3). If the
room's search is unreachable or returns `503 search_unavailable`, the shim exits 1 — it never
scans the partial cache and silently returns empty or wrong results.

### `WorkspaceCache`

The shim maintains a per-room, content-addressed LRU cache (512 MB, 7-day idle TTL). Cache
entries are `Uint8Array` blobs keyed by normalised path and invalidated by hash mismatch:
before serving a cached entry for a `cat`/`hydrate` call, the shim checks the tree's current
`content_hash`; if it has changed, the cache entry is evicted and the blob is re-fetched. The
cache is hash-keyed, so a file moved to a new path that keeps the same content reuses the
cached bytes (cross-path dedup).

### Bulk hydration: `mesh fs hydrate`

For deliberate pre-population (e.g. before running a build):

```sh
mesh fs hydrate [<prefix>] [--into <dir>]
# e.g.: mesh fs hydrate src/ --into /tmp/workspace
```

Fetches the metadata tree for `<prefix>`, downloads each file's R2 blob, and writes it under
`<into>` (default: the workspace root, i.e. cwd). A path-containment guard skips any node whose resolved
destination would escape `<into>` (warns to stderr). Run this before a build, then build on
the real directory — the build sees hydrated files at real paths.

### MCP fs tools

The daemon MCP server exposes three fs tools for MCP-native agents:

| Tool | What it does |
|------|-------------|
| `room_fs_ls` | List the metadata tree (or a prefix subtree); returns `[{path, size, content_hash, tip_seq}]` |
| `room_fs_search` | FTS snippet search over indexed file content (proxies to `/search`) |
| `room_fs_read` | Hydrate a single file from R2 via the workspace cache; returns bytes as base64 |

All three proxy through the daemon IPC socket — they use the same cache and room client as the
bash shim, so cache hits are shared between bash and MCP tool calls.

### S-E6 transparent build — v2 / FUSE (NOT shipped in v1)

A compiler or linter reading an un-hydrated path (e.g. `tsc` following import chains into a
cold workspace) needs FUSE-level interception or a per-language import resolver to hydrate
files on-demand. Neither is in v1.

**v1 workflow for builds:**
1. `mesh fs hydrate src/` — pre-populate the source subtree into the workspace root (default: cwd; `--root <dir>` for a scratch checkout).
2. Run the build in place — the compiler sees real files.

Full build transparency (hydrate-on-read for arbitrary compiler I/O) is the FUSE-adapter work
planned for v2. v1 is honest about this: the shim router returns `passthrough` for any path the
shim can't serve transparently, so a build that touches un-hydrated paths uses the real (local)
file system — it does not silently produce wrong results.


## Local & cross-machine demo

The room does not distinguish participants by host — two terminals with two identities and one
room URL behave exactly like two machines. You do not need to deploy for the local case;
`wrangler dev` on `localhost` is reachable from every terminal on the box.

One-shot helper (boots the room, mints identities + room, prints the per-terminal steps):

```sh
bun run demo:local
```

By hand, each participant needs its own `MESH_HOME` so identities and room tokens don't clobber
each other:

**Terminal 0 — the room**
```sh
cd packages/room && bunx wrangler dev          # http://localhost:8787
```

**Terminal 1 — human (owner)**
```sh
export MESH_HOME=~/.mesh-harry
bun run mesh -- keygen --id harry@hcproduct
bun run mesh -- create-room swarm-demo --owner harry@hcproduct --url http://localhost:8787
# prints:  invite: swarm-demo.<secret>
bun run mesh -- join http://localhost:8787/v1/rooms/swarm-demo swarm-demo.<secret>
bun run mesh -- chat                            # interactive REPL: backfill + live + prompt
```

**Terminal 2 — agent B (backend)**
```sh
export MESH_HOME=~/.mesh-agentb
bun run mesh -- keygen --id agentb@team-be
bun run mesh -- join http://localhost:8787/v1/rooms/swarm-demo swarm-demo.<secret>
```

Work the task lifecycle from here — `claim` → `inform` → `deliver` — see
[README's Task lifecycle](../README.md#4-task-lifecycle) for the full verb reference.

**Terminal 3 — agent C (reviewer)**
```sh
export MESH_HOME=~/.mesh-agentc
bun run mesh -- keygen --id agentc@team-be
bun run mesh -- join http://localhost:8787/v1/rooms/swarm-demo swarm-demo.<secret>
```

Then `accept`/`reject` the delivery from here — same reference as above.

Terminal 1's `mesh chat` shows every transition live (use `mesh log -f` for a non-interactive
stream). For role-gated verdicts, announce with `--verdict-by reviewer:backend` and grant
`agentc` that role at join — roles are filtered by the invite's `grantable_roles` (PROTOCOL §2).

**Scripted arc.** `examples/verify-scenario.ts` drives the full announce → claim → deliver →
accept arc for three tasks (+ the announcer bot) and verifies the chain against a running room:

```sh
MESH_E2E_URL=http://localhost:8787 bun examples/verify-scenario.ts
```

**True two machines.** Same flow, but the room must be reachable from both: deploy it
(`bun run deploy:room`) and use the `https://…workers.dev` base on each machine, or tunnel a dev
room (`cloudflared tunnel --url http://localhost:8787`). Each machine runs its own keygen + join.

To wake **autonomous** agents instead of driving by hand, see the Daemon and Live agent demo
sections below.

### Shared-workspace demo

A one-command scaffold (`demo-scaffold.sh` or `bun run demo:scaffold` from a repo checkout)
boots a room, seeds the shared workspace with a buggy todo-backend, and sets up two teammates
(`fixer@build`, `reviewer@build`) with their operating contracts + `mesh.yml` + live agents.

**Scaffold flags:**

| Flag | Effect |
|------|--------|
| _(none)_ | Boot room + seed workspace + set up agents (live Claude) |
| `--simulate` | CLI-drive the entire fix with no Claude — great "see it work" path |
| `--fire` | Announce the task for you after scaffolding |
| `--no-agents` | Scaffold + seed only; no Claude sessions started |
| `--clean` | Tear down: stop agents + listeners, wipe demo state |

**The seeded fixture** (`examples/todo-backend/`): a tiny in-memory TODO API. Planted bug:
`toggle(id)` in `src/todos.ts` always sets `done = true` instead of flipping it, so a
completed todo can never be un-completed. The failing test is `toggle flips done both ways`;
the one-line fix is `todo.done = !todo.done`.

**Write policy** — applied automatically by extension; no per-file config needed:

| Extension | Policy | Behaviour |
|-----------|--------|-----------|
| `.ts .js .py .go .rs .java …` | `merge` | OCC 3-way auto-merge on write; genuine overlap → `<<<<<<<` conflict markers, never silently lost |
| `.md .txt` (READMEs, plans) | `shared` | Live CRDT relay — everyone's edits merge in real time (`mesh fs edit`) |
| opt-in, any path | `exclusive` | `mesh fs lock <path>` — serialised lease for any path that needs strict serialisation |

Teammates use the `mesh fs` CLI to interact with the shared workspace:
- `mesh fs grep <q> [--prefix <p>] [--hydrate]` — server-side content search; hydrate only matched winners
- `mesh fs get <path> [--into <dir>]` — fetch a file from the workspace
- `mesh fs put <path> [--as <repopath>]` — upload + post a `file.write` entry (OCC merge-on-write for code)
- `mesh fs ls [-f]` — list the metadata tree (`-f`: live view — tree, leases w/ TTL, hydration ratio)
- `mesh fs edit <path>` — live CRDT session for prose files
- `mesh fs lock / unlock <path>` — acquire / release an exclusive lease

For the cross-machine case, run the scaffold on machine 2, share the room URL + invite with
machine 1 out-of-band, then `mesh join` on machine 1. After `fixer@build` does `mesh fs put
src/todos.ts` on machine 2, the human on machine 1 runs `mesh fs get src/todos.ts` and sees
the fixed file immediately — one shared workspace across machines, no tarball.

---


## Daemon (`meshl`)

The `meshl` daemon runs one instance per agent per room. It long-polls the room,
filters events via T0 subscriptions, and wakes the agent process via tmux injection,
MCP polling hints, or both (hybrid).

### Standing vs. dynamic interests: the unified watch model (W6)

Two independent mechanisms feed the same wake pipeline, and both wake the agent —
neither is a fallback for the other:

- **Static (`mesh.yml` `subscriptions.*`)** — standing interests declared once at
  daemon startup: mentions, threads, performative types, roles, and any
  `subscriptions.watches` predicates. Evaluated locally by the daemon's T0 filter
  against every entry it streams.
- **Dynamic (room-registered watches, `POST /watches`)** — per-session interests
  registered on the room itself via `mesh watch entry [--path <p>] [--participant <id>]`
  or auto-registered by the CLI (see below). The room evaluates these server-side and
  pushes a `notify` frame (WS) or a `notifies[]` entry (poll) directly to the owner —
  told, not polled, even for a path the daemon's static config never mentioned.

A `notify`/`notifies[]` hit bypasses the T0 static filter entirely: an explicit
room-registered watch on a path or participant IS the subscription, so the daemon
fetches the referenced entry and feeds it straight to the wake pipeline (T1 gate →
debounce → digest). If the same entry also happens to match T0 independently, the
daemon dedups so it wakes exactly once, not twice.

**Auto-subscribe on lock/edit/423** — `fs lock <path>` and `fs edit <path>` register
a perf-less `{kind:"entry", path}` watch on successful lock/session-start, so a later
`file.unlock` or `system.lease_clear` (lease expiry) on that path tells the holder's
own daemon. `fs unlock` and a clean `fs edit` session end delete that watch again
(bounded growth beats the rare hand-registered collision). If `fs lock` is rejected
with `423 path_locked`, the rejected caller is ALSO auto-subscribed to the same path
before the command exits — so they're told, not left to poll, the moment the path
frees. Watch registration failures (e.g. the 64-watches-per-participant cap) never
fail the surrounding fs operation; they print a visible warning instead.

### Configuration (`mesh.yml`)

Required fields:

| key | type | description |
|-----|------|-------------|
| `identity.id` | string | Participant ID (`name@team`) |
| `identity.key` | string | Path to the identity JSON file from `mesh keygen` |
| `room.url` | string | Room Worker URL |
| `room.id` | string | Room ID |
| `wake.backend` | `tmux` \| `mcp` \| `hybrid` | Wake delivery mode |
| `heartbeat.interval_s` | number | Idle-lease renewal interval |
| `state_dir` | string | Directory for unix socket + wake cursor |

Optional:

| key | description |
|-----|-------------|
| `wake.debounce_s` | Batch window before injecting a digest — optional, default `1` |
| `wake.max_digest_events` | Max entries per injected digest — optional, default `20` |
| `subscriptions.mentions` | Wake when @-mentioned |
| `subscriptions.threads` | Wake on entries in these thread ids |
| `subscriptions.performatives` | Wake on matching performative types |
| `subscriptions.roles` | Wake on entries naming any of these roles (e.g. as a `verdict_by` arm) |
| `subscriptions.watches` | Extra watch predicates to register at startup |
| `wake.tmux.pane` | tmux target-pane (required for tmux and hybrid backends) |
| `wake.tmux.adapter` | CLI adapter identifier (omp, claude, codex) |
| `wake.tmux.busy_retry_s` | Retry interval when pane is busy |
| `wake.tmux.max_busy_wait_s` | Give up after this many seconds if always busy |
| `wake.mcp.poll_hint_interval_s` | Hybrid: inject a nudge if inbox non-empty and agent hasn't polled (default 900 s) |
| `wake.escalation.mentions` | Hybrid: inject on @-mentions (true/false) |
| `wake.escalation.performatives` | Hybrid: inject on these performative types |
| `wake.escalation.watches` | Hybrid: inject on watch-match entries |
| `wake.hook_busy_stale_s` | Seconds a `meshl hooks`-written `busy` state is trusted before probing falls back to pane-scraping — default `900` |
| `wake.duty_poll_interval_s` | Seconds between duty-reconciler `/state` polls, see [Duty reconciler](#duty-reconciler) below — default `60`; `0` disables |
| `gate.enabled` | Enable the T1 attention gate — default `false`. **Currently a validated no-op stub:** survivors pass through unfiltered even when `true` (the LLM call is not yet implemented) |
| `gate.endpoint` | LLM endpoint URL for the gate (no effect while the stub is a no-op) |
| `gate.model` | Model identifier for the gate (no effect while the stub is a no-op) |
| `gate.prompt_file` | Path to the gate's prompt template (no effect while the stub is a no-op) |
| `liveness.publish` | Consent switch for observable liveness (Intent F) — publish `signal` condition transitions at all (default `true`) |
| `liveness.interval_s` | Liveness tick interval (default `300`; does NOT inherit `heartbeat.interval_s` — S-F2) |
| `liveness.stuck_after_s` | Append/hook staleness threshold before a held claim reads `stuck` (default `300`) |
| `liveness.debounce_s` | Minimum gap between published transitions (default `60`) |
| `brief.arrival_pointer` | Inject the Intent I arrival pointer at all (first wake / reanchor gap / `poke --brief`) — default `true` |
| `brief.reanchor_after_s` | Seconds since the last wake before the NEXT wake re-anchors with the pointer instead of its digest — default `3600`; `0` disables |

### Duty reconciler

Event wakes fire once, on the triggering entry — an agent that's busy, joins late, or loses a
claim race never re-learns about work that becomes actionable *later*: an open task nobody
re-announces, a delivery awaiting its verdict, or its own claimed task whose dependency just
completed. `daemon/src/duties.ts` closes that gap: every `wake.duty_poll_interval_s` seconds
(default `60`; `0` disables) it re-reads `/state` and, if the actionable set changed since the
last poll, injects a digest — e.g. `[mesh] duties — awaiting your verdict (accept/reject): <ref>
· open to claim: <ref>. Run \`mesh inbox\`/\`mesh state\`, then claim/deliver/accept.` — a pull
over current room state, robust to any missed or unsubscribed event.

### Observable liveness (`signal`, Intent F)

While a task is `CLAIMED`, the daemon's `LivenessMonitor` periodically re-runs the same
`Injector.probe()` the wake gate and `Heartbeater` already use, and — on a `working`↔`stuck`↔`gone`
**transition** only, never per-tick — publishes a `signal` entry (`data:{condition}`). `signal` is
inform-like: it never transitions the claim machine and never renews a lease (PROTOCOL §3). `mesh
state` / `room_roster` show the fold as `cond`/`cond@seq` columns; `condition` reads `-` (null)
unless the participant currently holds a CLAIMED task, even if it published a condition earlier
(claim-gated read, S-F6 — a released participant is never reported stuck). `escalate(stalled)` /
`escalate(lease_expired)` cite the holder's last published condition when one exists. Subscribe to a
peer's transitions with `mesh watch entry --participant <id>`.

**Consent (sovereignty).** `liveness.publish` defaults **ON** — set it to `false` in `mesh.yml` to
opt a runtime out entirely; the room's derived floor (lease expiry, `escalate(stalled)`,
`last_seen_seq`) still protects the room whether or not a given daemon publishes.

**Two cadence guards (S-F2 — surfaced before the lease dies, not instead of it).**
`meshl run`/`meshl validate` warn at startup when `liveness.debounce_s >= liveness.stuck_after_s`
(a transition could be suppressed before it's ever published). At runtime, `LivenessMonitor` warns
**once** per process lifetime when `liveness.interval_s + liveness.stuck_after_s +
liveness.debounce_s >= <room lease_ttl_s>` — past that latency budget a `stuck` signal can't
possibly surface before the claim's own lease would have expired anyway, defeating the point.

**MCP-only quality note.** On `wake.backend: mcp` the daemon has no tmux pane to probe — its
`LivenessMonitor` runs against a no-op injector whose `probe()` always reports `idle`. Conditions
published there are **append-freshness-based only** (`working` while the agent keeps posting/
claiming within `stuck_after_s`, else `stuck`); `gone` is **never** daemon-published on this
backend — an MCP-only agent's actual death still surfaces only through the room-derived floor
(lease expiry). This is the same asymmetry the `tmux`/`hybrid` backends' real pane probe closes;
it is a known MCP-only limitation, not a bug.

### Briefing plane (`mesh brief` / `room_brief`, Intent I)

`mesh brief` (CLI) and `room_brief` (MCP tool) compose the SAME shared read: the room's
standing charter (`charter/room.md`), your bound seat's contract(s) (`charter/roles/<role>.md`),
and your current situation (open-to-claim, awaiting-your-verdict, dependencies-ready duties via
the shared `@mesh/proto` classifier, plus open decisions where you are a named settler). Roles
ALWAYS come from the room's `GET /roles` binding-resolution view (in-window bindings only) —
never the roster's join-time card cohort and never a daemon's local `subscriptions.roles`.
Charters are ordinary `shared`-policy file-plane content — `mesh fs put charter/room.md` /
`charter/roles/<role>.md` to author or amend one; every edit is a signed `file.write` entry,
attributed in the brief by seq + signed sender (S-I3). A room with no stated charter still
returns a full brief — `content`/`tip_seq`/`author: null` per charter section, never an error
(R-I1). Charters INFORM, never compel: nothing in a charter's text is parsed or consulted by any
authorization check (R-I2) — verdicts, grants, and decisions flow only through the room's
existing authorities, exactly as if no charter existed.

**Arrival pointer.** The daemon injects a one-line pointer — never the charter body — at three
moments: (a) the first wake ever for this identity + `state_dir` (neither a wake cursor nor a
wake stamp exists yet), (b) a wake delivered after a gap of at least `brief.reanchor_after_s`
since the previous wake (the pointer REPLACES that wake's digest — or a duty nudge's line — since
the injector's `inject(line)` contract is one line/one Enter; `mesh inbox` still carries the
digest's detail on the next pull), and (c) `meshl poke --brief` (an explicit operator request).
A successful injection always stamps `last_wake.json` — including the first-wake pointer itself,
so a crash-looping daemon does not re-announce itself on every restart. Guidance-CHANGE wakes
ride the existing `charter/` path watch machinery (`mesh watch entry --path charter/room.md`) —
no new subscription kind.

**Config (`mesh.yml` `brief:`, optional).** `arrival_pointer` (default `true`) is the owner's
consent switch — set `false` to silence pointer injection entirely (sovereignty; the room's
derived floor is unaffected). `reanchor_after_s` (default `3600`; `0` disables re-anchoring)
tunes how long an absence must be before the next wake re-anchors instead of just delivering its
digest.

#### How to give your room a charter

End state: every arrival — human or agent — runs one command and knows the room's mission,
its own seat's contract, and what needs it right now.

Prerequisites: you are the room owner (steps 1–3; step 4 works for anyone), and the target
participants are joined.

1. Write the room charter locally, then publish it to the well-known path:

   ```sh
   $EDITOR room-charter.md          # mission, working agreements, how to signal
   mesh fs put room-charter.md --as charter/room.md
   # entry appended: file.write charter/room.md (signed, attributable)
   ```

2. Write a seat contract per role and publish it under `charter/roles/`:

   ```sh
   $EDITOR reviewer-contract.md     # what this seat owns, its verdict policy, its cadence
   mesh fs put reviewer-contract.md --as charter/roles/reviewer.md
   ```

3. Bind who fills the seat — the brief resolves seats from the Intent G role-binding view
   (`GET /roles`, in-window only), so an unbound contract is unreachable no matter what it says:

   ```sh
   mesh fs role dana@team reviewer
   mesh fs roles                    # confirm: dana@team holds reviewer, in-window
   ```

4. Verify as a participant:

   ```sh
   mesh brief
   # who i am: dana@team in swarm-myproject (roles: reviewer)
   # room charter:
   #   # charter/room.md — seq <n> by <owner-id>
   #   <charter body>
   # my seats:
   #   # charter/roles/reviewer.md — seq <n> by <owner-id>
   #   <seat contract body>
   # situation:
   #   awaiting your verdict (accept/reject): <task-refs>
   #   dependencies delivered — proceed/deliver: <task-refs>
   #   open to claim: <task-refs>
   #   open decisions awaiting your input: <id> (<question>)
   ```

   MCP-hosted agents get the same read via the `room_brief` tool (`{role?}` narrows to one
   seat). Daemon-driven agents are pointed at it automatically — see "Arrival pointer" above.

5. Amend anytime: re-run the same `mesh fs put … --as charter/…` — the brief always reads the
   tip, and participants watching the path (`mesh watch entry --path charter/room.md`) are
   woken through the existing notification machinery.

Troubleshooting:

- **A seat section is missing from someone's brief** → they hold no in-window binding for that
  role. Run `mesh fs roles` and check the `window` range — a time-boxed-out binding does not
  surface the seat (bench `depth` does not matter here: any in-window binding, starter or
  bench, surfaces it). Roster "roles" (the join-time card cohort) grant nothing here.
- **`no charter yet — owner can \`mesh fs put charter/room.md\`** → expected in a charter-less
  room (R-I1): the brief still reports the live situation; only the guidance sections are empty.
- **A charter says "X may accept" but X's accept is rejected** → working as designed (R-I2):
  charters inform, never compel — verdict authority still flows only from `--verdict-by` /
  role bindings.

### Validate before running

```sh
meshl validate --config mesh.yml
```

Checks: identity key readable, room token in `~/.mesh/rooms.json`, room reachable at
`/healthz`, tmux pane probe (tmux backend only), watches registrable.

Exit code 1 if any check fails; each failure is printed to stderr as `FAIL  <description>`.

### Run

```sh
meshl run --config mesh.yml
```

The daemon opens a unix socket at `state_dir/daemon.sock`. On SIGINT or SIGTERM it stops
the consumer and heartbeater cleanly.

### Status

```sh
meshl status --config mesh.yml
# room:        swarm-myproject
# wake_cursor: 142
# queue_depth: 3
# probe:       idle
# state_dir:   /home/user/.mesh/state/agentB
```

- `wake_cursor` — last seq the daemon processed; stored in `state_dir/wake_cursor.json`
- `queue_depth` — entries between the wake cursor and the room head
- `probe` — tmux pane state (`idle`, `busy`, `gone`; `n/a` for non-tmux backends)

### MCP shim

```sh
meshl mcp --state-dir <state_dir>
```

Runs the stdio MCP server, bridging the agent host to the daemon's unix socket. The
MCP shim is stateless — it forwards JSON-RPC calls to the socket and returns results.
If the socket is absent (daemon not running), every MCP tool returns a structured
`{error: "daemon_not_running", ...}` result rather than throwing.

Wire to Claude Code:

```sh
claude mcp add mesh -- meshl mcp --state-dir ~/.mesh/state/agentB
```

### State directory layout

```
state_dir/
  daemon.sock        # unix socket for IPC (MCP shim + CLI inbox)
  wake_cursor.json   # {"seq": N} — last processed entry
```

The unix socket is removed and recreated on each `meshl run`. The wake cursor persists
across restarts; delete it to replay the full log on the next run.

Logs from the daemon go to stdout/stderr of the `meshl run` process. Redirect as needed:

```sh
meshl run --config mesh.yml >> ~/.mesh/state/agentB/daemon.log 2>&1 &
```

---
## Live agent demo

`scripts/live-demo.sh` is the end-to-end proof that agents *actively participate*: a human
posts one sentence and two real agents coordinate to satisfy it, with no scripted decisions.
It is the fastest way to demonstrate the whole stack on one machine.

### What it stands up

```
human (you)          posts "I need a homepage" (a request) via the mesh CLI
hermes@router        live Claude in tmux pane meshlive:0.0, woken by its daemon on `request`
                     → reads the request, runs `mesh announce homepage --verdict-by <you>`
webby@frontend       live Claude in tmux pane meshlive:0.1, woken by its daemon on `announce`
                     → `mesh claim homepage` → builds index.html → `mesh deliver … --artifact git:homepage@<sha>`
you                  `mesh accept homepage` → DONE
```

Each agent is a normal interactive `claude` session in a tmux pane. Each has its own `meshl`
daemon (tmux wake backend) that T0-filters the room stream and injects a one-line `[mesh]`
wake into the agent's pane. Each agent's behaviour comes entirely from its operating contract
(`examples/agent-prompts/router.md` and `frontend.md`), copied into the agent's working
directory as `CLAUDE.md`.

### Prerequisites

- `claude` installed and **logged in** (Claude Max or API). The agents reason with it.
- `tmux` and `bun` on `PATH`.
- No room to deploy — the script boots `wrangler dev` locally if `:8787` is not already up.

### Run it

```sh
# from the mesh/ repo root
bun run demo:live                # or: bash scripts/live-demo.sh
tmux attach -t meshlive          # optional: pane 0 router, pane 1 worker, pane 2 room log

# the whole demo is one sentence (or pass --fire to have the script post it):
MESH_HOME=~/.mesh-live/harry mesh post "I need a homepage"

# you are the verdict authority (the router announces with --verdict-by you):
MESH_HOME=~/.mesh-live/harry mesh accept homepage --body "ship it"

bash scripts/live-demo.sh --clean   # stop agents + daemons, wipe ~/.mesh-live
```

`mesh` here is the repo CLI; if you have not built the binary, use
`MESH_HOME=~/.mesh-live/harry bun packages/cli/src/main.ts post "I need a homepage"`.

### Proof the trigger is real (not the script poking the agent)

Between an idle agent pane and its `claim`, the only thing that touches the worker's terminal
is the daemon. Watch for the injected line in the worker pane (`tmux capture-pane -p -t meshlive:0.1`):

```
❯ [mesh] 1 event in <room>: announce(homepage). Run `mesh inbox` for detail; act via mesh claim/deliver/post.
⏺ Bash(mesh inbox --mark)
⏺ Bash(mesh claim homepage)
⏺ Bash(mesh deliver homepage --artifact git:homepage@<sha> …)
```

That digest is `buildDigest()` output delivered by `TmuxInjector.inject` (`tmux send-keys`).
The server-side `mesh log` (independent of any terminal) shows the matching
`request → announce → claim → deliver → accept` chain.

### Customising

The script generates a `mesh.yml` per agent under `~/.mesh-live/<name>.yml`. To use a
different runtime, change `wake.tmux.adapter` (`claude` → `omp`/`codex`) and the launch binary
in `~/.mesh-live/launch-<name>.sh`. To prove "don't care how many are listening", add a second
worker pane + daemon with the same `frontend.md` contract — the claim is a compare-and-set,
so exactly one wins and the rest get `claim_conflict`.

### Troubleshooting

| symptom | cause / fix |
|---|---|
| agent pane shows `Not logged in` or `node: command not found` | the tmux pane started with a minimal `PATH`; the launcher sets a full one — ensure `claude`/`node`/`bun` resolve in your login shell |
| daemon never injects | pane is busy or not idle-detectable; `meshl status --config ~/.mesh-live/webby.yml` shows `probe:` — must be `idle`. Claude idle = empty `❯` prompt, busy = `esc to interrupt` footer |
| `accept` → `not_authorized_verdict` | the announce did not name you as verdict holder; the router contract uses `--verdict-by <requester>`, so post the request as the same id you accept with |
| agent stalls at the folder-trust prompt | the script sends Enter to accept it after launch; if your `claude` build differs, accept it once manually in the pane |
| daemon detects `busy` unreliably (screen-scraping the pane is fragile) | wire `meshl hooks --runtime claude\|omp --state-dir <dir>` into the agent's idle/busy hooks — the robust wake signal, not a pane-scrape guess |
| you know there's work but don't want to wait for the next digest | `meshl poke --config <path>` force-injects an inbox hint immediately, bypassing the idle/busy gate |

---

## Security model & v1 limitations

mesh's integrity rests on signatures + the hash chain: every entry is Ed25519-signed by
its author, the room binds each `id` to one pubkey at join, and the bearer identity is bound
to `sub.sender` and `sub.room` on append (no cross-room/cross-identity replay). Verification
is a library call, not a CLI command: `verifySubmission` (`@mesh/proto`) re-derives and checks
an entry's signature against the hash chain — the same check the room runs on append,
exercised end-to-end by `examples/verify-scenario.ts`.
Within those guarantees, operators should know:

- **Room ids must be unguessable.** `POST /create` is unauthenticated and first-caller-wins
  (the DO is addressed by `idFromName(roomId)`). Anyone who creates an id before you owns it.
  Use random/namespaced room ids and create them at provisioning time, not predictable names.
- **The invite secret is the trust boundary.** Holding it lets a participant join, and with the
  default `grantable_roles: ["*"]` it lets them self-assign any role (including verdict roles).
  Pass an explicit `grantable_roles` list to `create-room` to scope what roles an invite can grant.
  Treat the invite like a shared secret; rotate with `mesh room invite --rotate`.
- **Passphrase invites trade entropy for relayability — mind their guards.** A phrase admits
  whoever presents the matching participant id + phrase first, so share it out-of-band with the
  intended agent only. Safety comes from the guards (single-use, id-scoped, 5-attempt burn,
  TTL); don't extend `--ttl` beyond what the handoff needs, and `--revoke` anything unused.
- **Identity files are local secrets.** `~/.mesh/identity.json` (private key) and `rooms.json`
  (bearer tokens) are written `0600` in a `0700` home; the daemon IPC socket is `0600` in a
  `0700` state dir. Do not loosen these on shared hosts.
- **Submission size is capped** at 64 KB; **roster** at 512 participants/room; **watches** at 64
  per participant; announce durations (`lease_ttl_s`/`max_claim_s`/`claim_window_s`) must be
  integers in `[1, 2592000]`. These bound how fast one participant can grow the DO (1 GB ceiling).
- **A holder can hold a claim indefinitely** by heartbeating or posting progress (lease
  auto-renews). `max_claim_s` raises `escalate(stalled)` but does not auto-release (D5) — the
  owner force-releases. Watch for stalled holds.
- **Known follow-ups (v1.1):** `card_sig` is not yet verified at join (impact bounded by the
  id↔pubkey binding + role scoping); WS connections and full-log replay per connect are not
  capped; `/create`, `/join`, and `/watches` are not yet rate-limited (roster/watch caps bound
  the durable damage); the in-memory rate limiter resets on DO hibernation. `task_ref` announce
  is open (any member can announce any ref first).
