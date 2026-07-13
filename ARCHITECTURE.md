# ARCHITECTURE v1 — Multi-Runtime Agent Mesh

> High-level design for v1. Companion to VISION.md (mission, moat, research).
> Principle: the protocol is the product; room, daemon, and adapters are implementations of it.
> v1 scope = kill the wedge pain: humans copy-pasting agent output between teams.

## v1 scope cut

IN: one room; 2+ runtimes; volunteer-mode claims only; dual delivery (terminal injection
+ MCP polling); humans and agents as symmetric participants; signed, hash-chained log;
artifact refs (links/paths). **File plane (Intent E) shipped post-v1** — a shared live
workspace across runtimes (always-resident metadata tree + R2 content store + per-path
write policy + per-path ACLs); see the "File plane" milestone below, `CONTEXT.md` §12,
and `PROTOCOL.md` (file.* performatives, `/tree`/`/search` endpoints).

OUT (deferred, with the layer that will absorb them): auction/tournament modes (L2 adds
`cfp/propose/award`), reputation scoring (reads L1 log, no schema change), payments/AP2,
room-of-rooms federation, any UI. Dashboard: never.

## Layer model

```
L4  PARTICIPANTS   agent CLIs (Claude Code, omp, Codex, …) + humans (any terminal / MCP client)
                   — never modified; the mesh adapts to them, not them to the mesh
L3  ADAPTER        listener daemon, one per runtime, team-owned config
                   attention stack (T0 filters → T1 gate → T2 wake)
                   delivery backends: PTY/tmux injection (push) | MCP server (poll)
L2  PROTOCOL       signed envelope · performatives · claim/lease state machine ·
                   watches · escalation — the ONLY contract between L1 and L3
L1  ROOM           sequencer + append-only hash-chained log + claim table + roster + timers
                   room = Cloudflare Durable Object (v1), one per room; single-threaded
                   sequencer (free CAS); DO SQLite storage; DO Alarms via durable deadline-queue;
                   WebSocket Hibernation. Swappable behind L2 contract (D13).
L0  IDENTITY       participant keypairs · signed capability cards · room admission
                   via capability link (invite token), omp /collab lineage
```

Rule: layers talk only through L2 types. The daemon never knows which substrate the room
uses (D13); the room never knows if a participant is a human or an agent.

File-plane lane (Intent E) threads these same layers — it is NOT a new layer:
L1 stores `file_tree`/`grants`/`role_bindings`/`file_lease` and serves
`/tree`·`/search`·`/relay`·`/artifacts`·`/grants`·`/roles`·`/leases`;
L2 carries the `file.*` + `system.grant`/`system.role`/`system.config`/`system.revoke`/
`system.lease_clear` performatives; L3 adds the `WorkspaceCache` hydrate-on-read shim +
`room_fs_*` MCP tools; `mesh fs` is the human/agent surface. See the "File plane" section below.

## Planes overview (the map — added 2026-07-04)

The layer model above is the *vertical* cut (who talks to whom). This is the *horizontal* cut:
what the product surfaces are. Every plane is a **projection of the same signed log** — none is
a new substrate. ✅ = shipped; all five planes below shipped by v1.13.0 (see `mesh/CHANGELOG.md`
for the release-by-release history).

```
PARTICIPANTS   humans + agents (Claude Code, codex, omp, any terminal) — never modified
                     │  mesh CLI (one-shot) · meshl daemon (wake/inject) · MCP tools
─────────────────────┼──────────────────────────────────────────────────────────────────
THE PLANES           ▼            every plane = a projection of the same log
  ✅ TALK       messages · tasks · claim/lease · deliver + verdict · watches · escalation
  ✅ SHARE      one live workspace · write policies (merge/shared/exclusive) ·
                path grants (capability lattice) · FTS search · ls/grep/cat shim
  ✅ LIVENESS   working/stuck/gone signals (consent-gated) · roster condition fold
  ✅ DECISIONS  questions table (the claim's twin) · right-to-answer · lapse announcements
                — engines/delegation/fallbacks live in PARTICIPANTS, never the room
  ✅ ROSTER-AS-REGISTRY   responsibility→holder bindings (depth · time-box · swap) ·
                card specialties (self-claimed) · stats folds (proven) — the room
                never picks the lineup
─────────────────────────────────────────────────────────────────────────────────────────
THE ROOM       ONE signed, hash-chained log + single-threaded sequencer + timers
               records and ANNOUNCES — never judges, never executes a default
               claim table · roster · grants · decisions — all folds of the log
─────────────────────────────────────────────────────────────────────────────────────────
IDENTITY       Ed25519 keys · id↔pubkey binding (D3) · invites (token / passphrase)
               ✅ key-event lifecycle (KERI-style pre-rotation on this same log)
```

Research behind these planes: `mesh/docs/superpowers/research/2026-07-04-*.md`
(decision plane & allocation · participant key lifecycle · roster as registry).

## L2 Protocol (the core)

### Envelope, performatives, state machine — NORMATIVE SPEC IS PROTOCOL.md (v1.2)

This section is a summary; on any divergence, PROTOCOL.md wins.

- **Two-part record**: participants sign a *Submission* (JCS canonical JSON, Ed25519);
  the room wraps it into an *Entry* `{seq, prev_hash, room_ts, submission, entry_hash}` —
  SHA-256 hash chain from genesis. Senders never sign `seq` (assigned post-submission).
- **Body stays prose** — humans and agents read the same stream (actor symmetry).
  The envelope makes triggers cheap; the claim table makes promises enforceable.
  Verifiability is binding (VISION.md "Design constraint from the moat").
- **Performatives:** the coordination core (`request`/`inform`/`announce`/`claim`/`deliver`/
  `accept`/`reject`/`escalate`) plus additive room-only `system.*` and file-plane `file.*`
  families. Full, current performative table: `PROTOCOL.md` §3. Deferred to v2 (additive):
  `cfp`, `propose`, `award`.

### Claim/lease state machine (per task_ref, owned by L1)

```
ANNOUNCED ──claim(CAS ok)──▶ CLAIMED(holder, lease TTL)
   ▲                            │ holder append / heartbeat renews lease
   │                            ├─ release ────────────▶ ANNOUNCED (reannounce event)
   │                            ├─ lease expiry ───────▶ ANNOUNCED + escalate
   │                            └─ deliver(artifacts) ──▶ DELIVERED
   │                                                       ├─ accept ─▶ DONE (terminal)
   └────────────── reject ◀────────────────────────────────┘
ANNOUNCED + no claim within T_claim ─▶ escalate (room-owner role)
```

Invariants: exactly one holder per task (CAS at the sequencer); DELIVERED requires
artifact refs; only announcer/reviewer-role can accept/reject; every transition is
itself a log entry (the reputation graph reads transitions, not chat).

- **Stalled / force-release (D5)**: a task CLAIMED past `max_claim_s` → `escalate(stalled)`
  to the owner (no auto-release); the owner may force-release CLAIMED → ANNOUNCED.
- **Lease renewal (D11)**: a held lease auto-renews on any holder append; the explicit
  heartbeat is the idle-holder fallback only.

### Watches & delivery

- **Watch**: `{participant, predicate}` where predicate = task state transition
  (`b-backend → DONE`) or envelope pattern (performative/thread/mention). Stored in L1,
  evaluated at append time, emits a targeted `notify` to that participant's queue.
- **Delivery**: at-least-once. Each participant owns a consumed-offset cursor
  (consumer-group semantics). Push (websocket) and pull (HTTP poll `?since=<seq>`) read
  the same log. Idempotency is the consumer's duty (offset check before acting).

## L1 Room substrate

v1: **Cloudflare Durable Object** — one DO per room. Single-threaded = total order for
free; no separate lockfile sequencer; CAS on claims trivially correct.

- **storage**: DO SQLite (log table append-only, claim table, roster, watches, read cursors;
  file plane adds `file_tree`, `file_lease`, `grants`, `role_bindings`, `file_fts` (FTS5), `file_index_state`)
- **transport**: WebSocket Hibernation API (push; idle rooms evict and reconnect) ·
  bounded long-poll fallback (`GET /room/:id/log?since=`, ≤55s, concurrency-capped) ·
  `POST /room/:id/post` · `GET /room/:id/state` (claims+roster snapshot) ·
  `GET /room/:id/snapshot` (chain head + claims + roster for reconnect/verify, D9)
- **file-plane endpoints**: `GET /tree` (metadata tree) · `GET /search` (FTS snippets, never bytes) ·
  `POST /relay` (ephemeral CRDT frames for shared docs) · `POST /grants` (per-path ACL, owner-only) ·
  `POST /grants/revoke` / `POST /roles/revoke` (owner-only revocation, W3) ·
  `POST /leases/heartbeat` (holder-only exclusive-lease renewal, W2) ·
  `GET /leases` (per-caller `discover`-filtered active-lease listing) ·
  `GET /artifacts/:hash` (R2 content blobs, hydrate-on-demand)
- **sequencing**: DO single-thread is the sequencer; no additional process locking
- **timers**: durable deadline-queue persisted in DO storage; DO exposes ONE alarm —
  always set to the earliest deadline; re-armed on every fire (D4)
- **admission**: invite token = capability link (`room-id.key`, omp /collab format);
  first join binds participant id ↔ pubkey into roster (logged);
  mismatched-key rejoin → `409 id_taken` (D3)

Trust note: v1 room sees plaintext (unlike omp collab's E2E). Acceptable for v1;
E2E rooms are a v2 concern (server-side watch evaluation needs visibility — likely
client-side watch evaluation under E2E).

## Substrate swappability (D13)

Room logic sits behind internal `Storage` / `TimerQueue` / `Transport` interfaces;
no DO-only semantics leak into the wire spec. The L2 protocol contract is the
portability guarantee. A self-hostable reference room (same wire spec, alternative
substrate) ships before any cross-org GA. The moat is swappable neutral ground,
not DO lock-in.

## L3 Listener daemon (one per runtime, team-sovereign)

```
room ──ws/poll──▶ [offset cursor] ─▶ T0 structural filters ─▶ T1 relevance gate ─▶ T2 wake
                                       (free)                  (cheap model, opt)    ($$)
                                                                                      │
                                              ┌───────────────────────────────────────┤
                                              ▼                                       ▼
                                   backend: tmux injection              backend: MCP (agent polls)
```

- **Config** (`mesh.yml`, owned by the runtime's team — sovereignty is config locality):
  identity (key path, card), room URL + token, role bindings ("reviewer of backend"),
  thread subscriptions, watch registrations, T1 gate (model + prompt, optional),
  debounce window, backend selection + parameters.
- **T2 wake, terminal-injection backend**: writes into the *live* CLI session
  (`tmux send-keys -t <pane>`). NOT `claude -p` — the running TUI holds the context;
  `-p` spawns cold (decision in VISION.md). Requires **busy detection** before injecting:
  capture-pane heuristic (prompt idle vs streaming) + retry-after-debounce. This is the
  single most fragile component in v1 — isolate it behind an `Injector` interface and
  integration-test it against real Claude Code / omp TUIs.
- **T2 wake, MCP backend**: daemon exposes an MCP server to the local agent. MCP tool
  calling is pull-only today, so the agent drains its inbox via tools; the daemon may
  *also* hold a terminal-injection escalation path for high-priority events (hybrid).
- **Outbound**: agent posts via MCP tool or daemon CLI (`mesh post …`); daemon signs
  with the runtime's key and forwards. Credential custody is **runtime-level** — the
  runtime is the trust unit; the participant key is a runtime-scoped secret (D2).
- Offset persisted to disk; debounce batches a burst into one wake with a digest.

### MCP surface (v1 tools)

| tool | effect |
|---|---|
| `room_inbox(since?, mark?, limit?)` | drain entries+notifies since the agent's read cursor; `mark` advances it |
| `room_post(performative, body, task_ref?, thread?, artifacts?, data?)` | sign + append |
| `room_claim(task_ref)` / `room_release(task_ref)` | claim-table ops (CAS result returned) |
| `room_tasks()`         | claim-table snapshot |
| `room_watch(predicate)`| register dependency watch |
| `room_roster()`        | who's here, cards, roles |
| `room_fs_ls(prefix?)` | file metadata tree (path, size, content_hash); no blob bytes |
| `room_fs_read(path)` | hydrate one file's bytes on demand |
| `room_fs_search(query, prefix?, limit?)` | FTS snippet search; `search_unavailable` returned as result, not error |

## L0 Identity

- Ed25519 keypair per participant (generated by daemon on first run; humans via CLI).
- Capability card: `{id, owner_team, skills[], roles[], pubkey}` — self-signed v1;
  A2A signed-card compatible shape so v2 can verify against domain signatures.
- Admission: capability link grants join; roster entry (id↔key↔card) is a log entry.
- Every envelope signed; room rejects bad signatures; chain hash makes retro-tampering evident.

## File plane (Intent E — shipped post-v1)

A shared live workspace across runtimes ("dropbox for agents"): all participants see and
edit one file tree, across machines, in near-real-time. It is an APPLICATION of L0–L3, not
a new layer — visibility is decoupled from write-coordination, and content is lazy.

- **Metadata plane (always-resident, tiny).** A `file_tree` projection in L1 DO SQLite —
  `{path, size, content_hash, tip_seq, lease_holder, policy}` per file — folded by a pure
  `reduceFile` reducer over `file.write`/`file.delete` log entries (mirrors the claim
  `reduce`). Served at `GET /tree`. Agents navigate / `ls` / see-who-edits with ZERO bytes pulled.
- **Content plane (lazy, content-addressed).** File bytes live in the shipped R2 store keyed
  `r2:<sha256>` (`GET /artifacts/:hash`), one blob per file, hydrated on access and cached LRU
  by the daemon's `WorkspaceCache` (512 MB / 7-day idle, hash-keyed for cross-path dedup). Cold
  first-access latency is the only cost; the full repo never moves wholesale.
- **Write coordination (per-path policy, not per-reader).** Reads never block. Writes resolve by
  a deterministic `policyFor(path)`: `merge` (optimistic 3-way merge-on-write, `base_hash` CAS +
  client `diff3`) for code, `shared` (live CRDT relay via `POST /relay`, room stays
  content-neutral) for prose/plans, `exclusive` (lease via `file.lock`/`file.unlock`, 423 to
  non-holders) opt-in for serialized files. Code defaults to `merge` — CRDT char-merge silently
  miscompiles code, so it is never the code default.
- **Access control (per-path ACLs).** `system.grant` (owner-only, `POST /grants`) narrows a
  member's default read+write on a path prefix, enforced at the tree/write layer; `system.revoke`
  (owner-only, `POST /grants/revoke` / `POST /roles/revoke`) undoes a grant or role binding,
  CAS-rejected as `unknown_grant`/`unknown_role` (404) if the target no longer exists. Full
  per-path read confidentiality on the hash-keyed content endpoint is a v2 concern.
- **Search (server-side FTS).** L1 keeps an FTS5 `file_fts` index over decoded text, updated
  asynchronously off the storage gate (`ctx.waitUntil`) on each `file.write`. `GET /search`
  returns snippets, never bytes; `search_unavailable` is a result, not an error.
- **Just-bash shim (L3, opt-in).** `meshl exec` launches an agent with `cwd=<workspace>` +
  `PATH=<shim>:$PATH` (no global hijack): `ls`/`find -name` → the metadata tree (zero bytes),
  `grep`/`rg` → `GET /search`, `cat`/`head` → hydrate-on-read. Out-of-workspace paths pass through
  to the real binary; unsupported predicates fail loud. `mesh fs hydrate` bulk-pulls a subtree to
  disk for builds (transparent build-on-read needs FUSE — v2).
- **Engine evolution (accepted 2026-07-12; client-library extraction shipped v1.20.0, the
  `IFileSystem`/`just-bash` half not yet built).** Client logic (`MeshClient`, the file-plane
  sync/merge/artifact engine, `WorkspaceCache`, `TreeMirror`) has consolidated into a new L3
  library package `@mesh/engine`; CLI and daemon both depend on it. Still pending: the shim's
  per-tool router superseded by the real `just-bash` interpreter (Vercel Labs, pinned) over a
  `MeshRoomFs` `IFileSystem` backend (tree-mirror metadata + `WorkspaceCache` content + CoW
  write overlay, OCC flush); MCP code-mode tools (`code` primitive, `bash` sugar); the PATH
  shims becoming thin adapters over `MeshRoomFs`; and the `file.write_batch` room addition.
  Room additions already shipped (additive, PROTOCOL §10 discipline, v1.20.0/PROTOCOL v1.8):
  `system.checkpoint` + archive-to-R2 compaction, storage-pressure bands, multipart artifacts.
  Design: `mesh/docs/superpowers/specs/2026-07-12-engine-architecture-design.md`.

Normative wire surface: `PROTOCOL.md` (§3 performatives, §11 fs MCP tools). Intent / context /
acceptance: repo-root `INTENT.md` / `CONTEXT.md` / `EXPECTATIONS.md`. Design specs + plans:
`mesh/docs/superpowers/{specs,plans}/`.

## Canonical scenario → v1 mechanics (acceptance test)

```
human posts:   announce a-frontend, b-backend, c-api          (or Hermes does, via its daemon)
AgentA daemon: T0 matches skill "frontend" → T2 wake → agent: room_claim(a-frontend) → CAS ok
AgentB, AgentC: same for b-backend, c-api
AgentA agent:  room_watch(b-backend → DONE); proceeds with local-only prep work
AgentB agent:  …works… → room_post(deliver, task_ref=b-backend, artifacts=[pr://42]) → DELIVERED
AgentC daemon: role binding "reviewer of backend" matches DELIVERED transition → wake
AgentC agent:  reviews pr://42 → room_post(accept, task_ref=b-backend) → DONE
room:          watch fires → notify AgentA → daemon wakes agent → frontend wiring
```

v1 ships when this runs E2E across 2 physical runtimes with one agent on terminal
injection and one on MCP polling, with a human participating from a third terminal.

## Milestones

- **M0 — protocol freeze**: PROTOCOL.md (envelope, performatives, state machine, wire
  endpoints, signature scheme). Everything else codes against it.
  ➜ FROZEN 2026-06-12, then AMENDED v1.1 2026-06-13 (DO pivot + 12 decisions): Submission/Entry
  split, 9 performatives incl. explicit `deliver`, id↔pubkey binding, `escalate(stalled)`,
  `/snapshot`, conformance §12 (12 items).
- **M1 — room DO Worker + human CLI**: room DO Worker + `mesh` CLI (join/post/log/claim/inbox).
  Two humans in a room = the substrate works before any agent does.
- **M2 — daemon, injection backend**: attention stack + tmux injection + busy detection.
  One agent reacts to room events on a remote runtime.
- **M3 — MCP backend**: second agent participates pull-only. Hybrid escalation.
- **M4 — scenario demo**: canonical scenario E2E (acceptance test above), failure drills,
  then tests/changelog/docs and cut v1.0.0.
- **Intent E — file plane (shipped post-v1)**: a shared live workspace across runtimes —
  always-resident metadata tree, R2 content store (hydrate-on-read), per-path write policy
  (`merge` 3-way for code / `shared` CRDT for prose / `exclusive` lease), per-path ACLs,
  FTS content search, and a transparent `ls`/`grep`/`cat` tool shim. Specs + plans live in
  `mesh/docs/superpowers/{specs,plans}/`; intent/context/acceptance in repo-root
  `INTENT.md` / `CONTEXT.md` / `EXPECTATIONS.md`.

M0–M4's original build plans and the eng-review decision log have been archived; full
release-by-release history is `mesh/CHANGELOG.md`.

## Risks (ranked)

1. **TUI injection fragility** (busy detection, redraws, prompt collision) — mitigate:
   `Injector` interface, per-CLI adapters, integration tests against real TUIs; MCP
   backend as fallback path.
2. **Trigger tuning** (over-waking burns quota; under-waking stalls the room) — mitigate:
   T0-only default config, T1 gate opt-in, debounce digest wakes.
3. **Echo storms** between agents — mitigate: performative typing + per-participant turn
   budget enforced at the room (rate cap is an L1 primitive, not etiquette).
4. **MCP polling latency** makes pull-only agents laggy teammates — mitigate: hybrid
   escalation injection; revisit when MCP gains server push.
5. **Single-DO-per-room** — CF-managed availability (better than self-hosted single binary);
   per-DO storage ceiling (document ceiling, defer log compaction to v1.1; snapshot endpoint
   per D9 bounds reconnect/replay cost); durable timer-queue complexity (single alarm
   re-armed to earliest deadline; mis-management → timer starvation, test T18; D4).
6. **WebSocket hibernation** — DO eviction drops active WS connections; mitigate:
   DO WebSocket Hibernation API preserves connections across hibernation; bounded
   long-poll fallback (≤55s) as reconnect path.
