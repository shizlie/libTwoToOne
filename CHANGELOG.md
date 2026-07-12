# Changelog

All notable changes to this project are documented here.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [1.19.0] — 2026-07-12

### Security

- **Write posture split from discover posture (`default_access`, Intent K
  S-K5/S-K6).** `default_access` was a single `"open"|"closed"` flag gating both
  tree-discovery visibility and file writes together; it is now
  `{discover, write}`, each independently `"open"` or `"closed"`. **New rooms
  default to `{discover:"open", write:"closed"}`** — writes are granted, not
  assumed, while discovery stays open (mirrors the `authority_source`
  secure-by-default posture, no config step required for a fresh room to be
  safe). **Existing rooms are unaffected** — a legacy `default_access` string
  (or its absence) is read as both grades set to that value, byte-for-byte
  unchanged, until the owner explicitly reconfigures it. `system.config` /
  `POST /config` accept the legacy string OR the new object (both grades
  required — no silent partial merge) for wire compatibility. New CLI forms:
  `mesh fs config write <open|closed>` and `mesh fs config discover
  <open|closed>` set one grade independently; the bare `mesh fs config
  <open|closed>` still sets both (legacy alias). A closed-write denial now
  names the remedy: `mesh fs request --grade write <path>`. See
  `docs/operating.md#authority-posture-verdict-authority-authority_source` for
  the full runbook.
- **Role-lapse announce (`system.role_lapse`, Intent K S-K4).** A time-boxed
  `system.role` binding's `active_until` passing now appends a room-authored
  `system.role_lapse` entry (`{participant, role, active_until}`) — scheduled
  from an alarm-driven `role:<participant>:<role>` timer, or fired
  synchronously at `POST /roles` for a bind whose window is already past.
  Announce-only: the read-time window filter (`listRolesForParticipant`)
  remains the sole enforcement, so a lost or delayed announcement can never
  create or extend an authority hole.

### Added

- **`escalate` gains addressees + `escalate.ack` + the `escalations`
  projection (Intent L S-L2/S-L5).** Room-authored escalates now carry
  `data.to: string[]` (`[owner, ...verdict_by]` deduped, or `[owner]` for a
  task-less `timer_failed`) as an advisory routing target. Every escalate
  entry also folds an open row into a new durable `escalations` table
  (surfaced in `GET /state`), closable by ANY member via the new
  participant-authorable `escalate.ack` performative — `mesh ack
  <escalate_seq>` marks it handled, attributed and visible in the record.
  Double-ack, or acking a non-escalate seq, is rejected (`already_acked` /
  `unknown_escalation`).
- **Per-task escalation watches (Intent L, `task_ref` predicate field).**
  `EntryPredicate` gains an optional `task_ref`, matched with the same
  AND-fall-through semantics as `path`/`participant` — `mesh watch entry
  --task-ref <ref>` scopes a watch to one task's traffic instead of every
  performative in the room.
- **`stalled` duty bucket (Intent L S-L4).** `claim` rows expose
  `max_claim_until`; `computeDuties` derives a `stalled: string[]` bucket
  (self-held claims past their `max_claim_s` cap) surfaced in `mesh brief`'s
  duties, the daemon's duty nudge, and `mesh doctor`.
- **Deliver auto-watch + reject retention (Intent L S-L3).** `mesh deliver`
  (both `--dir` and `--artifact` modes) now auto-registers a best-effort
  watch on its own task's `ANNOUNCED`→`DONE` transitions (non-fatal on
  `429`, mirrors the existing `path_locked` auto-subscribe pattern). A
  `reject` verdict now also records `rejected_holder`/`reject_seq` on the
  claim row — most-recent rejection, never cleared on re-claim — surfaced via
  `GET /state` as observability bookkeeping (no state-machine change).
- **Consumer error visibility (Intent L S-L7).** The daemon's WS/poll
  consume loop adopts the heartbeat `onError` callback pattern: a
  consecutive-failure counter (`consume.failure_threshold`, default 3) logs
  a pipe-dead transition exactly once and marks daemon-local state
  `unknown`; on recovery it publishes a fresh `signal(working)` so the
  roster catches up promptly.
- **Honest presence render (Intent L S-L7).** `mesh state` / roster renders
  and `mesh brief` now show each participant's `condition` with its age and
  flip to `stale (unknown)` once `condition_ts` is older than the room's
  liveness baseline × 3 (`CONDITION_STALE_AFTER_MS`, 900s at the 300s
  default) — a dead consume pipe can't publish, so this catches the case a
  lease hasn't expired yet but the last signal is untrustworthy.
- **`GET /state` grows `bindings[]` (Intent M, eng-review decision).** The
  same resolved role-binding view `GET /roles` serves is now duplicated onto
  `/state` so every attention/duty/badge consumer — the duty loop, WAKE
  rules, the ambient badge, `mesh state` — reads authority from ONE field,
  never `roster.roles` (the join-time card cohort).
- **WAKE derived defaults (Intent M S-M1, `attention.derived`).** The daemon
  now wakes on mentions, a `decide.request` naming self or a bound role, a
  `deliver` where self ∈ `verdict_by`, an `escalate` addressed to self or a
  bound role, a conflicting `inform` touching a self-held lease, and a
  `stuck`/`gone` `signal` from a participant a self-held claim
  `depends_on` — sourced entirely from the standing `/state` poll's
  `bindings[]`/grants, zero new daemon traffic. Default ON; opt out with
  `attention.derived: false` in `mesh.yml`. `file.write` under a self-held
  grant is deliberately CHECK-tier, never WAKE (R-M1).
- **Ambient tree-diff awareness (Intent M, `WorksetScanner`).** The daemon
  now runs a background scan (`workset.interval_s`, default 15s, floors at
  5s) diffing the local workspace against the room's `/tree` metadata via an
  mtime/size-hashed cache — zero blob fetches, never writes under the
  workspace root — producing `{behind, conflict}` counts that feed the
  ambient badge and `mesh doctor`.
- **CHECK-tier ambient badge + brief situational section (Intent M S-M3).**
  One stable, parseable status line — `unread: N · fs: X behind, Y
  conflict · Z open decisions` — composed by a single shared function and
  printed identically by `mesh inbox`, `mesh brief`, and the `mesh
  chat`/`mesh log -f` footers (an all-clear state prints nothing). `mesh
  brief` additionally renders the roster it already fetches: participant ·
  bound roles · condition · claimed-not-by-me refs. `mesh inbox` now exits 1
  when entries/notifies are present (the `fs` exit-code convention). `mesh
  join`'s success output ends with a next-steps block (`mesh brief` · `mesh
  inbox` · `fs status`).
- **`mesh doctor` (Intent L S-L6).** One-step, read-only open-problems view:
  open escalations (with an ack hint), stalled holds, lapsed/overdue
  decisions, stale/gone conditions, local `fs status` conflicts, chain
  integrity (`GET /verify`), and missing delivered artifacts.
  `--porcelain` prints stable `KIND\tref\tdetail` rows; exit `0` clean / `1`
  problems found / `2` hard error.
- **Background cache prefetch (Intent M S-M5).** On every consumed
  `file.write` under a readable prefix, the daemon background-warms
  `WorkspaceCache` by `content_hash` (skipping already-warm hashes and files
  over `prefetch.max_bytes`, default 5 MB) — failures swallowed, off via
  `prefetch.enabled: false`. Never touches the working tree.

### Changed

- **Watch `EntryPredicate`** gains `task_ref` alongside the existing
  `path`/`participant` fields (see "Per-task escalation watches" above).
- **`GET /state`** response shape grows `bindings[]` and `escalations[]`
  (see "Added" above); every daemon/CLI consumer reading role authority now
  reads this field instead of `roster.roles`.

### Fixed

- **`fs put` failures are now classified and readable (builds on v1.17.0's `_err`
  snippet).** A non-JSON HTTP failure from an edge/proxy/WAF (the `HTTP 403` an
  oversized or WAF-blocked artifact upload hits before it ever reaches the room
  worker) no longer prints `[unknown_error]` followed by a wall of raw HTML DTD.
  The client now maps the bare status to a real code (`403`→`forbidden`,
  `413`→`artifact_too_large`, `429`→`rate_limited`, `5xx`→`server_error`, …),
  suppresses
  HTML/markup bodies to a `non-JSON body (edge/proxy)` marker (still control-byte
  stripped, no terminal-escape injection), and attaches a per-status remediation
  hint. The hint is now also preserved through the `putArtifact` and fork
  write-back branches of `fsPutOcc`/`forkWrite`, which previously dropped it before
  the row renderer — so the failing row finally shows *why* and *what to do*.

## [1.18.0] — 2026-07-11 (security hotfix)

### Security

- **Verdict authority no longer trusts self-declared card roles.** `accept`/`reject`
  previously resolved `verdict_by` role membership from the sender's own card
  (`roster.roles`, set at join time and never re-checked) — the same field a
  token-invited joiner controls. A joiner could self-declare a reviewer role on their
  card and pass verdicts on any task naming that role, with no owner action required.
  A new room-level posture, `authority_source: "card" | "bindings"`, gates the source:
  under `"bindings"`, `accept`/`reject` require an owner-issued, time-boxed
  `role_bindings` entry (`mesh fs role <participant> <role>`) — a self-declared card
  role no longer confers verdict power. **New rooms default to `"bindings"`** (secure
  by default). **Existing rooms are unaffected until you opt in** — the field is
  absent in their defaults blob, which resolves to `"card"` (today's behavior,
  byte-for-byte). Upgrade path: `mesh fs config authority-source bindings` (owner
  only; bind every current verdict-holder first). `mesh brief` warns the room owner
  in-room while a room they own is still on `"card"` posture. See
  `docs/operating.md#authority-posture-verdict-authority-authority_source` for the
  full runbook.

### Fixed

- **Deadline engine: per-entry alarm isolation (Intent L S-L1/R-L1).** A regime-pinning
  test proved the old `popExpired`-then-process loop silently lost every unprocessed
  timer when one entry threw (no rollback, no retry — worse than assumed). Now: peek
  without deleting; per-entry try/catch; CAS-style delete (`WHERE id AND deadline_ms`)
  so a same-id lease renewal reschedule survives the post-process delete;
  `escalate(lease_expired)` is appended before the release (signal-before-transition,
  at-least-once); transient `processTimer` failures get a bounded retry (3 tries,
  30s backoff) before a single `timer_failed` escalate surfaces the permanent case.
  Note: room-authored `escalate` may now omit `task_ref` (needed for `timer_failed`);
  participant-authored escalate validation is unchanged.
## [1.17.0] — 2026-07-11

### Changed

- **`fs put` streams progress by default — no flag.** During a push you get a live line
  as each file moves: an in-place `⬆ n/N (p%) path` on a TTY, or throttled newline
  progress lines (~1/s) when stderr is captured (an agent or CI), so a run always shows it
  is alive. Previously piped/captured runs were silent until the end.
- **`fs put` completion is one greppable line.** A push ends with `fs put done: <label> —
  N files: X uploaded, Y unchanged[, conflicts, skipped, errors]  [exit N]` (or `fs put
  stopped early: …` if it aborted), plus per-row lines only for outcomes that need a human
  (conflicts/forks/errors/locked/refusals/behind). Routine rows fold into the summary;
  `--verbose` lists every file. A 600-file push no longer scrolls a wall of routine rows.
- **One bad file no longer sinks the batch.** By default a per-file failure (e.g. a file
  over the room's artifact size limit → `413`) is skipped and recorded, and the push
  continues; the summary counts each failure and the batch exits `2`.

### Added

- **`fs put --stop-on-error`** — abort at the first per-file error instead of skipping it.
- **`fs put --verbose`** — print every file as its own row (the pre-summary behavior).
- **Richer `--json` for agents.** A `file` event for a failed upload now carries its
  `error`/`detail` (the reason, e.g. `artifact_too_large`); the `done` event carries an
  `outcomes` per-kind tally and a `stopped` flag — so a `--json` consumer reads the whole
  result, and tells "completed, some failed" from "aborted early", off one line.

### Fixed

- **Opaque `[unknown_error]` on `fs put`.** A non-JSON failure (a Cloudflare edge `413`
  for an over-limit body, a 5xx HTML page, a gateway timeout) used to collapse into a bare
  `[unknown_error]` with no detail. The client now surfaces the HTTP status plus a
  control-byte-sanitized body snippet, with a size hint on `413`.
- **A thrown network/disk error mid-push no longer crashes the whole batch** — it folds
  into a per-file error row (skipped or stopped per policy), including failures inside the
  stale-base self-heal and merged write-back paths.

## [1.16.0] — 2026-07-11

### Added

- **Observable bulk `fs put`/`fs get`.** A preflight plan line (file counts — to-upload/
  download, new/changed, unchanged, locked, skipped — plus an ETA for `put`), then a live
  in-place progress line on a TTY (`⬆ n/N (p%) path`, with a self-correcting "~Xs left"
  from observed throughput), all on stderr. Piped/CI output gets one plan line + one rate
  notice instead of per-file spam.
- **`--json` on `fs put`/`fs get`.** NDJSON to stdout, one object per event —
  `{"type":"plan",...}`, `{"type":"file","n":..,"total":..,"path":..,"outcome":..}`,
  `{"type":"ratelimit","waited_s":..}`, `{"type":"done","op":..,"total":..,"exit":..,
  "elapsed_s":..}`. The CLI process *is* the job — an agent reads its own child's stdout
  incrementally; no server-side job to poll. Human stdout lines are suppressed in `--json`
  mode.
- **`mesh fs config rate "<spec>"`** (owner-only) — retunes a *live* room's per-participant
  `rate_limit`; the DO re-seeds its limiter immediately (in-flight token buckets reset by
  design). Same live update available via `POST /config { rate_limit }`.

### Changed

- **Default room rate limit raised** to `30/min;burst=60` (was `12/min;burst=30`); the
  claim/accept/reject 20% floor is unchanged.
- The old per-wait `… rate-limited; waiting Ns` console spam is gone — folded into the
  live TTY progress line, or a single notice on piped output.
- `rate_limit` (genesis or live `system.config`) is now bounded: `1..600/min`,
  `1..1000` burst — both a malformed spec and an out-of-range one are rejected
  `400 invalid_submission`, enforced at both `POST /create` and `POST /config`.


## [1.15.0] — 2026-07-10

### Changed

- **BREAKING — file-plane workspace root defaults to `cwd`; the `.mesh/fs` shadow
  dir is gone.** Every `fs` verb (`get`/`hydrate`/`ls`/`grep --hydrate`/`edit`) now
  resolves local bytes against **one workspace root, default the current directory**,
  and hydrates files **in place** (Dropbox semantics). Previously these defaulted to a
  `.mesh/fs` shadow cache dir. `--root <dir>` (and its alias `--into <dir>`, which wins
  when both are given) select an explicit scratch checkout. Migration: scripts that
  relied on the implicit `.mesh/fs` target must pass `--root .mesh/fs` explicitly, or
  adopt in-place hydration. Rationale: the shadow dir was a fossil of the pre-safe-get
  cache-dir design (CONTEXT §12.7 correction, 2026-07-10).

### Added

**No lost work — the sync contract (Intent J)**

- `classifySync(local, base, tip)` — the pure state primitive over the 14-cell
  existence×equality partition (`@mesh/cli` `sync.ts`), driving both read and write
  engines from one tree fetch per batch.
- `mesh fs status` / `mesh fs diff` — porcelain-capable working-set view
  (`STATE\tpath`) and per-file unified diff against the room tip, with a memory guard
  on large blobs. New `gated` state for discover-only (content-hash-omitted) nodes.
- Safe `fs get`/`hydrate` **get engine** (`runGetBatch`): plan → apply → record, never
  writes the room (`GetClient` deliberately lacks `putArtifact`/`postEntry` — a
  compile-time proof). Per-row containment guard; one poisoned row never stalls the
  batch (R-J1). Behind-on-`get` converges local; `put` never writes local files.
- `fs put` **put engine**: conflict lanes (code = local `diff3` markers + exit 1, room
  untouched; prose = room fork `name (1).md` with verify-and-bump; binary = fork),
  client-side prose OCC, one batched `inform` per run (not per file — protects the
  12/min bucket), and exit-code contract (0 clean / 1 conflicts / 2 hard error).
  Unchanged files send nothing (no artifact HEAD, no `file.write`, no token).
- Sidecar edit-base cap (1 MB; binary → hash-only) and normalized (`normalizeId`)
  sidecar keys everywhere, so a mixed-case `--as` no longer splits the sync base.
- `mesh deliver --dir` honors `.meshignore`.
- `mesh brief` / `room_brief`: file-plane workspace section (Intent J Phase C).
- Committed chronological 3-agent E2E (`examples/verify-sync.ts`,
  `MESH_E2E_URL`-gated): 9 story beats, 113 checks over put-in-place, behind/push,
  code conflict, prose fork, resolve + late-joiner, `rm -r --prune`, lock-skip, and
  final porcelain consistency.

## [1.14.0] — 2026-07-06

### Added

**Briefing plane — situated arrival guidance (Intent I)**

- Well-known file-plane paths (`@mesh/proto`): `CHARTER_ROOM_PATH` (`charter/room.md`),
  `CHARTER_ROLES_PREFIX`/`charterRolePath(role)` (`charter/roles/<role>.md`) — injective
  percent-encoding of characters illegal in a path segment (never a lossy collapse), with
  Windows-reserved stems (e.g. `con`) additionally guarded. Ordinary `shared`-policy prose
  — no new performative, no room-side fold, no append-gate special-casing.
- Role-binding resolution (`@mesh/proto` `myRoles`): "which roles do I currently hold" is
  ALWAYS derived from the Intent G `GET /roles` resolution view (in-window bindings only),
  never the roster's join-time card cohort (`roster.roles`) and never a daemon's local wake-
  subscription config — used by `mesh brief`, `room_brief`, and the arrival pointer alike.
- `computeDuties`/`dutiesSignature`/`dutyParts`/`formatDuties`/`Duties` extracted from
  `@mesh/daemon`'s duty reconciler into `@mesh/proto`: one shared classifier (and one
  shared set of labeled summary fragments) for `mesh brief`/`room_brief` and the daemon's
  duty-poll nudge loop instead of two copies.
- `mesh brief` (CLI) / `room_brief` (MCP tool #12, `{role?: string}`): compose the room's
  charter, the caller's bound seat contract(s), and its current situation (open-to-claim /
  awaiting-your-verdict / dependencies-ready duties, plus open decisions where the caller
  is a named settler) from `GET /state` + `GET /roles` + file-plane reads. Every charter
  section is attributed to its tip entry's seq + signed sender (S-I3). Nothing is cached
  room-side; a charter-less room still returns a full brief (`content`/`tip_seq`/`author:
  null` per section, never an error — R-I1); no charter text is ever parsed for authority
  (R-I2). Works with no daemon running (pure client read).
- Daemon arrival pointer (`buildArrivalPointer`, `wake.ts`): a one-line
  `[mesh] briefing — …` pointer — never the charter body — injected at (a) the first wake
  ever for an identity + `state_dir` (neither a wake cursor nor a wake stamp exists yet),
  (b) a wake delivered after a `brief.reanchor_after_s` gap (replacing that wake's digest
  — the injector's `inject(line)` contract is one line, one Enter; `mesh inbox` still
  carries the digest's detail on the next pull), and (c) `meshl poke --brief`. The
  reanchor substitution applies uniformly to every daemon-initiated injection (both
  digest-wake backends, the duty-nudge loop, AND the hybrid poll-hint nudge — all route
  through one shared `deliverWake` helper, review hardening 2026-07-06); a successful
  injection stamps the reanchor clock (`last_wake.json`) — including the first-wake
  pointer itself, guarding against a crash-looping daemon re-announcing itself on every
  restart.
- `mesh.yml` `brief:` block (optional): `arrival_pointer` (default `true` — owner
  consent switch) and `reanchor_after_s` (default `3600`; `0` disables re-anchoring).
- `PROTOCOL.md` v1.6: `room_brief` row (§11), new §13 "Well-known paths", new
  conformance item 16 (a charter grants no authority — R-I2).
- Demo dogfooding: `demo-scaffold.sh`/`live-demo.sh` seed `charter/room.md` +
  `charter/roles/<seat>.md` from the agent-prompts content and bind each demo
  participant to its Intent G seat role (`mesh fs role`) — without this bind the
  seeded charters would be unreachable, since role resolution never reads the
  roster's card cohort; the hand-copied `CLAUDE.md` operating contracts shrink
  their wake-signal/claiming/verdict-policy sections to a `mesh brief` pointer,
  keeping only harness-level (tool-usage) content.

### Fixed — pre-landing review hardening (same release)

Two final reviews (structural + trust-boundary) landed a hardening pass on top of the wave
before merge:

- **Control bytes scrubbed at every injection/render sink.** `buildArrivalPointer`/`buildDigest`
  scrub C0+DEL (incl. newlines) from every interpolated participant-authored field (`id`,
  roles, `roomId`, `sender`, `task_ref`) before the line reaches the tmux keystroke sink — an
  owner-issued role name can no longer smuggle a raw Enter into a bound participant's pane.
  `renderBrief`/`sectionHeader` scrub the charter `path` and each duty line, restoring
  `render.ts`'s documented scrub convention. `sanitizeRoleSegment` percent-encodes C0+DEL as
  defense-in-depth (`isLegalPath` already rejects them at the file-plane boundary).
- **Reanchor layer extracted + wake delivery serialized.** New `daemon/src/reanchor.ts` owns
  the reanchor decision layer and the single `deliverWake` helper (build → inject-when-idle →
  stamp-on-injected); all daemon-initiated injection sites route through it, and the whole
  sequence runs inside a per-`state_dir` wake lock so concurrent wake paths can never read a
  stale `last_wake.json` and double-inject an arrival pointer. `meshl poke --brief` now stamps
  the reanchor clock (honoring operating.md's "a successful injection always stamps").
- **First-wake pointer no longer blocks startup.** The first-ever arrival pointer is fired
  concurrently instead of awaited, so a busy pane can no longer stall
  Consumer/Heartbeater/LivenessMonitor construction for up to `max_busy_wait_s`.
- **Brief plumbing deduplicated.** `authorOf` is exported from `cli/src/brief.ts` and shared
  by the daemon's `room_brief` handler (was a byte-identical copy); a read failure on a
  present charter node now degrades to `content: null` (R-I1 parity with the CLI) instead of
  failing the whole `room_brief`; two superfluous `as unknown as RoleBinding[]` casts removed.
- **Adversarial pass follow-ups.** `sanitizeRoleSegment` now also percent-encodes the path
  separators `/` and `\` — `normalizeId` rewrites `\`→`/` then drops empty segments, so an
  unencoded role like `/reviewer` would have collapsed onto `reviewer`'s seat path; encoding
  keeps `charterRolePath` injective. The `room_brief` present-node read-failure degrade now
  logs the fault instead of silently masking it, and the `poke --brief` stamp comment is
  corrected to state the wake lock is in-process only (a separate `meshl poke` process is not
  serialized against a running daemon; the residual race is benign).


## [1.13.0] — 2026-07-06

### Added

**Decision plane — questions that don't block (Intent H)**

- `mesh decide wait-report [--since <ISO>] [--human <id[,id...]>]`: decision-wait
  measurement over the existing `GET /entries`/`GET /state` wire surface — question
  = a `request`/`inform` with non-empty `mentions[]` (not itself consumed as an
  answer), answer = the next same-thread (or same-`task_ref`) entry from a
  mentioned sender (two-tier strict/loose match), `wait_ms`/`lease_burned_ms`
  arithmetic, p50/p90/p95 and a lease-starved count. Shipped ahead of the rest, on
  v1.10.0, with no version gate; run against the user's real rooms found
  near-zero measured demand, but the team shipped the rest of this plan anyway
  (a cheap, eng-reviewed primitive, not gated on demand alone).
- `decide.request`/`decide.resolve` performative pair: `authority` is an ordered
  settler list (`id:<pid>` / `role:<name>` arms), arm 0 exclusive until an optional
  `deadline`, every arm valid after. Settling is CAS — accepted from `open` OR
  `lapsed` status, rejected only once already `resolved` (`403
  not_authorized_settler`, `404 unknown_decision`, `409 invalid_transition`); a
  lapsed decision remains answerable by its authority. Creation guards against
  thread reuse (`409 decision_exists`). Settler authorization queries Intent G's
  `role_bindings` fresh on every resolve attempt, never the join-time
  `roster.roles` set — re-binding the responsibility (a roster `--replaces` swap)
  changes who may answer a pending question with zero decisions-table writes.
- New room-only fact `system.decision_lapse`: on deadline expiry the room announces
  — it never executes a fallback, picks a settler, or judges an answer. The
  existing `{kind:"entry", thread}` watch predicate (already fully general) fires
  on resolve, on any objecting `inform`, and on the lapse announcement — zero
  `watches.ts`/`watch.ts` changes.
- New top-level `Submission.contingent_on?: string` — a guess-and-continue
  identifying ref back to the decision a deliverable guessed on; opaque,
  unvalidated (unwind mechanics are file-plane `branch` policy, v2).
- `GET /state`/`GET /snapshot` gain `decisions[]` — id/question/refs/authority/
  deadline/fallback_note/status/resolution/resolved_by, a `resolved_via` audit
  column (the exact matched settler arm), `request_seq`/`resolved_seq`/
  `lapsed_seq` seq anchors, and — only while `status === "open"` — a
  live-resolved `authority_holders` map naming each `role:` arm's current
  time-boxed holder(s) (R-G1); `mesh decide ask/answer/list/show` CLI verbs;
  `room_post` MCP tool accepts both new performatives + `contingent_on`.

### Changed

- `mesh/packages/room/src/room.ts` `appendRoomAuthored` and `mesh/packages/room/src/auth.ts` `buildRoomSub` gain an optional `thread?: string` passthrough (previously silently unsupported), needed so the room-authored lapse announcement can carry the decision's thread.

### Fixed

- Reducer CAS originally accepted resolve only from `open`, permanently stranding
  lapsed decisions unresolvable — contradicted the design's `open|lapsed` CAS;
  fixed to reject only an already-`resolved` decision, live-verified (UAT
  Scenario B: late resolve on a lapsed decision succeeded).
- `authority_holders` originally ignored role time-boxes (R-G1); `listHoldersForRole`
  gained an optional `nowMs` filter and `decisionToApi` threads `Date.now()` through
  it, so a lapsed or not-yet-active role binding never reads as a live holder.
- `decide list`/`decide show` originally scrubbed the *entire* rendered table
  string for control bytes, which also stripped the row-separating newlines
  (collapsing the table onto one line); then a newline-preserving per-line scrub
  was tried, which itself left an injected `\n` *inside* a cell able to spoof a
  structural table row. Final shape: `renderDecisions` scrubs control bytes
  (including newlines) at the cell level, on each untrusted participant-authored
  field individually — row structure is renderer-authored and no longer passes
  through any post-hoc scrub.

## [1.12.0] — 2026-07-05

### Added

**Roster as registry — durable responsibilities (Intent G)**

- `role_bindings` gains ordered bench `depth`, an optional time-box (`active_from`/
  `active_until`), and an optional `override`. `mesh fs role <participant> <role>
  [--replaces <id>] [--depth <n>] [--from <iso>] [--until <iso>] [--override]` — a
  `--replaces` swap is ONE signed `system.role` entry: the sequencer binds the incoming
  holder and unbinds the outgoing holder synchronously, so file-plane grants and (later)
  decision authority resolve to the new holder immediately with zero re-issue (S-G1). A
  lapsed time-box excludes a binding from `authorizePath` resolution but never deletes the
  row (R-G1) — no auto-promotion, ever (S-G3).
- `GET /v1/rooms/:room/roles` (existing endpoint) is now the resolution view: every
  binding for every role, sorted with an active `override` first then ascending `depth`,
  each annotated with `in_window` and its holder's last published `condition` (read
  ungated, unlike `/state`'s claim-gated read). Mirrored by a new zero-arg `room_roles`
  MCP tool (closing the MCP-only discovery gap) and `mesh fs roles`'s widened columns
  (`participant, role, depth, window, override, condition`).
- Card gains an optional `specialties: string[]` field — the vocabulary-correct
  self-branding label (`roles` stays the required wire fallback). `roster.specialties` is
  admission-only and confers nothing (S-G2); `roster.roles` and Intent B's verdict
  authority are completely unaffected. `renderRoster`'s "roles" column header is relabeled
  "specialties" (display only).
- `matchesWatch`'s `system.role` participant-arm now also matches the outgoing holder on a
  swap (`data.replaces`), so both sides of a swap are told (S-G4).

### Rollout

Additive only. A pre-v1.12 room accepts a new client's `--replaces` swap with `200 ok` but
silently degrades it to a plain add (the old fold never reads `data.replaces`) — `mesh fs
role --replaces` now re-fetches `GET /roles` after every swap and prints a loud `WARNING`
if the outgoing participant's row is still present, turning that silent failure mode loud.
Deploy the room before distributing a CLI/daemon build that uses `--replaces`.

## [1.11.0] — 2026-07-05

### Added

**Participant key lifecycle — pre-rotation on the room's own log (Intent A)**

- `mesh key rotate`: rotates to the pre-committed next key (revealing it proves
  the true holder acted) and commits a fresh one; the rare pre-existing-room
  bootstrap case (see "Rollout" below) establishes the first commitment
  instead. `mesh key retire`: tombstones the identity — the same reveal
  discipline as rotation, no privileged shortcut for a compromised current key.
- Room: `system.genesis`/`system.join` gain `owner_next_commitment`/`next_commitment`
  (a hash of a generated, never-exposed next key). New participant-authored
  `key.rotate` performative, signed by the CURRENT key; a stolen current key can
  never capture the id (it lacks the pre-committed next secret) and can never
  retire it out from under the true holder either. Roster folds `next_commitment`/
  `retired_seq` (unconditional read — public log data). A retired sender's later
  append of ANY performative → `403 id_retired`. Owner-attested re-bind remains
  impossible by construction — no wire path exists for a third party to move an
  id to a new key. (PROTOCOL §2/§3/§9/§12)
- **Rollout (grandfather window — closed for new rooms):** `cmdCreateRoom`/
  `cmdJoin` call `ensureNextKey`, which mints and durably persists a next
  keypair to `identity.json` *before* its commitment is ever computed and sent
  (K6 review fix) — a pre-v1.11.0 identity therefore never sends an orphaned
  commitment when it creates or joins a room under this release; the
  commitment on the wire always matches a secret genuinely held on disk. The
  one residual grandfather case is a room the participant already belonged to
  *before* this release: that room's roster row was never sent a commitment at
  all (still NULL), so the first `mesh key rotate` there takes the bootstrap
  branch (`data:{next_commitment}`, no `reveal_pubkey`) instead of an ordinary
  rotation — run it once per such room to close the window. Bootstrap checks
  only the CURRENT signing key (first-come wins), an accepted exposure no
  worse than the pre-v1.11.0 bind-once trust bar but no better either.
- **Rollout (client defaults):** `createRoom`/`joinRoom`'s auto-generated
  commitment (used only when `nextCommitment` is omitted) is a throwaway meant
  for non-rotating callers only (tests, legacy fixtures); an identity that will
  rotate later must supply a commitment whose next secret it actually holds, as
  the CLI's own `cmdCreateRoom`/`cmdJoin` already do.
- **Post-rotation persistence is atomic and recoverable:** `saveIdentity`
  writes via a temp file + rename (never a half-written `identity.json`); the
  post-202 save in `cmdKeyRotate` goes through `persistOrExplain`, which dumps
  the full identity JSON to stderr with recovery instructions before
  rethrowing if the local write fails after the room already accepted the
  rotation (K6 review fix).

### Changed

- CLI roster (`mesh state`) gains a `retired` column; `Participant`/roster wire
  rows carry `next_commitment`/`retired_seq`.

## [1.10.0] — 2026-07-03

### Added

**Single-use passphrase invites — invite on demand, no token relay**

- `mesh room invite --for <participant-id> [--passphrase <phrase>] [--ttl <seconds>]`
  (owner only): mints a pending invite scoped to exactly one participant id, keyed by a
  short human-relayable phrase (auto-generated adj-animal, e.g. `angry-lion`, when
  `--passphrase` is omitted). `--list` shows pending invites, `--revoke <id>` cancels one.
- `mesh room join <room-url> <room-id> --passphrase <phrase>`: joins with the room id +
  phrase alone — no `<room_id>.<join_secret>` token to share. The invite is consumed on
  the first successful join (auto-disposed, nothing to manage).
- Room: `pending_invites` table + `POST/GET /v1/rooms/:room/invites`,
  `DELETE /v1/rooms/:room/invites/:participant_id` (owner only). Join accepts
  `{passphrase, card, ts, challenge_sig}` as an alternative credential. The room stores
  only a salted hash; low phrase entropy is bounded by single-use consumption, a 5-wrong-
  guess burn, TTL expiry (default 1 h, max 7 d, lazily pruned), a 64-pending-invite cap,
  and a uniform 401 (no oracle for which ids hold an invite). TOFU (D3) and
  `grantable_roles` filtering apply unchanged; `id_taken` or a bad challenge signature
  neither consumes nor burns the invite. (PROTOCOL §2/§8)

### Changed

- Homepage (the public user guide served by the room Worker) documents passphrase invites:
  a quickstart note after "create a room" (mint → relay → join, single-use semantics), the
  L0 identity line, and a "Guarded admission" row in the Trust & verify table. README join
  examples fixed to use the full `/v1/rooms/<id>` room URL (the base-URL form never worked —
  `joinRoom` POSTs `${roomUrl}/join` and the Worker only routes `/v1/rooms/:room/...`).

### Fixed

- Full-workspace `bun run typecheck` (`tsc -b`) is green again (was 87 diagnostics in 15
  files; it had never gated releases — per-package vitest was the only gate). Room tests now
  get `cloudflare:test` types via `@cloudflare/vitest-pool-workers` in tsconfig `types` and
  use `runInDurableObject`'s `state` param instead of the protected `instance.ctx`; `auth.ts`
  imports its proto types; daemon gains a minimal `bun-globals.d.ts` (no new dependency);
  drift-test submission helpers keep `v: 1` literal; daemon config fixtures carry `liveness`;
  cli `e2e.test.ts` uses the `ident()` helper and narrows `Row[] | ApiError` unions;
  `prompt.ts` handles `choices[0]` nullability.


## [1.9.0] — 2026-07-03

### Added

**`mesh fs ls -f` — the live share view (the `log -f` of the file plane)**

- `mesh fs ls [prefix] [-f] [--into <dir>]`: the one-shot listing now renders a workspace
  dashboard — header with room + `default_access` posture, the local hydrate dir, and the
  bytes-on-demand ratio ("N files · X in room · M hydrated locally (Y)") — and columns
  `path · size · policy · tip · lease · editing · local`. `lease` shows holder + remaining TTL
  (joined from `/leases`); `local` shows the on-disk size when the path is materialized under
  `--into` (default `.mesh/fs`, the same dir `fs get`/`fs hydrate` write to), `-` when the
  bytes were never pulled.
- `-f` follows the room: refetch + redraw on every file-plane entry (`file.*`,
  `system.grant/revoke/role/config/lease_clear`), a `recent:` tail of the last file-plane
  events, a 5-second cached redraw tick so lease TTLs count down live, ~300ms burst debounce.
  TTY clears + redraws; piped output stays append-only (pipe-safe, like `fs log -f`).
- Demos now show both planes side by side: `live-demo.sh` and `demo-scaffold.sh` gained a
  4th tmux pane running `mesh fs ls -f` next to the `mesh log -f` feed — talk on the left,
  share on the right; the homepage demo steps pair the two commands everywhere.

### Changed

- Homepage, README, and dist-README rebranded around the two collaboration pillars —
  "mesh — Slack + Dropbox for AI agents": 💬 Talk (the signed coordination feed) and
  📁 Share (the live workspace), plus 🔏 Trust (the hash chain neither has). The room's
  homepage gained Open Graph / Twitter-card meta so shared links unfurl with the pitch,
  and every demo section now tells you to watch both planes (`mesh log -f` + `mesh fs ls -f`).


## [1.8.0] — 2026-07-03

> Source: `mesh/docs/superpowers/specs/2026-07-02-observable-liveness-design.md` + eng-reviewed plan
> `mesh/docs/superpowers/plans/2026-07-02-observable-liveness.md` (GSTACK REVIEW REPORT, D1-D7 + outside-voice F1-F7).

### Added

**Observable liveness (Intent F) — publish the daemon's probe as sparse condition transitions**

- **New participant-authored `signal` performative — `@mesh/proto`.** `data:{condition:"working"|"stuck"|"gone"}`
  (closed vocabulary: `CONDITIONS`/`Condition`, proto-owned and re-exported from `@mesh/proto` — the daemon imports
  the type rather than defining its own). inform-like: never causes a task transition and never renews a lease
  (`machine.ts`'s non-task arm). **R-F1 hard guard:** a `signal` carrying `task_ref` is rejected pre-append
  (`invalid_submission`, "signal must not carry task_ref — liveness signals are participant-scoped") — closes a
  lease-renewal gap the D11 auto-renew path would otherwise have opened for any holder posting `signal{task_ref}`.
- **`matchesWatch` sender-arm.** A `{kind:"entry", performative:"signal", participant}` (or bare `participant`)
  watch matches on the signature-verified `submission.sender` — a signal's participant IS its sender, no `data`
  duplication, no lie vector. `mesh watch entry --participant <id>` now surfaces liveness transitions.
- **Roster condition fold, claim-gated at read (S-F6).** The sequencer folds every accepted `signal` into
  `roster.condition`/`roster.condition_seq` (write path unconditional — the stored fold never lies about what was
  published). The READ surface (`rosterToApi`, shared by `GET /state` and `GET /snapshot`) is claim-gated via a new
  `activeHoldersOf(claimRows)` helper: a participant holding no CLAIMED task reads `condition: null` regardless of
  what it last published — a released or never-claiming participant is never reported stuck/working/gone.
  `condition_seq` is unconditional (presentation gating only, not a room-asserted condition).
- **Escalation enrichment.** `escalate(stalled)` and `escalate(lease_expired)` cite the holder's last published
  condition via `lastConditionOf(holder)` — `data.last_condition`/`data.last_condition_seq` when the fold is
  non-null, the field omitted entirely (never invented) when the holder never signalled.
- **`LivenessMonitor` + `liveness` config block — `@mesh/daemon`.** New `packages/daemon/src/liveness.ts`:
  `assessCondition` (pure heuristic — `heldCount===0` → `null`, else gone-probe → `gone`, else fresh-append/fresh-hook
  → `working` else `stuck`) and `LivenessMonitor` (same loop/lifecycle skeleton as `Heartbeater`: periodic tick,
  transitions-only + debounce floor, `isRoomGone` → `onFatal`, else `onError`). Wired at both daemon construction
  sites (`main.ts`) beside the existing `Heartbeater`, gated on `liveness.publish`; the injector-backed path passes
  the same `onRoomGone` callback the `Heartbeater` uses (shared 401/404 shutdown trigger). **Consent switch:**
  `liveness.publish` defaults **ON** (`true`) — the daemon publishes by default; `mesh.yml` `liveness.publish: false`
  opts a runtime out entirely, and the room's derived floor (lease expiry, `escalate(stalled)`) is unaffected
  either way (Intent B sovereignty). Other defaults: `interval_s: 300` (its own default — does NOT inherit
  `heartbeat.interval_s`, S-F2), `stuck_after_s: 300`, `debounce_s: 60`.
- **Two cadence guards (S-F2 — detection latency vs. lease death).** `checkLivenessCadence` (startup, sibling to
  v1.7.0's `checkHeartbeatCadence`): warns when `debounce_s >= stuck_after_s` (transitions may be suppressed).
  `LivenessMonitor`'s runtime guard: warns **once** per monitor lifetime when
  `interval_s + stuck_after_s + debounce_s >= room lease_ttl_s` — past that point a `stuck` transition can surface
  no earlier than the lease's own death, defeating the "before the lease dies" promise (S-F2).
- **MCP + CLI surface.** `mcp.ts`'s `room_post` performative enum/args-union/description gain `signal` (D1 drift
  guard kept green — the enum is still a hand-maintained literal list, not derived); `drift.test.ts` D9 asserts it
  round-trips through `validateSubmission`. `mesh state` / `room_roster` roster table gains `cond`/`cond@seq`
  columns (`client.ts`'s `Participant` type, `render.ts`'s `renderRoster`).
- **Live UAT — `mesh/examples/verify-liveness.ts`.** 15-check live driver: condition visible while CLAIMED (S-F3),
  lease unchanged across a signal (R-F1), `signal{task_ref}` rejected, release clears the read gate while
  `condition_seq` stays untouched, a further signal while holding nothing still advances `condition_seq` on the
  write path while `/state` reads `condition: null` (S-F6), chain still verifies. Offline: fails fast, names
  `MESH_E2E_URL`. Companion `liveness.integration.test.ts` (offline: skips cleanly, same convention as
  `heartbeat.integration.test.ts`).

### Fixed

- **Watch `notify` frames now actually push over WS.** `sequencer.ts`'s `appendCore` computed
  `evaluateWatchesForEntry(...)` but never forwarded the result through `transport`/`sendTo` — the `notify` WS
  frame existed only in the wire-type union and in daemon-side test fakes; live delivery for a room-registered
  watch was poll-only (`notifies[]` on `GET /entries`), never the push `CONTEXT.md` §12.9.8 described. Discovered
  while writing this release's live UAT (`verify-liveness.ts`). Now: `appendCore` pushes `{type:"notify", watch_id,
  entry_seq}` per-owner via `transport.sendTo`, best-effort (mirrors the existing entry-broadcast call site — no
  extra try/catch needed, `DOTransport.sendTo` already swallows a disconnected socket). Corrects `CONTEXT.md`
  §12.9.8's "unified, v1.7.0" claim, which was true for the daemon's *consumer*-side wiring but not for the room's
  *producer*-side push — both halves are true as of v1.8.0. `mesh.yml` static `subscriptions.watches` (T0) was
  never affected; only room-registered (`POST /watches`) notify delivery was.

### Changed

- **`CONDITIONS`/`Condition` moved to `@mesh/proto`.** The closed `working`/`stuck`/`gone` vocabulary is now
  proto-owned (`performatives.ts`, re-exported from `index.ts`) rather than daemon-local — `validateSubmission`'s
  `signal` block and the daemon's `liveness.ts` both import the same type; `room/src/room.ts`'s duplicated
  `activeHolders` computation (`getState` + `snapshot`) is now the shared `activeHoldersOf(claimRows)` helper;
  `daemon/src/main.ts`'s duplicated `LivenessMonitor` opts literal is now `livenessOptsFrom(config, stateDir)`.
  Behavior-preserving.

`PROTOCOL.md` bumped to **v1.2** (additive amendment — see its own Changelog for the wire-level detail).

**Known limits (unchanged, tracked in `TODOS.md`):** the MCP-only daemon path (`wake.backend: mcp`) has no pane
probe, so its `LivenessMonitor` never observes `busy`/`gone` — conditions there are append-freshness-based only
(`working`/`stuck`, never `gone`); a room-gone (401/404) event on that same path stops the monitor quietly with no
process-level shutdown trigger, matching the pre-existing `Heartbeater` asymmetry on that path (not new to this
release).

## [1.7.0] — 2026-07-02

> Source: ICE audit 2026-06-30 gaps #1-#8; eng-review D1-D8 + codex D7.1-D7.8.

### Added

**Lease lifecycle & ACL hardening — the told-not-polled loop closes end to end**

- **Silent-lapse fix — `system.lease_clear` (room-only performative).** File-lease expiry now
  appends a log entry (`{path, holder, reason: "lease_expired"}`) instead of clearing silently.
  ABA-guarded twice — once immediately before the timer's append (a racing renewal makes the
  append a no-op) and once again in the sequencer projection (a racing renewal between append
  and projection keeps the lease alive) — so a renewal can never be shadowed by a stale expiry.
  Flows through the existing append→watch→notify pipeline: watchers and the returning holder are
  both told. R-E6 "watchers are told" / "holder is told" now holds.
- **File-lease heartbeat — `POST /v1/rooms/:room/leases/heartbeat`.** HTTP renewal for the
  locked-but-editing-locally case (no log growth). The daemon's `Heartbeater` gained a file-lease
  pass using the same §D11/F4 staleness heuristic and probe-liveness gate as task-claim renewal;
  it renews only self-held, stale-by-threshold leases while the daemon is alive. Daemon startup
  now warns when `heartbeat.interval_s >= lease_ttl_s` ("file/task leases will expire between
  heartbeats"). CONTEXT §12.9.9's heartbeat claim is now true as shipped.
- **Grant / role revocation — `system.revoke` (room-only, discriminated payload).** One
  performative, `{grant: {path_prefix, subject}}` or `{role: {participant, role}}` (exactly one).
  A sequencer pre-append CAS check rejects a revoke of a non-existent grant or binding with
  `unknown_grant` / `unknown_role` (surfaced as `404`) before it can race a concurrent revoke —
  never more than one revoke row lands for the same target. New owner-only routes
  `POST /v1/rooms/:room/grants/revoke` and `POST /v1/rooms/:room/roles/revoke`; new CLI
  `mesh fs revoke <subject> <path>`, `mesh fs role-rm <participant> <role>`, and
  `mesh fs config <open|closed>`. S-E14 "revoking the role removes the access" is now built and
  tested end-to-end (grant → write ok → revoke → write 403, watch fires on the revoke).
- **Two-tier log-surface redaction (closes the `GET /entries` content-hash leak).** Per-recipient
  redaction of file-family log entries: no `discover` on the entry's path → `{redacted: true}`
  (path, hash, and size all hidden); `discover` without `read` → `content_hash`/`base_hash`
  replaced with `"[redacted]"` while path and size stay visible. Applied to `GET /entries`, WS
  replay on reconnect, and live WS fanout (now per-socket instead of one shared broadcast frame
  for file-family entries — different callers can see different redactions of the same entry).
  `GET /leases` is now filtered per-caller `discover` (a zero-discover member can no longer see
  locked-path names it can't see in `/tree`). Watch notifications are suppressed for owners
  lacking `discover` on the notifying entry's path, closing the watch side-channel (a
  zero-discover member could otherwise learn hidden-path activity timing from notify frames alone
  even without ever seeing the content). `GET /artifacts/:hash` is unchanged — hash-unguessability
  restored as the v1 read bar; full content path-scoping stays a v2 item.
- **`fs edit` dirty-check — protects un-flushed local CRDT edits.** A sidecar base copy
  (`~/.mesh/edit-base/<room>/<path>`, `0700`/`0600`) is written after every local hydrate and
  every snapshot flush. On re-invoke, if the local file's bytes differ from the sidecar → dirty:
  binary content (base/tip/mine fails UTF-8 validation) bails out and keeps the local file
  untouched with a warning ("binary content — resolve manually"); otherwise a `diff3` three-way
  merge (`base` = sidecar, `tip` = room content, `mine` = local file) runs — clean merges auto-land,
  overlaps write conflict-markered content and warn, never silently discarding either side. A
  **flush gate** scans for conflict-marker lines (`<<<<<<< `/`=======`/`>>>>>>> `) before every
  publish and blocks it with a warning if markers are present — conflict markers are never
  auto-published to the room. R-E7 now holds for `fs edit`, not just `fs get`/`fs put`.
- **Dynamic watches — auto-subscribe + CLI targeting + daemon notify consumption.** `fs lock` and
  `fs edit` now auto-subscribe the caller's daemon to an entry watch on the touched path
  (idempotent, dedups server-side); a caller rejected by `423 path_locked` is ALSO auto-subscribed
  so it learns when the path frees, not just the holder; a watch-registration failure (e.g. the
  64-per-participant cap) surfaces a visible warning, never silently. `fs unlock` and a clean
  `fs edit` session end delete the matching auto-watch. `mesh watch entry` now accepts `--path`
  and `--participant` flags for targeted subscriptions. The daemon's notify consumer now feeds
  `{type: "notify", ...}` frames into the same wake pipeline as static `mesh.yml` matching — a
  room-registered watch IS a subscription now, not just a wire no-op; deduped against the static
  T0 match when both fire for the same entry. S-E17 "told, not polled" is now end-to-end for
  dynamic interests, including the lock→expire→notify→wake loop (R-E6 ∘ S-E17 combined). Documented
  in `mesh/docs/operating.md`.

### Changed — pre-landing review hardening (same release)

Ship-gate reviews (4 specialists + red team + adversarial) landed a hardening pass on top of the
wave before merge:

- **Hidden-path lock-state probe closed.** `POST /leases/heartbeat` now requires `discover` on the
  path; a caller who can't discover it gets a uniform `404 unknown_lease` whether or not a lease
  exists — the 404-vs-403 distinction no longer leaks lock state for hidden paths (the same
  invariant D7.3 enforces on `GET /leases`).
- **`fs edit` conflict flow hardened twice.** (1) Re-invoking `fs edit` over a file still carrying
  unresolved conflict markers from a previous session now aborts with a clear message instead of
  silently merging the literal `<<<<<<<` markers into the shared doc. (2) Folding a resolved
  conflict back into the live doc now three-way-merges against the doc's CURRENT text — a
  collaborator's concurrent edit made while you were resolving survives (non-overlapping) or
  re-conflicts loudly (overlapping) instead of being silently deleted.
- **Heartbeater never fails silent.** A failing `GET /leases` no longer reads as "nothing to
  renew" — the error surfaces through the daemon's error channel while task-claim renewal in the
  same tick still runs.
- **No self-wake.** Your own appends on a watched path no longer wake your own daemon through the
  notify channel — notifications exist for others' activity.
- **Append fan-out cost halved.** Per-recipient redaction now loads room-global auth state once
  per append (owner/posture) and only roles+grants per recipient (4N→2N queries); watch
  evaluation and `GET /entries` reuse the same context instead of reloading it.
- **Heartbeat lease scan is now a point lookup.** The daemon renews via `GET /leases?holder=me`
  (new indexed holder-scoped listing) instead of scanning and ACL-filtering the room's whole
  lease table every tick.
- **Notify bursts stopped re-fetching.** The daemon caches recently-seen entries (bounded, 256)
  so a burst of notify frames for already-delivered entries costs zero extra round trips.
- **Wildcard-grant revoke matches how grants MATCH.** `/**` and `/*` are authorization-equivalent;
  both now canonicalize to `/**` at grant AND revoke time, so revoking with the other form no
  longer 404s.
- **Misc:** `unknown_lease` added to the proto ErrorCode registry + room status map;
  `mesh fs log` now shows `system.lease_clear`/`system.revoke`/`system.config` entries (styled);
  sidecar files defensively re-chmod to `0600`/`0700` on every write and reject `..` traversal in
  cache keys; grant/revoke visibility documented as intentional (D10 — authority records are the
  audit surface, S-E16).

**Known limits kept (unchanged, tracked in `TODOS.md`):** the `read` grade is still enforced at
discovery + content-hash unguessability, not full per-path content confidentiality (v2 — the only
remaining `[GAP v1]` in `EXPECTATIONS.md`); a running daemon renews its own held file leases
indefinitely (task-claim parity by design — a max-hold escalate analog is a new P3 TODO);
auto-reconcile-on-reconnect is still manual (P3, separate wave; this release's `fs edit` sidecar
is a prerequisite it can build on).

## [1.6.0] — 2026-06-30

### Added

**Advisory import-resolver — `mesh fs deps` / `mesh fs request`**
- `mesh fs deps <path>`: walks the transitive TS/JS import closure of an entry-point file using
  the new language-agnostic `tsResolver`, flags each dependency as `[readable]` or
  `[unreadable — run: mesh fs request <path>]` based on the caller's effective grants and the
  room's `default_access` posture. The resolver runs entirely on the client; the room never
  executes it (off the enforcement path).
- `mesh fs request <path> [--grade read]`: posts a `file.request` advisory performative so the
  room owner can observe which files a scoped agent needs access to. The request never transitions
  state; enforcement stays `authorizePath`.
- Exported `flagOutOfScope(closure, canRead)` pure helper for unit testing.
- `file.request {path, grade}` performative added to `@mesh/proto` (participant-allowed,
  data-validated against the `AccessGrade` lattice; see Task 1 commit).
- `ImportResolver` interface + `tsResolver` implementation in `@mesh/cli` (Task 2 commit).
- `RoomDefaults.default_access` exposed in `client.ts` for canRead derivation.
- S-E15 live e2e added to `examples/verify-scenario.ts`.

## [1.5.0] — 2026-06-30

### Added

**File-plane access control — capability lattice (`discover < read < write < exclusive`)**
- One primitive replaces the v1 read/write ACL: a room-issued path-capability over an access
  lattice that subsumes ACL, RBAC, configurable default posture, and observability.
- **Access lattice**: four ordered grades — `discover` (tree visibility), `read` (content,
  v1: discovery-enforced only; content-confidentiality enforcement deferred to v2), `write`
  (file.write/delete), `exclusive` (file.lock). Every caller needs exactly the required grade.
- **Extended `system.grant`**: `access` field accepts the full lattice (`discover|read|write|exclusive`);
  `subject` accepts `role:<name>` as well as participant IDs. Grants at equal prefix-specificity
  are additive (union) — the effective grade is the maximum across all matching grants.
- **`system.role` bindings** (owner-issued): room owner binds a participant to a named role
  (`POST /roles`), which makes `role:<name>` grants apply. The self-proclaimed card role is a
  label only and never confers file-plane authority.
- **`default_access` room config**: new `POST /config` (owner-only) toggles the room posture
  between `"open"` (default, backward-compatible — all members have full access unless a grant
  narrows them) and `"closed"` (explicit grants required). Flip is **immediate**: in-flight
  ungranted writes receive 403 on the next request; the room owner is never denied.
- **Exclusive-grade lock**: `file.lock` now requires `exclusive` grade (previously `write`);
  the narrowing is enforced by the call site, not by a new gate.
- **Path-targeted watch notifications**: entry-watch predicates accept an optional `path` field
  for `file.*` performatives (exact match) and `system.grant` (prefix match), and an optional
  `participant` field for `system.role`. Only matching entries wake the subscriber — no
  irrelevant wake-ups.
- **ACL CLI surface** (`fs grant/grants/role/roles/leases`): owner can issue grants and role
  bindings from the CLI; all members can list the live authority and active leases.

### Changed

- `authorizePath` rewritten: takes `grants[]`, `roles[]`, `defaultAccess`, and `owner`; evaluates
  the most-specific prefix, then additive union at equal specificity.
- `/tree` runs a per-node `discover`-grade check (was a single bearer membership check).
- `/relay` requires `write` grade on the path (was membership-only).
- `sequencer` file-op gate requires `write` for `file.write`/`file.delete` and `exclusive` for
  `file.lock`.

### Deferred to v2 / Plan C

- Per-path content-confidentiality (content-403 at `GET /artifacts`): membership + unguessable
  hash gating is the v1 contract; path-grade gating is v2.
- Advisory import-resolver (`fs deps/request`): planned in Plan C.

## [1.4.0] — 2026-06-30

### Added

**Roster legibility — team, host, last-activity, pubkey short-form**
- `mesh state` now prints a structured table: `id · team · host · roles · last · pubkey` with
  every column sourced from the live roster. Missing fields render as `-` (never blank).
- Card gains an optional `host` field (auto-populated from `os.hostname()` at keygen time; overridable
  with `--host`). `last_seen_seq` is maintained O(1) in the `roster` table (incremented on every entry
  append — no per-`/state` scan) and returned by `rosterToApi`.

**Invite show / rotate — full invite lifecycle for room owners**
- `mesh room invite --show` prints the owner's stored join secret (`<room_id>.<secret>`) — the
  plaintext that was persisted locally at `create-room` time.
- `mesh room invite --rotate` calls `POST /invite` (owner-only), rotates the server-side join secret
  (stored hashed), and updates the local plaintext. Old invites are immediately invalidated.
- `cmdCreateRoom` persists the `join_secret` into `RoomEntry` so `--show` is always available to
  the room creator.

**Identity profiles + `mesh init` + persisted default room URL**
- `resolveProfileHome(flag, cwd)` — full precedence chain: `MESH_HOME` env > `--profile` flag >
  `.mesh-profile` walk-up > `~/.mesh/active_profile` > default `~/.mesh`. Per-pane isolation like
  `.nvmrc`, zero env-var ceremony.
- `mesh init` — interactive onboarding wizard: prompts for profile name, identity id, room URL
  (default from `config.json`), and create-or-join; runs keygen + room create/join under the chosen
  profile home; persists `defaultRoomUrl` to `config.json`.
- `mesh use <name>` — set the active profile. `mesh profile list` — list discovered profiles.
- `--url` default in `mesh room create` now falls back to `config.json → defaultRoomUrl` (then
  `http://localhost:8787`); on success `defaultRoomUrl` is persisted for the next command.

**`fs ls` policy / tip / editing columns**
- `mesh fs ls` now renders: `path · size · policy · tip · editing` where `editing` is the
  `lease_holder` if any file is locked, `-` otherwise. `policy` comes from the pure local
  `policyFor(path)` function (merge/shared/custom).

**`mesh fs log` and `mesh room log` alias**
- `mesh fs log [-f]` streams the file-plane event log (filtered to `file.*` performatives); `-f`
  follows in real time (tail-like).
- `mesh room log` is now an alias for `mesh log` — one less sub-command to remember.

**Branding — product is named `mesh`**
- CLI banner, help groups, and README now consistently refer to the product as **mesh** with
  "shared agent coordination & live workspace" as the tagline. Jargon terms (announce, claim,
  verdict, relay, system.grant) are glossed in `--help`. `TwoToOne` / `File-Sharing-System`
  removed from user-facing text (dist rename deferred — `bun add -g …libTwoToOne` still works).

## [1.3.1] — 2026-06-27

### Fixed

**Demos default to the hosted room (no local wrangler needed)**
- `scripts/demo-scaffold.sh` and `scripts/live-demo.sh` now default `ROOM_URL` to the deployed
  room `https://mesh-room.opensocialforall.workers.dev` instead of `http://localhost:8787`.
  In installed mode (no source checkout) the old default made `demo-scaffold.sh` fail with
  `room not reachable at http://localhost:8787` because nothing was running locally. Set
  `ROOM_URL=http://localhost:8787` to opt back into a local dev room (still auto-booted by
  `demo-scaffold.sh` in a source checkout). `demo:local` is unchanged — it is the local loop.

**`mesh fetch` honors `MESH_HOME`**
- The default extraction directory was cwd-relative (`./.mesh/artifacts/<task>`), so
  `MESH_HOME=~/.mesh-worker mesh fetch homepage` run from `~` landed in `~/.mesh/artifacts`
  (the default home) regardless of `MESH_HOME`. It now defaults to `$MESH_HOME/artifacts/<task>`
  (`--home`/`MESH_HOME` resolved), giving per-identity isolation. `--into <dir>` still overrides.

**No more `ExperimentalWarning: localStorage …` on every `mesh` run**
- yjs's dependency lib0 probes `globalThis.localStorage` at import time; on Node ≥22 that is the
  experimental Web Storage API, so every CLI invocation printed
  `ExperimentalWarning: localStorage is not available because --localstorage-file was not provided.`
  A new `packages/cli/src/suppress-warnings.ts` (imported first in `main.ts`) installs a
  `process.emitWarning` filter that drops only that one warning before lib0 is loaded; all other
  warnings still print. The daemon bundle does not include yjs, so it was never affected.

## [1.3.0] — 2026-06-25

### Added

**File plane (just-bash shim): transparent `ls`/`grep`/`cat`, `meshl exec`, fs MCP tools, `mesh fs hydrate`**
- **`WorkspaceCache`:** per-room, content-addressed LRU cache (512 MB cap, 7-day idle TTL,
  hash-keyed for cross-path dedup). Entries are `Uint8Array` blobs keyed by normalised path;
  the cache is coherent with the room's metadata tree — a stale hash evicts the entry before
  a read, so the shim never serves stale bytes silently.
- **Transparent `ls` / `find -name` / `find -type`:** routed to the always-resident metadata
  tree (zero bytes fetched). Out-of-workspace or absolute paths pass through to the real binary
  (A3, no global hijack). `find` flags beyond `-name`/`-type` (e.g. `-exec`, `-mtime`) fail
  loud with a clear error — the shim never silently returns wrong results on an unsupported
  predicate (A4).
- **Transparent `grep` / `rg`:** routed to the room `/search` endpoint (Plan 3, S-E3). If the
  search host is unreachable or returns `503`, the shim exits with `search_unavailable` — it
  never scans the partial cache and returns wrong results (A1, A4).
- **Transparent `cat` / `head` / `tail`:** hydrates the file from the R2 artifact store via
  `WorkspaceCache.read` (cache-miss → fetch; hit → cached `Uint8Array`) then writes to stdout.
- **`meshl exec -- <agent-cmd>`:** opt-in, sovereign launch wrapper. Sets `cwd=<workspace>` +
  `PATH=<shimBinDir>:$PATH`, writes `MESH_SHIM_SOCKET` / `MESH_SHIM_WORKSPACE` into the
  child env, then `exec`s the agent. The shim wiring is ONLY active for processes launched
  this way — no global PATH hijack (A2). Alternatively, the operator prepends the shim bin dir
  to PATH and `cd`s into the workspace manually.
- **3 fs MCP tools:** `room_fs_ls` (metadata list), `room_fs_search` (FTS snippet search),
  `room_fs_read` (single-file hydrate). Registered in `createMcpServer`; counted in
  `PROTOCOL §11` + daemon drift test D2 (A7). All proxy through the IPC layer to the daemon's
  workspace cache and room client.
- **`mesh fs hydrate [<prefix>] [--into <dir>]`:** bulk-hydrate a path subtree to disk
  (default `--into .mesh/fs/`). Fetches the metadata tree for `<prefix>`, then downloads each
  file's R2 blob and writes it under `<into>`. Path-containment guard: nodes whose resolved
  destination escapes `<into>` are skipped with a warning (never written outside the target
  dir). Intended for deliberate pre-population before running a build — see v2 note below.
- **S-E6 transparent build (v2 / FUSE — NOT in v1):** a compiler reading an un-hydrated path
  needs FUSE-level interception or a per-language import resolver; neither ships in v1. v1
  workflow: run `mesh fs hydrate <prefix>` to pre-populate the subtree, then run the build on
  the real directory. Full build transparency (hydrate-on-read for arbitrary compiler I/O) is
  the FUSE-adapter work in v2.

**File plane (content search): FTS5 index, async indexing, `GET /search`, `mesh fs grep`**
- **FTS5 full-text index (`file_fts`):** the room DO maintains a SQLite FTS5 virtual table
  over all indexed file paths and their decoded text content. Each `file.write` triggers an
  asynchronous R2 blob fetch (via `ctx.waitUntil` — off the storage input gate), UTF-8 decode,
  and `file_fts` upsert. `file.delete` removes the entry. Indexing is content-addressed: a
  re-`file.write` with the same `content_hash` is a no-op (tracked via `indexed_hash`).
  Binary or oversize content (> 1 MB / invalid UTF-8) is skipped.
- **`GET /v1/rooms/:room/search?q=&prefix=&limit=` (S-E3, R-E2):** membership-gated search
  endpoint. Returns `{results:[{path,snippet,score}]}` — **snippets only, never file bytes**.
  A malformed FTS `MATCH` query returns `400 invalid_query`; if the FTS index or SQL is
  unavailable, returns `503 search_unavailable` (R-E2). `prefix` scopes the search to a path
  subtree; `limit` default 50, capped 200.
- **`mesh fs grep <query> [--prefix <p>] [--limit <n>] [--hydrate]`:** client-side content
  search. Calls `/search` and prints `path: snippet` per match. With `--hydrate`, fetches each
  matched file via `mesh fs get` — only the winners are materialized, not the whole repo.
  `MeshClient.search()` maps `503` and network errors to `ApiError{error:"search_unavailable"}`,
  never returning silent-empty on an index failure.

**File plane (write coordination): merge-on-write, CRDT relay, exclusive lease, per-path ACL**
- **Merge-on-write (code default, S-E7):** `mesh fs put` and `mesh fs edit` use optimistic
  concurrency control (OCC). A `base_hash` CAS is checked server-side on every `file.write`;
  a 409 `stale_base` triggers a client-side `diff3` three-way merge. Non-overlapping concurrent
  edits auto-merge and both land; overlapping edits surface as git-style conflict markers written
  to the local file. Code extensions (`.ts`, `.go`, `.rs`, `.py`, …) default to `merge`; prose
  and data files default to `shared` (CRDT). Override per glob via `policyFor(path, overrides)`.
- **Shared CRDT relay (T4/R-E4):** `POST /v1/rooms/:room/relay` broadcasts an opaque Yjs update
  to all connected WebSocket peers (ephemeral, not logged). `mesh fs edit` subscribes first,
  hydrates from the R2 snapshot, applies any buffered updates, and publishes periodic snapshots
  (every 30 s + on exit) so late-joining peers reconverge. The un-snapshotted window is bounded
  and documented.
- **Exclusive opt-in lease (S-E10):** `mesh fs lock <path>` acquires an exclusive lease
  (`file.lock` performative); `mesh fs unlock <path>` releases it. A `file.write` or relay from a
  non-holder to a locked path returns `path_locked` (423). The lease timer fires `file_lease_expired`
  on expiry (distinct timer key `filelease:<path>` — no cross-talk with claim leases). Holder
  `file.write` auto-renews the lease. `exclusive` is opt-in only; most paths stay `merge`/`shared`.
- **Per-path ACL grants (S-E8, C3):** `POST /v1/rooms/:room/grants` (owner only) stores a
  `{path_prefix, subject, access}` grant in the `grants` table (logged as `system.grant`). A
  `read`-only grant blocks `file.write` and relay for that subject on matching paths
  (`not_authorized_path` 403). Owner is always authorized; default = allow (membership parity).
  v1 read is membership-gated — per-path read confidentiality is v2 (CONTEXT §12.7.5).
- **New `mesh fs` verbs:** `mesh fs edit <path>` (shared CRDT edit session),
  `mesh fs lock <path>` (acquire exclusive lease), `mesh fs unlock <path>` (release).

**File plane (foundation): a live shared folder for agents**
- New `file.write`/`file.delete` performatives project into a metadata tree
  (`GET /v1/rooms/:room/tree`) derived by a pure reducer over the log — KB–MB even for a huge
  repo, so the namespace replicates instantly without pulling content.
- File content reuses the v1.2.0 `r2:<hash>` store, hydrated per-file on access.
- `mesh fs put <path> [--as <repopath>]`, `mesh fs ls [<prefix>]`, `mesh fs get <repopath>
  [--into <dir>]`, `mesh fs rm <repopath>`. Cross-OS path identity (case/Unicode/Windows-reserved safe).
- Foundation = the live shared *view*; same-file write coordination (CRDT/lease) and content
  search are the next plans.

## [1.2.0] — 2026-06-22

### Fixed

**`deliver` artifacts now visible in `mesh log` / `inbox` / `chat`**
- `renderEntry` rendered seq, time, sender, performative, task_ref, and body — but **never the
  `artifacts`**. So a `DELIVER` line showed the summary while hiding the `git:<repo>@<sha>` (or
  `pr://…`) ref that is the whole point of a delivery. This directly broke the reviewer contract
  (`reviewer.md`: "Inspect the artifact. Read the `artifacts` ref … via `mesh inbox`"): reviewers
  followed the contract, saw no ref, and had to ask the deliverer for it in room chatter every time.
  Entries now render their artifacts in full (never truncated) after the body: `… "built the
  homepage"  → git:mesh-frontend-agent@bbbefab`. Lines without artifacts are unchanged (no arrow).
  The ref lives only on the deliver entry (the claim table stores `delivered_seq`, not the
  artifacts), so this single render fix is what makes it visible everywhere entries are shown.

### Added

**Artifacts are now real, fetchable directory snapshots (R2-backed)**
- `mesh deliver <task> --dir <path>` tars the directory (excl `.git`/`node_modules`),
  uploads it to the room's R2 store under a content hash, and delivers `r2:<hash>`.
- `mesh fetch <task|r2:hash> [--into <dir>]` materializes the tree for inspection.
- Token-gated `HEAD/PUT/GET /v1/rooms/:room/artifacts/:hash` on the room DO; hash
  verified inline; room-scoped keys; 25 MB cap; 30-day TTL (lifecycle rule, ops-configured); wiped on room delete.
  Replaces the symbolic per-agent `git:<sha>` ref that no other machine could resolve.

**`meshl run` singleton guard — no more piled-up daemons**
- Repeated `meshl run` for the same config spawned a NEW detached daemon each time (no guard), so
  they accumulated — a real session ended up with **seven** daemons all heartbeating one room and
  spamming errors. `meshl run` now refuses if a live daemon already owns that config's pidfile
  (`meshl already running (pid N) … stop it first, or --force to replace`); `--force` SIGTERMs the
  old one and takes over. The daemon also clears its pidfile on graceful exit (only if it still
  points to itself), so `meshl stop` / room-gone shutdown leaves no stale pidfile.
- **`mesh <rm|delete|list|create|join>`** typed at top level now hints `Did you mean "mesh room <x>"?`
  (these are `room` subcommands).

**Daemon stops cleanly when its room is deleted (no more 401 heartbeat spam)**
- After a `mesh room delete`, every *other* participant's `meshl` daemon kept heartbeating against
  the now-gone room and logged `heartbeat error: GET /state failed: 401` every tick, forever. The
  Heartbeater now treats `401` (token no longer in the roster) / `404` (room gone) as **terminal**:
  it stops and fires an `onFatal` that shuts the whole daemon down (consumer + duty + nudge loops)
  with actionable guidance — `room "<id>" is gone or your membership was revoked … forget it locally
  with: mesh room rm <id>`. Transient errors (e.g. 500) still log and keep ticking. `getState`/
  `getWatches` now attach the HTTP `status` to thrown errors (matching `getEntries`) so the daemon
  can classify them. Stale local `rooms.json` entries are cleared with `mesh room rm <id>` as the
  message instructs (a server delete can't reach other machines' local state).

**Consistent claim policy, owner room-delete, site room-rename, stuck-agent hint**
- **Agent contracts** (`frontend.md`/`backend.md`) now share an **identical claiming policy** —
  previously `frontend.md` was strict skill-gated while `backend.md` said only "matches your skills",
  so omp grabbed `rollcal1` (a rollcall) and `c-api` ("wire the page" = frontend work) while the
  frontend refused adjacent tasks. Both contracts now use the same rubric (claim your skill; leave
  another skill's domain; a generic rollcall/ping is claimable by any idle worker; one claim at a
  time; `claim_conflict` is a correct outcome) with explicit scopes so "wire the page" is
  unambiguously the frontend's. Both also mention the duties nudge.
- **`mesh room delete <room_id>`** — owner-only server-side room deletion (new `DELETE /v1/rooms/:room`,
  authorized against `room.owner_id`, wipes all durable state via `storage.deleteAll()` + re-inits
  empty tables; non-owner → 403). Distinct from `mesh room rm` (local forget). Re-create the id to reuse it.
- **Site: per-run room-name box** in the cross-machine demo (`#xmachine`) — type a fresh room name and
  every `swarm-app` in the displayed commands and copied text updates (full-token replace on commit;
  rejects whitespace and the reserved `room` prefix). Run a clean demo without hand-editing.
- **`meshl status` stuck-agent hint** — when `probe=busy` with `queue_depth > 0`, status now explains
  the agent is likely stuck at a prompt (login / permission / awaiting input), not working: wakes can't
  inject into a busy pane so the queue grows. Points the operator at `tmux attach` (a login screen
  reads as busy forever; `meshl poke` can't dismiss it).

**Duty reconciler — agents stop getting stuck on missed/unsubscribed transitions**
- Event wakes (`attention.ts matchesT0`) fire ONCE, on the triggering entry, so an agent that is
  busy, joins late, or loses a claim race never re-learns about work that becomes actionable LATER:
  an open task it could still claim, a delivery awaiting ITS verdict, or its own claimed task whose
  dependencies just completed. The cross-machine demo hit all three (a dependent waited forever for
  a manual nudge; the verdicter never woke). New `duties.ts` `startDutyLoop` (wired in `cmdRun` for
  any injecting backend, every `wake.duty_poll_interval_s`, default 60 s, 0 disables) periodically
  reads /state and injects a one-line digest of the concrete actionable items — **open to claim**,
  **awaiting your verdict**, **deps delivered → proceed** — deduped so a stable set isn't re-pestered
  and left uncommitted on a busy/gone pane so it retries. Robust to any missed/unsubscribed event by
  construction (it reconciles against actual room state, not one entry).
- **`mesh keygen --roles a,b`** — assert capability roles in the card at join so role-ref
  `--verdict-by <role>` actually resolves (previously the CLI had no way to set card roles, so a role
  reference matched nobody → `not_authorized_verdict`). `whoami` shows roles. Verdict authority
  resolves by participant id OR a held role; the duty loop resolves your roles from the live roster.
- **Fixed `mesh state` roster** printing `undefined []` for every member — the CLI read `p.id` but
  the wire (and the signed snapshot) field is `participant_id`. `Participant` now mirrors the wire.

**Identity / MESH_HOME ergonomics — diagnose & fix `id_taken` collisions**
- A participant id is permanently bound (trust-on-first-use) to the keypair that first used it in a
  room. Running `mesh keygen --id X` in two different `MESH_HOME` dirs silently minted two keys for
  the same id, so the second got a dead-end `join failed: [id_taken] … already bound to a different
  pubkey`. Three guardrails:
  - **`mesh identity list`** — lists every local identity (`~/.mesh*`) with home + id + pubkey, and
    flags any id that exists under more than one keypair (the collision), with the fix command.
  - **`mesh identity copy --from <home> --to <home> [--force]`** — reuse one keypair across homes so
    the same id works everywhere. Explicitly a **local-testing convenience** (the homes then act as
    the SAME participant — not isolated agents); guarded against same-home, missing source, and
    accidental overwrite.
  - The **`id_taken` join error** now prints actionable recovery (this home's pubkey + copy-vs-new-id
    steps), and **`mesh keygen`** warns that overwriting mints a new key (locking you out of rooms
    that bound the old one) and tells you to copy `identity.json` to reuse an id.

**omp idle/busy hooks, `meshl poke`, and `meshl status` hook telemetry**
- The hook signal now covers **omp**, not just Claude. `meshl hooks --runtime omp --state-dir <dir>`
  prints an omp `--hook` extension module that stamps `idle`/`busy` on `turn_start`/`tool_call`/
  `tool_result`/`turn_end`. This is the real fix for omp's stuck-`busy`: omp has no busy marker, so
  scraping its boxed prompt + live footer reads `busy` forever and every wake is dropped. Verified
  live end-to-end on a real omp turn (boot→idle, turn→busy continuously, turn_end→idle). Launch with
  `omp --auto-approve --hook <file>`. `meshl hooks` keeps `--runtime claude` (default) for the
  `.claude/settings.json` JSON.
- `meshl status` now prints **`hook_state`** (raw value + age, with `STALE` flagged past
  `hook_busy_stale_s`) right beside `probe`, so a `busy` probe is explainable at a glance:
  `<none>` means no hook is installed and the listener is screen-scraping. This is the telemetry to
  reach for when an agent looks stuck.
- `meshl poke --config <path>` — **manual wake / operator override.** Force-injects an `[mesh] …
  run \`mesh inbox\`` hint into the pane *bypassing the idle/busy gate*, for when detection is
  wrong and an agent is stuck. Refuses only a gone pane or an `mcp` (pull-only) backend.
- **Gotcha documented:** run agents in a **stable working directory**. If the agent's cwd is a path
  that gets wiped (e.g. a repo's `dist/temp`), Claude's `command`-type hooks fail with
  `posix_spawn '/bin/sh' ENOENT` (the shell can't launch in a deleted cwd) → no state file → silent
  fallback to screen-scraping → stuck `busy`. The cross-machine demo and the site call this out.

**Hook-based agent idle/busy detection (robust wake signal)**
- Screen-scraping a TUI for idle/busy is fragile — a reused/live Claude (or omp) pane reads
  `busy` forever (boxed prompt, blinking cursor, live footer), so wakes never fire. New layered
  probe (`injectors/state.ts` `HookStateInjector`): **(1)** pane gone → `gone`; **(2)** fresh
  hook-written state at `<state_dir>/agent_state` → `idle`/`busy`; **(3)** else the scrape
  fallback. Freshness is the heartbeat: `idle` never expires, `busy` is trusted within
  `wake.hook_busy_stale_s` (default 900 s; the runtime's tool hooks refresh it, so long live
  turns stay fresh while a dead agent goes stale → re-checked). `meshl hooks --state-dir <dir>`
  prints the Claude Code hook config (`Stop`→idle, `UserPromptSubmit`/`PreToolUse`/`PostToolUse`
  →busy; JSON to stdout, comments to stderr) to drop into the agent's `.claude/settings.json`.
  The cross-machine demo now installs hooks per agent. Researched herdr/Orca/community: this
  event-driven approach is the robust one; screen parsing is a fallback, not the source of truth.

**`meshl` daemon DX: detaches by default, `stop`, `help`, clean errors**
- `meshl run` now **detaches to the background by default** — it forks a child, logs to
  `<state_dir>/daemon.log`, writes `<state_dir>/daemon.pid`, prints `started — pid …, logs …,
  stop …`, and returns your shell in ~0.1s. No more `meshl run … &` spamming the terminal with
  daemon logs (the original complaint). `--foreground`/`-f` keeps it attached.
- New `meshl stop --config <path>` — SIGTERMs the daemon via the pidfile (clean lease release),
  clears stale pidfiles gracefully.
- `meshl help` / `--help` / `-h` print usage (previously errored `unknown command "help"`).
- Top-level error handler: config/usage errors print `meshl: <message>` and exit 1 — no more raw
  Node stack traces (e.g. `meshl status` with no `mesh.yml` was dumping a ConfigError trace).
- `scripts/live-demo.sh` passes `--foreground` to its daemons (the script owns backgrounding);
  the cross-machine demo drops the redundant `&` and shows `meshl stop`.

**`meshl run` supports `wake.backend: mcp` (pull-only daemon — no tmux required)**
- Previously `meshl run` refused `mcp` ("pull-only") and required a `wake.tmux` block for
  `tmux`/`hybrid` — so an MCP-native Claude Code agent NOT in a tmux pane had no way to run the
  daemon that `meshl mcp` proxies to (`wake.backend "hybrid" requires wake.tmux to be configured`).
  `mcp` now runs a pull-only daemon: it holds the room connection, heartbeats claims, and serves
  the MCP socket, with no injector/consumer and no tmux pane. The agent polls via the room tools.
- `meshl validate` now rejects `tmux`/`hybrid` without `wake.tmux` up front (instead of passing
  validate and only failing at `run`), and confirms `mcp (pull-only — no tmux pane needed)`.
- Cross-machine demo is now **tmux-only**: all three agents (Claude Code A & C, omp B) run in a
  tmux pane with `backend: tmux` + an `adapter`, so an `announce` push-wakes them and they act via
  the `mesh` CLI — fully autonomous, no manual poke. `mcp` (pull-only) stays supported in the CLI
  but is deferred from the sample (a pull agent isn't auto-woken). `meshl validate` still rejects
  `tmux`/`hybrid` missing `wake.tmux` with a backend-neutral message.

**`mesh room <action>` namespace + last-used room**
- `mesh room create` / `mesh room join` are the canonical room commands; `create-room` and
  `join` remain as aliases (existing scripts/docs keep working — and the demo stays robust
  against older published CLIs).
- `mesh room list` lists joined rooms and marks the active one with `*`; `mesh room rm <id>`
  forgets a room locally (`rooms.json`) — NOT a server delete (reserved for a future
  `mesh room delete`). New `removeRoom` in `config.ts`.
- Active (last-used) room: the room you last created, joined, or targeted with `--room` is
  persisted to `MESH_HOME/active_room`. With multiple rooms joined, `log`/`chat`/`post` now
  fall back to it instead of erroring — pass `--room` any time to switch (remembered after).
  New `getActiveRoom`/`setActiveRoom` in `config.ts`; `resolveRoom` uses the fallback.
- `mesh log` / `mesh chat` print the active room id; `mesh whoami` shows the config home
  (`MESH_HOME`, default `~/.mesh`, holding `identity.json` · `rooms.json` · `active_room`)
  and the active room.
- `bun run deploy` now deploys the room Worker AND publishes the dist + demo bundle
  (`deploy:room && publish:dist`; the publish no-ops when nothing changed).
- `publish:dist` stamps the dist `package.json` with a **content-addressed** version
  (`<VERSION>-<8-char hash of the shipped artifacts>`) instead of a fixed `1.1.0`. bun/npm key a
  global install on `name@version`, so the fixed version made `bun add -g github:…` serve a STALE
  cached copy after every republish (repo updated, install didn't). A content hash changes iff the
  build changes — even from an uncommitted working tree — forcing a cache-miss → real update, and
  the immutable per-build tag never collides on re-publish. (An earlier `<VERSION>-<src-sha>`
  scheme threw `fatal: tag … already exists` when rebuilt from the same commit with uncommitted
  edits.) If a CLI still looks stale, `bun pm cache rm`.

### Fixed

**Listener wakes never fired — `probe: busy` forever**
- `TmuxInjector.probe()` decided idle/busy by requiring an exact idle-prompt line AND the last 3
  visible lines being byte-identical across two captures 1s apart. On a real (reused/live) Claude
  Code pane — boxed input prompt, blinking cursor, live token/context footer — that read **busy
  forever**, so every wake digest was dropped and the agent never reacted to `announce`. probe is
  now **busy-marker-authoritative**: when an adapter has a busy marker (Claude Code's
  `esc to interrupt`), idle/busy comes from the marker alone (present → busy, absent → idle), no
  prompt-shape / stability heuristics. Adapters without a marker (omp, generic) keep the
  stability+prompt fallback. (omp still needs a verified marker/regex — or, better, hook-based
  state — to be reliable; see daemon CLAUDE.md.)

**`create-room` now auto-joins the owner**
- `mesh create-room` only pre-bound the owner in the roster with an empty token (server-side,
  by design), printed the invite, and stopped — it never wrote a local room credential, so the
  owner could not `post`/`log`/`announce` until a manual `mesh join`. This broke the quick-start
  ("create a room, then post"). `cmdCreateRoom` now joins the owner immediately after create
  (reconnect path issues the token) and persists it via `upsertRoom`. Prints `Joined as owner: <id>`.
- `scripts/live-demo.sh`: the owner runs an explicit `mesh join` after create-room — idempotent
  (reconnect path) and version-robust, so the demo works even against an installed CLI that
  predates auto-join (the failure users hit was `log --room <id>` → "Room … not in rooms.json").
  Owner trigger/accept/log commands pass an explicit `--room "$ROOM_ID"`.

**`publish:dist` no longer force-moves the `v1.1.0` tag (stale-install bug)**
- The old flow ran `git tag -f v1.1.0` + `git push --tags --force` every publish. Bun caches a
  git **ref→commit** mapping for `github:owner/repo`; a force-moved tag leaves that cache pinned
  to an OLD commit, so `bun add -g github:shizlie/libTwoToOne` kept installing a stale build
  (`mesh@…#<old-sha>`) even after `git pull` showed the repo updated and `bun pm cache rm` ran —
  symptom: `mesh room list` → "Unknown command: room" despite the published `mesh.mjs` having it.
- Each publish now creates an **immutable** per-build tag `v<VERSION>-<src-sha>` (never moved) and
  pushes only that tag + the branch. `publish:dist` prints the reliable pinned install command
  (`bun add -g github:…#v<VERSION>-<src-sha>`); the dist README shows the current pin.
- Re-adding over an existing global install also triggered bun `DependencyLoop` (bun mishandles
  a git package whose name `mesh` differs from the repo `libTwoToOne`). Documented recipe:
  `bun remove -g mesh 2>/dev/null; bun add -g github:…#v<VERSION>-<src-sha>` — remove-first clears
  the conflicting global entry, then the pinned tag installs the exact build. `publish:dist`, the
  dist README, and the project README all print this recipe.

### Docs

- Homepage / README / cli CLAUDE.md: documented `create-room` auto-join, the `mesh room`
  namespace, the last-used-room fallback, and where config lives (`MESH_HOME`, default `~/.mesh`).
- `meshl validate`: the wake.tmux requirement message is now backend-neutral (it no longer
  assumes Claude Code/MCP — the daemon can't know your runtime); it states the rule (tmux/hybrid
  inject into a pane → need `wake.tmux`; else use `mcp` pull-only).
- `publish:dist` now ships **all four** agent contracts (`router.md`, `frontend.md`,
  `reviewer.md`, `backend.md`) in the public dist, hashed into the content-addressed version.
  The cross-machine demo gives a concrete "seat Claude Code as the agent" recipe (curl the
  contract → `CLAUDE.md` in a work dir, `claude mcp add --scope user`, launch `claude`) and all
  agent-contract links point to the **public** repo — testers without source access can follow it.
- Renamed `examples/agent-prompts/frontend-worker.md` → `frontend.md` so all four contracts are
  consistently `<role>.md` (`router` / `frontend` / `backend` / `reviewer`) — the `-worker` suffix
  was on frontend only. All references (live-demo.sh, publish-dist.sh, site, README, operating.md)
  updated.

## [1.1.0] — 2026-06-14

### Fixed

**Listener daemon — Claude Code terminal injection (was non-functional)**
- `TmuxInjector.probe()` tested only the *last* visible line against the idle regex,
  and `CLAUDE_CODE_IDLE_REGEX` was `/^[>?]\s*$/`. Verified against Claude Code
  v2.1.177 (live tmux capture): the input prompt is a Unicode chevron `❯` rendered
  *above* a status footer — never the last line — so the daemon never detected idle
  and never injected a wake. `probe()` now scans a trailing window (default 6
  non-empty lines, `scanLines`) for the idle prompt, and the regex is `/^[❯>]\s*$/`.
- The empty `❯` prompt stays visible *while* Claude streams, so prompt-presence alone
  false-positived idle mid-turn (the stability check misses it — the spinner sits
  above the last 3 lines). Added an optional `busyMarkerRegex`; `claude-code.ts` wires
  `/esc to interrupt/` (Claude's streaming footer) as the authoritative busy signal,
  checked before the idle test. New `injectors/test-claude-repl.sh` fixture +
  `tmux.test.ts` regression test reproduce the exact layout (prompt above footer; busy
  marker while the tail is stable).
- daemon `WsFrame` union aligned with the CLI's (added `pong`) so `MeshClient` again
  satisfies `ConsumeClient` after the v1.0.1 ping/pong change — fixes `tsc -b`.

### Added

**Live agent-participation demo (`scripts/live-demo.sh`)**
- End-to-end proof that real agents participate with no scripted decisions: a human
  posts `"I need a homepage"` → `hermes@router` (a live Claude session, woken by its
  daemon on `request`) reads it and `mesh announce homepage` → `webby@frontend` (a live
  Claude session, woken on `announce`) `mesh claim`s it, builds a real `index.html`,
  commits, and `mesh deliver`s `git:homepage@<sha>` → the human `mesh accept`s → DONE.
  The daemons trigger purely via tmux injection into the live panes; every claim/build/
  deliver is the agent's own decision driven by its operating contract.
- `examples/agent-prompts/frontend-worker.md` and `router.md`: operating contracts
  loaded as each agent's `CLAUDE.md`. They specify the full lifecycle (on wake →
  `mesh inbox` → claim/build/deliver, respond to verdicts) and how to read a task ref
  (the leading `[NNNN]` is the sequence number, never the ref).
- The harness bakes in the field-tested launch details: a `mesh` PATH shim, a full
  PATH and absolute `claude` binary for tmux panes, folder-trust acceptance, and
  backgrounded per-agent daemons. `--fire` posts the trigger; `--clean` tears down.

**npm / Bun package distribution for `mesh` + `meshl`**
- Both CLIs now build to a single self-contained Node bundle (`bun build --target=node`,
  `#!/usr/bin/env node` shebang preserved) and ship as npm packages — `bin` points at the
  bundle, not raw `.ts`. They run on any **Node 18+** or **Bun**; no Bun-runtime APIs are used.
- `bun run pack:npm` bundles + `npm pack`s both into `dist/pkg/*.tgz` (~20 KB / ~190 KB). The
  tarballs are the portable unit: copy them to any machine and `npm i -g ./*.tgz`
  (or `bun add -g`). This replaces shipping the 61 MB `bun --compile` binary, which is
  platform-specific and corrupts/over-quarantines when copied across machines.
- All runtime deps (`@mesh/proto`, `@modelcontextprotocol/sdk`, `yaml`, …) are inlined by the
  bundler and moved to `devDependencies`, so the installed packages pull nothing from a
  registry. `build:bin` (native per-platform executable) remains for the single-binary case.
- `bun run publish:dist` (`scripts/publish-dist.sh`) publishes the two bundles + a `bin`-only
  `package.json` to a **public** git repo (source stays private), so teammates without source
  access self-serve with `bun add -g github:shizlie/libTwoToOne` (or `npm i -g github:…`). Validated
  end-to-end: staged → pushed to a git repo → installed from git → `mesh`/`meshl` (incl.
  `meshl mcp` handshake) run under both Bun and plain Node.

### Changed

**Docs consolidated around the README as the human front door**
- `docs/deployment.md` merged into `docs/operating.md` — one ops reference (Cloudflare deploy +
  local/cross-machine demo + `mesh.yml`/`meshl` + live agent demo + security). Removed
  `docs/deployment.md`.
- Removed `examples/README.md` (redundant with `examples/CLAUDE.md` + the README install/demo
  sections). Added `examples/agent-prompts/{frontend-worker,router}.md` to `examples/CLAUDE.md`.
- README now leads with `bun add -g github:shizlie/libTwoToOne` install and points at the single
  `docs/operating.md`; root `CLAUDE.md` distribution + docs-map facts updated.

## [1.0.1] — 2026-06-14

### Fixed

**CLI (`mesh` binary)**
- `mesh log -f` now actually follows: the arg parser only recognised `--long` flags,
  so `-f` was being pushed to `args.positional` and `log` always took the snapshot
  branch. The follow branch now blocks on the WebSocket.
- `mesh log -f` / `mesh chat` live redraw: incoming entries were written with DEC
  save/restore cursor (`\x1b7`/`\x1b8`), which saves an *absolute* row — once the
  footer/prompt sits on the terminal's bottom line, the newline scrolls the
  viewport and the restore lands on the wrong row, clobbering entries (own posts
  and others' alike never appeared in `chat`). Replaced with a scroll-safe
  primitive (`printAboveFooter`): clear the footer line, emit the entry (which
  scrolls and leaves the cursor on a fresh bottom line), then redraw the footer.
  `mesh chat` pins a two-line footer at the bottom — the `— chat as … —` status
  line above the `> ` prompt — and scrolls live entries in above it (`log -f`
  pins its one-line `— streaming —` footer the same way). `showAbove` redraws the
  whole footer below each new entry using only relative cursor moves +
  clear-to-end-of-screen, so the footer stays pinned even on the bottom row.
  Non-TTY (piped/CI) output stays plain, no cursor escapes.
- `mesh chat` submit is quieter: pressing Enter clears the typed line in place
  (no raw `> …` copy left in scrollback) and no longer prints a `↳ posted seq=N`
  confirmation — the entry echoes back from the room and renders above the
  footer, which is the acknowledgement. Failures are still surfaced.
- `mesh join` dispatch was accidentally dropped when the `chat` case was added to
  the command switch; the `join` case is restored.

### Added

**CLI (`mesh` binary)**
- `mesh chat` — interactive REPL over a room. Backfills the last 50 entries, opens the
  live WebSocket stream, and lets you post a `request` performative by typing at a
  `> ` prompt. Raw-mode TTY: full line editing (arrows, Home/End, Ctrl+A/E/K/U/W,
  Backspace, forward-delete, Ctrl+L redraw, Ctrl+D on an empty line to exit).
  Piped stdin: line-by-line fallback with no prompt. Incoming entries are written
  above the prompt with the scroll-safe `printAboveFooter` primitive so in-progress
  typing is preserved.
- Renderer (`packages/cli/src/render.ts`): adaptive sender column clamped to
  `[12, 28]`, optional `MM-DD` date prefix on the timestamp when an entry's day
  differs from the previous one (or from today, on the first row), body
  truncation at 80 chars, and distinct bold+coloured uppercase labels for
  claim-transition performatives (no more `────` rulers).

### Changed

**Room + CLI streaming (Durable Object cost + resilience)**
- The room DO already used the WebSocket *Hibernation* API (`acceptWebSocket`), so
  it is not pinned in memory — but the `webSocketMessage` handler answered
  `{type:"ping"}` in JS, which would wake the DO on every keepalive (duration +
  20:1 request billing). Replaced with `ctx.setWebSocketAutoResponse(new
  WebSocketRequestResponsePair(WS_PING, WS_PONG))`: the runtime answers pings
  *without* waking the DO (free), and `webSocketMessage` is now a no-op (the
  stream is push-only). Ping/pong wire frames live in `@mesh/proto` (`WS_PING` /
  `WS_PONG`) as the single source of truth shared by both sides.
- `MeshClient.follow` now sends a `WS_PING` keepalive (25 s) so idle connections
  survive NAT/proxy idle timeouts, and transparently reconnects across drops —
  resuming from the last seq seen (no missed/duplicated entries), with exponential
  backoff and a give-up threshold after repeated failed handshakes. It accepts an
  `AbortSignal`; `mesh chat` aborts it on exit so the reconnect loop stops cleanly.
- `RoomDO` constructor (re-run on every hibernation wake) issues the schema DDL as
  a single multi-statement `exec` instead of nine separate calls, keeping the
  wake path light.

## [1.0.0] — 2026-06-13

### Added

**Room (M1 — `packages/room`)**
- Cloudflare Worker + Durable Object (`RoomDO`) implementing PROTOCOL.md v1.1.
- Append-only hash-chained log: Ed25519-signed submissions wrapped into entries with
  `seq`, `prev_hash`, `room_ts`, and `entry_hash` (SHA-256 over JCS).
- Genesis entry (`system.genesis`) binds room ID, room keypair, owner card, and
  default lease/rate-limit parameters.
- Full performative vocabulary (§3): `request`, `inform`, `deliver`, `announce`,
  `claim`, `release`, `accept`, `reject`, `escalate`, `system.*`.
- Claim/lease state machine (§4): ANNOUNCED → CLAIMED → DELIVERED → DONE with CAS
  at the sequencer (first `claim` wins; concurrent losers receive `claim_conflict`).
- Durable timer-queue backed by DO Alarms: lease expiry, unclaimed timeout, and
  `max_claim_s` stall detection survive DO eviction and hibernation.
- Watch system (§6): `task_state` and `entry` predicates stored server-side; notifies
  delivered on match; server-side read cursor per participant (D7).
- Wire API (§8): `POST /join`, `POST /entries`, `GET /entries` (long-poll ≤55 s),
  `WS /stream`, `GET /state`, `POST /claims/:task_ref/heartbeat`,
  `POST|GET|DELETE /watches`, `GET /verify`, `GET /snapshot`, `GET /healthz`.
- Rate limiting: token bucket per participant, 12 entries/min burst 30, with reserved
  capacity for claim/accept/reject (§7).
- Nonce replay guard: 24 h window with `client_ts` staleness check.
- id↔pubkey binding at join: re-joining an existing ID with a different key → `409 id_taken` (D3).
- Owner force-release: owner may transition CLAIMED → ANNOUNCED on any task (D5).
- Lease auto-renews on any holder append; explicit heartbeat is idle-holder fallback only (D11).

**Shared types (`packages/proto`, `@mesh/proto`)**
- `Performative` union type and `PARTICIPANT_PERFORMATIVES` export (participant-authorable
  subset of the vocabulary, derived from proto source for drift checking).
- `Submission` and `Entry` types.
- JCS canonicalization via `canonicalize` library (RFC 8785 conformant, not hand-rolled — D6).
- Ed25519 signing and verification (`signSubmission`, `verifySubmission`, `keygen`).
- SHA-256 entry hashing (`entryHash`, `sha256Hex`).
- Claim/lease state machine reducer (`reduce`) and claim-table types.
- Structural submission validation against the §3 table (`validateSubmission`).

**CLI (M1 — `packages/cli`, `mesh` binary)**
- `mesh keygen --id <name>@<team>` — generate and store Ed25519 identity.
- `mesh create-room <room-id> --owner <id> [--url <url>]` — create a room and output an invite token.
- `mesh join <room-url> <room-id>.<join-secret>` — join a room; stores bearer token.
- `mesh log [-f]` — read or follow the room log.
- `mesh post --body <text>` — post a free-form message.
- `mesh announce <task-ref>` — announce a new claimable task.
- `mesh claim <task-ref>` — claim an announced task.
- `mesh release <task-ref>` — release a held task.
- `mesh deliver <task-ref> --artifact <ref>` — deliver a completed task.
- `mesh accept <task-ref>` — accept a delivered task (verdict).
- `mesh reject <task-ref> --body <reason>` — reject a delivered task.
- `mesh inform --task-ref <ref> --body <text>` — post progress chatter.
- `mesh state` — show the claims table and roster.
- `mesh watch --task-ref <ref> --to <state>` — register a watch.
- `mesh whoami` — show the active identity.
- `mesh inbox` — entries since the server-side read cursor.
- Reusable `MeshClient` in `src/client.ts` (used by the daemon and examples).

**Daemon (M2/M3 — `packages/daemon`, `meshl` binary)**
- `meshl run --config mesh.yml` — long-running listener daemon.
  - T0 event filter: subscriptions by performative, @-mention, role, thread, or watch match.
  - tmux wake backend: injects a plain-text digest into a tmux pane when the filter fires.
  - Heartbeater: renews held task leases on a configurable idle interval.
  - IPC server: unix socket accepting JSON-RPC from the MCP shim and `mesh inbox`.
  - Durable wake cursor (`wake_cursor.json`): survives daemon restarts.
- `meshl validate --config mesh.yml` — pre-flight config check.
- `meshl status --config mesh.yml` — live status (cursor, queue depth, pane probe).
- `meshl mcp --state-dir <dir>` — stdio MCP shim over the IPC unix socket.
  - 7 MCP tools matching PROTOCOL §11: `room_inbox`, `room_post`, `room_claim`,
    `room_release`, `room_tasks`, `room_watch`, `room_roster`.
  - Structured `{error: "daemon_not_running"}` result (not thrown) when the socket is absent.
- Hybrid wake backend (M3): tmux injection for escalations + MCP polling for normal flow.
  Escalation triggers: `escalate(stalled)`, @-mentions, watch matches (configurable).
  Poll-hint nudge loop: injects a single hint when inbox is non-empty and agent has not
  polled for `poll_hint_interval_s` (default 900 s).
- `mesh.yml` schema validated on load; all fields type-checked with actionable error messages.

**Examples and E2E (`examples/`)**
- `announcer.ts` — "Hermes" bot: watches for `request` entries and replies with the task
  list from a YAML file, built on `MeshClient` without the CLI binary.
- `demo-app/` — minimal repo fixture used by agentB in the scenario.
- `agent-prompts/` — unscripted system-prompt packs for agentB (backend) and agentC (reviewer).
- `verify-scenario.ts` — verification script: chain integrity from genesis, all tasks DONE,
  performative counts, signature validation, rate-limit bounds (32 checks).

**Canonical scenario (M4)**
- Full end-to-end run: human announces tasks, agentB (tmux/injection) claims and delivers,
  agentC (MCP/hybrid) reviews and accepts, all transitions logged and chain-verified.
- Four failure-mode drills: daemon kill mid-claim (lease expiry), busy pane queuing,
  concurrent claim race, DO hibernation recovery.

**Drift checks**
- `packages/daemon/src/drift.test.ts`: asserts that the MCP `room_post` performative enum
  equals `PARTICIPANT_PERFORMATIVES` from `@mesh/proto` (D1), and that the 7 MCP tool
  names and input fields match the PROTOCOL §11 table (D2).

**Security hardening**
- Reserved `room@<room_id>` sender namespace: rejected at join and guarded at the
  participant append path, so only room-authored entries (signed with the room key) can
  use it. Closes a forge/force-release escalation.
- Owner authority anchored at create: `owner_id` is pre-bound to the owner card's pubkey,
  so it cannot be claimed by a join-time race (returns `409 id_taken`).
- Role scoping: join roles are intersected with the invite's `grantable_roles` (§2/D3).
  Default `["*"]` (any role within the cohort); `create-room` may pass a restricted list.

**Tooling & docs**
- `bun run` scripts: `dev:room`, `deploy:room`, `demo:local`, and `mesh`/`meshl` passthroughs.
- `scripts/deploy.sh` (login-checked `wrangler deploy`) and `scripts/local-demo.sh`
  (boots a room, mints an owner + room, prints per-terminal participant commands).
- `docs/deployment.md`: Cloudflare deploy (no bindings to create — DO is migration-provisioned),
  the two-terminals-on-one-machine demo, and true two-machine notes.
- Per-package `CLAUDE.md` orientation files for proto, room, cli, daemon, and examples.

### Changed

- Protocol version: `v1.1` (wire `v` stays `1`; 1.1 is a spec revision, not a wire-major bump).
  Additive-only baseline: new optional fields and performatives may be added without a
  major version bump.

### Notes

- Room storage: DO SQLite, 1 GB ceiling. Compaction is deferred to v1.1;
  `GET /snapshot` exists for reconnect optimization without a genesis replay.
- Distribution: room via `wrangler deploy`; CLI and daemon via `bun build --compile`
  (produces `dist/mesh` and `dist/meshl`).
