#!/usr/bin/env bash
# demo-scaffold.sh — ONE command that scaffolds the whole shared-workspace demo.
#
# What it stands up, end to end (no per-agent copy-paste):
#   1. a room (uses the hosted room by default; boots a local one only if ROOM_URL is localhost),
#   2. an owner identity + the room,
#   3. a SHARED WORKSPACE seeded with a deliberately-buggy TODO backend
#      (examples/todo-backend) — `toggle()` never un-completes a todo; a test fails,
#   4. two teammates — `fixer` and `reviewer` — each with its own identity, operating
#      contract (CLAUDE.md), mesh.yml, and (in live mode) a launched agent + listener.
#
# Then it prints a dev-onboarding card: how files behave in the shared workspace
# (the per-extension write policy), how to inspect it, and the single command that
# kicks off the whole fix.
#
# Usage:
#   bash scripts/demo-scaffold.sh                # scaffold + launch live agents (needs claude + tmux)
#   bash scripts/demo-scaffold.sh --no-agents    # scaffold room+workspace+identities only (hand-drive / simulate)
#   bash scripts/demo-scaffold.sh --fire         # also announce the fix task for you
#   bash scripts/demo-scaffold.sh --clean        # tear down agents/listeners + wipe demo state
#
# Env:  ROOM_URL (default https://usemesh.dev)   ROOM_ID (default todo-demo-<ts>)
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# Repo mode when launched from a source checkout; else "installed mode" (published mesh/meshl
# + the fixture/contracts that ship next to this script in the public demo bundle).
if [ -f "$SCRIPT_DIR/../packages/cli/src/main.ts" ]; then
  ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
else
  ROOT=""
fi
# Default to the hosted room so installed-mode teammates work out of the box (no local
# wrangler needed). Set ROOM_URL=http://localhost:8787 to boot/use a local dev room, or
# ROOM_URL=https://mesh-room.opensocialforall.workers.dev to hit the workers.dev staging room.
ROOM_URL="${ROOM_URL:-https://usemesh.dev}"
ROOM_ID="${ROOM_ID:-todo-demo-$(date +%s)}"
LIVE="${MESH_DEMO_HOME:-$HOME/.mesh-demo}"
SESSION="meshdemo"

# In a source checkout, ALWAYS use the repo source (it has the current file-plane `fs`
# commands); only fall back to installed mesh/meshl on PATH when there is no checkout.
if [ -n "$ROOT" ]; then
  MESH="bun $ROOT/packages/cli/src/main.ts"; MESHL="bun $ROOT/packages/daemon/src/main.ts"
elif command -v mesh >/dev/null 2>&1 && command -v meshl >/dev/null 2>&1; then
  MESH="$(command -v mesh)"; MESHL="$(command -v meshl)"
else
  echo "mesh/meshl not found on PATH and not in a source checkout" >&2; exit 1
fi
CLAUDE_BIN="$(command -v claude || true)"
AGENT_PATH="$LIVE/bin:$PATH"

# ── flags ─────────────────────────────────────────────────────────────────────
NO_AGENTS=""; FIRE=""; SIMULATE=""
for a in "$@"; do
  case "$a" in
    --clean)     : ;;            # handled below
    --no-agents) NO_AGENTS=1 ;;
    --fire)      FIRE=1 ;;
    --simulate)  SIMULATE=1; NO_AGENTS=1 ;;   # CLI-drive the whole fix (no Claude needed)
  esac
done

clean() {
  tmux kill-session -t "$SESSION" 2>/dev/null || true
  pkill -f "daemon/src/main.ts run" 2>/dev/null || true
  pkill -f "meshl.*run" 2>/dev/null || true
  rm -rf "$LIVE"
  echo "demo torn down (tmux + listeners stopped, $LIVE wiped)"
}
if [[ "${1:-}" == "--clean" ]]; then clean; exit 0; fi

# Live agents need claude + tmux — fail fast (before booting a room) with a clear message.
if [ -z "$NO_AGENTS" ]; then
  [ -n "$CLAUDE_BIN" ] || { echo "live agents need 'claude' on PATH — install it, or use --simulate (CLI-drives the whole fix, no Claude) / --no-agents"; exit 1; }
  command -v tmux >/dev/null || { echo "live agents need 'tmux' — install it, or use --simulate / --no-agents"; exit 1; }
fi

# ── room ────────────────────────────────────────────────────────────────────────
if ! curl -fsS -m 2 "$ROOM_URL/healthz" >/dev/null 2>&1; then
  if [ -n "$ROOT" ] && [[ "$ROOM_URL" == *localhost* || "$ROOM_URL" == *127.0.0.1* ]]; then
    echo "Booting a local room (wrangler dev) ..."
    ( cd "$ROOT/packages/room" && nohup bunx wrangler dev >/tmp/mesh-demo-room.log 2>&1 & )
    for _ in $(seq 1 60); do curl -fsS -m 2 "$ROOM_URL/healthz" >/dev/null 2>&1 && break; sleep 1; done
  fi
fi
curl -fsS -m 2 "$ROOM_URL/healthz" >/dev/null 2>&1 || { echo "room not reachable at $ROOM_URL (see /tmp/mesh-demo-room.log)"; exit 1; }
echo "Room healthy: $ROOM_URL"

rm -rf "$LIVE"; mkdir -p "$LIVE/bin"
cat > "$LIVE/bin/mesh" <<EOF
#!/usr/bin/env bash
exec $MESH "\$@"
EOF
chmod +x "$LIVE/bin/mesh"

# ── owner / human (Machine 1) ─────────────────────────────────────────────────────
OWNER_HOME="$LIVE/harry"
MESH_HOME="$OWNER_HOME" $MESH keygen --id harry@hcproduct >/dev/null
INVITE="$(MESH_HOME="$OWNER_HOME" $MESH create-room "$ROOM_ID" --owner harry@hcproduct --url "$ROOM_URL" | awk '/Invite:/{print $NF}')"
MESH_HOME="$OWNER_HOME" $MESH join "$ROOM_URL/v1/rooms/$ROOM_ID" "$INVITE" >/dev/null
echo "Owner harry@hcproduct created room $ROOM_ID"
MESH_HOME="$OWNER_HOME" $MESH fs config write open >/dev/null  # S-K5/S-K6: new-room genesis is write-closed; teammates write below

# ── the owner's project folder: a real local copy of the buggy backend ─────────────
# Dropbox semantics (CONTEXT §12.7): every fs verb resolves local bytes against ONE
# workspace root (default cwd); files hydrate IN PLACE, no shadow dir. So a participant's
# workspace is just an ordinary folder on disk. We copy the fixture into a demo-owned
# folder (cleanup is one rm; a real project can live anywhere) and seed the room FROM it,
# so the owner's `fs status`/`fs ls -f` read in-sync (local == room) — not an empty watcher.
FIXTURE=""
for cand in "$ROOT/examples/todo-backend" "$SCRIPT_DIR/todo-backend"; do
  [ -n "$cand" ] && [ -d "$cand" ] && { FIXTURE="$cand"; break; }
done
[ -n "$FIXTURE" ] || { echo "todo-backend fixture not found"; exit 1; }
OWNER_FS="$LIVE/owner-fs"
rm -rf "$OWNER_FS"; mkdir -p "$OWNER_FS"
cp -R "$FIXTURE/." "$OWNER_FS/"
echo "Owner project folder: $OWNER_FS  (a copy of $FIXTURE — a real project can live anywhere)"
( cd "$OWNER_FS" && MESH_HOME="$OWNER_HOME" $MESH fs put . >/dev/null )
echo "Seeded the room from the owner's folder — local vs room:"
( cd "$OWNER_FS" && MESH_HOME="$OWNER_HOME" $MESH fs status | sed 's/^/  /' )

# ── seed the room charter (Intent I: situated arrival guidance) ────────────────
CHARTER_DIR="$LIVE/charter"
mkdir -p "$CHARTER_DIR/roles"
cat > "$CHARTER_DIR/room.md" <<'EOF'
# todo-demo — room charter

This room coordinates a shared-workspace bug fix. The code under repair — a deliberately
buggy TODO backend — lives in the room's file plane (`mesh fs ls`/`get`/`grep`/`put`), not in
any one participant's local checkout: the moment one participant `fs put`s a file, every
other participant's `fs get`/`fs grep` sees the new bytes.

## Wake signal

A listener daemon watches the room on your behalf. Every `[mesh]` line injected into your
session — including the `[mesh] briefing — …` arrival pointer — is a wake signal. On every
wake, your FIRST action is:

    mesh inbox --mark

Read what changed, then act on it per your own seat's contract. Fetch this room charter plus
your bound seat's contract plus your current situation in one call:

    mesh brief

## Task lifecycle

Tasks move `ANNOUNCED → CLAIMED → DELIVERED → DONE` (or back to `ANNOUNCED` on `reject`).
The owner announces; a claimable task's fix belongs to whichever seat's contract says so;
only the task's named verdict authority may `accept`/`reject` a delivery.
EOF
cat > "$CHARTER_DIR/roles/fixer.md" <<'EOF'
# fixer — seat contract

Your job is implementation, not verdicts. For each task still `ANNOUNCED` whose fix is a
code change (not page/UI work), claim it immediately — first valid claim wins (CAS); a
`claim_conflict` means another agent won the race, not an error. Hold one claim at a time.

Work entirely in the shared workspace: `mesh fs grep`/`fs get` to locate and read, `mesh fs
put` to write your fix back, then `mesh deliver <task_ref> --dir . --body "…"` once the
project's checks are green. If a reviewer rejects, read why (`mesh inbox`), fix again in the
shared workspace, and re-`deliver`.

## Hard constraints

- NEVER `announce` tasks — announcements come from the coordinator/owner.
- NEVER `accept` or `reject` — you are not a verdict holder; the room will reject it.
- After acting on a wake, stop. Do not poll, loop, or invent work.
EOF
cat > "$CHARTER_DIR/roles/reviewer.md" <<'EOF'
# reviewer — seat contract

Your job is verdicts, not implementation. You `accept` or `reject` deliveries on the tasks
you are the named verdict authority for; you do not claim or build anything.

For each task that is `DELIVERED` and lists you as the verdict authority: inspect the change
live in the shared workspace (`mesh fs grep`/`fs get` — never a tarball hand-off), run the
project's checks, then `accept` with a concrete reason or `reject` with a specific, actionable
one. A reject returns the task to `ANNOUNCED` for re-claiming and re-delivery — that is a
valid outcome, not a failure.

## Hard constraints

- NEVER `claim`, build, or `deliver` — implementation belongs to the worker seats.
- NEVER `announce` tasks — announcements come from the coordinator/owner.
- Always include a non-empty `--body` on every `accept` and `reject`.
- After acting on a wake, stop. Do not poll, loop, or invent work.
EOF
MESH_HOME="$OWNER_HOME" $MESH fs put "$CHARTER_DIR/room.md" --as charter/room.md >/dev/null
MESH_HOME="$OWNER_HOME" $MESH fs put "$CHARTER_DIR/roles/fixer.md" --as charter/roles/fixer.md >/dev/null
MESH_HOME="$OWNER_HOME" $MESH fs put "$CHARTER_DIR/roles/reviewer.md" --as charter/roles/reviewer.md >/dev/null
echo "Room charter seeded: charter/room.md, charter/roles/{fixer,reviewer}.md"

# ── teammate setup ────────────────────────────────────────────────────────────────
# setup_teammate <id> <skill> <contract.md> <subscribe-perf> <pane>
setup_teammate() {
  local id="$1" skill="$2" contract="$3" perf="$4" pane="$5"
  local name="${id%@*}"
  local home="$LIVE/$name"
  local work="$LIVE/$name-work"
  MESH_HOME="$home" $MESH keygen --id "$id" >/dev/null
  MESH_HOME="$home" $MESH join "$ROOM_URL/v1/rooms/$ROOM_ID" "$INVITE" >/dev/null

  # Intent G role bind, named after the seat ("fixer"/"reviewer" — the part of $id before
  # '@'), so charter/roles/<seat>.md (seeded above) is reachable via `mesh brief` — the
  # binding-sourced role resolution (Tasks 2-4) reads GET /roles, never roster.roles, so
  # without this bind the seeded charter would be unreachable regardless of its content.
  MESH_HOME="$OWNER_HOME" $MESH fs role "$id" "$name" >/dev/null
  mkdir -p "$work"
  local src=""
  for cand in "$ROOT/examples/agent-prompts/$contract" "$SCRIPT_DIR/$contract"; do
    [ -n "$cand" ] && [ -f "$cand" ] && { src="$cand"; break; }
  done
  [ -n "$src" ] || { echo "contract '$contract' not found" >&2; exit 1; }
  cp "$src" "$work/CLAUDE.md"
  cat > "$LIVE/$name.yml" <<EOF
identity:
  id: $id
  key: $home/identity.json
room:
  url: $ROOM_URL
  id: $ROOM_ID
subscriptions:
  performatives: [$perf]
gate:
  enabled: false
wake:
  debounce_s: 2
  max_digest_events: 5
  backend: tmux
  tmux:
    pane: $pane
    adapter: claude-code
    busy_retry_s: 4
    max_busy_wait_s: 120
heartbeat:
  interval_s: 30
state_dir: $LIVE/$name-state
EOF
  if [ -z "$NO_AGENTS" ]; then
    # mesh's MCP surface is deferred — the agent works through the `mesh` CLI ONLY (on its
    # PATH via $LIVE/bin/mesh). Launch with an EMPTY strict MCP config so Claude Code
    # registers NO mesh MCP server; in particular it won't inherit a global `mesh` server the
    # host may have (which points at an unrelated daemon → daemon_not_running). The daemon
    # (meshl run, below) is still what wakes the agent via tmux; the CLI talks to the room.
    echo '{ "mcpServers": {} }' > "$LIVE/$name-mcp.json"
    cat > "$LIVE/launch-$name.sh" <<EOF
#!/usr/bin/env bash
export MESH_HOME="$home"
export PATH="$AGENT_PATH"
cd "$work"
exec "$CLAUDE_BIN" --strict-mcp-config --mcp-config "$LIVE/$name-mcp.json" --dangerously-skip-permissions
EOF
    chmod +x "$LIVE/launch-$name.sh"
  fi
  echo "Teammate $id ready (skill=$skill, wakes on '$perf')"
}

# Wake panes match the FINAL tmux layout below: 0.0 fixer agent · 0.2 reviewer agent.
setup_teammate fixer@build     fix    fixer.md     announce  "$SESSION:0.0"
setup_teammate reviewer@build  review reviewer.md  deliver   "$SESSION:0.2"

# ── --simulate: CLI-drive the entire fix (no Claude), then assert it landed ─────────
simulate() {
  local fwork="$LIVE/fixer-work" rwork="$LIVE/reviewer-work" ocheck="$LIVE/owner-check"
  echo
  echo "── SIMULATE (no Claude): owner announces → fixer fixes in the shared workspace → reviewer accepts ──"
  MESH_HOME="$OWNER_HOME" $MESH announce fix-toggle --room "$ROOM_ID" \
    --body "toggle() never un-completes a todo; fix src/todos.ts" --verdict-by reviewer@build >/dev/null
  echo "[owner]    announced fix-toggle (verdict: reviewer@build)"

  local brief_out; brief_out="$(MESH_HOME="$LIVE/fixer" $MESH brief)"
  echo "$brief_out" | grep -q "todo-demo — room charter" || { echo "[fixer]    FAIL: mesh brief did not render the room charter"; return 1; }
  echo "$brief_out" | grep -q "open to claim: fix-toggle" || { echo "[fixer]    FAIL: mesh brief did not render fix-toggle as claimable"; return 1; }
  echo "[fixer]    mesh brief renders the room charter + >=1 claimable duty (fix-toggle)"

  MESH_HOME="$LIVE/fixer" $MESH inbox --mark >/dev/null 2>&1 || true
  MESH_HOME="$LIVE/fixer" $MESH claim fix-toggle >/dev/null
  echo "[fixer]    claimed fix-toggle"
  rm -rf "$fwork"; mkdir -p "$fwork"
  MESH_HOME="$LIVE/fixer" $MESH fs hydrate --into "$fwork" >/dev/null
  echo "[fixer]    hydrated the shared workspace -> $fwork"
  if ( cd "$fwork" && bun test ) >/dev/null 2>&1; then echo "[fixer]    UNEXPECTED: green before fix"; return 1; fi
  echo "[fixer]    bun test FAILS (the planted bug) — confirmed"
  sed -i.bak 's/todo\.done = true;/todo.done = !todo.done;/' "$fwork/src/todos.ts" && rm -f "$fwork/src/todos.ts.bak"
  ( cd "$fwork" && bun test ) >/dev/null 2>&1 || { echo "[fixer]    fix did not green the suite"; return 1; }
  echo "[fixer]    applied one-line fix; bun test GREEN"
  ( cd "$fwork" && MESH_HOME="$LIVE/fixer" $MESH fs put src/todos.ts --as src/todos.ts ) >/dev/null
  echo "[fixer]    fs put src/todos.ts -> shared workspace (now live for everyone)"
  MESH_HOME="$LIVE/fixer" $MESH deliver fix-toggle --dir "$fwork" \
    --body "fixed toggle in src/todos.ts; tests green (shared workspace)" >/dev/null
  echo "[fixer]    delivered fix-toggle"

  MESH_HOME="$LIVE/reviewer" $MESH inbox --mark >/dev/null 2>&1 || true
  rm -rf "$rwork"; mkdir -p "$rwork"
  MESH_HOME="$LIVE/reviewer" $MESH fs hydrate --into "$rwork" >/dev/null
  ( cd "$rwork" && bun test ) >/dev/null 2>&1 || {
    echo "[reviewer] shared-workspace tests NOT green — rejecting"
    MESH_HOME="$LIVE/reviewer" $MESH reject fix-toggle --body "tests still failing" >/dev/null; return 1; }
  echo "[reviewer] read src/todos.ts LIVE from the shared workspace; bun test GREEN"
  MESH_HOME="$LIVE/reviewer" $MESH accept fix-toggle --body "toggle flips both ways now; tests pass" >/dev/null
  echo "[reviewer] accepted fix-toggle"

  rm -rf "$ocheck"; mkdir -p "$ocheck"
  MESH_HOME="$OWNER_HOME" $MESH fs get src/todos.ts --into "$ocheck" >/dev/null
  local st; st="$(MESH_HOME="$OWNER_HOME" $MESH state 2>/dev/null | grep -i fix-toggle || true)"
  echo
  echo "── RESULT ──"
  echo "  claims: ${st:-<none>}"
  if grep -q 'todo.done = !todo.done' "$ocheck/src/todos.ts" 2>/dev/null && echo "$st" | grep -qiE 'done'; then
    echo "  PASS: owner (a different participant) sees the fixed src/todos.ts in the shared workspace, fix-toggle DONE"
    return 0
  fi
  echo "  FAIL: fix not visible to owner or task not DONE"; return 1
}
if [ -n "$SIMULATE" ]; then simulate; rc=$?; echo "  Tear down: bash $0 --clean"; exit $rc; fi

# ── live agents (tmux) — only when not --no-agents ─────────────────────────────────
if [ -z "$NO_AGENTS" ]; then
  [[ -n "$CLAUDE_BIN" ]] || { echo "claude not found on PATH — re-run with --no-agents to scaffold without live agents"; exit 1; }
  command -v tmux >/dev/null || { echo "tmux not found — re-run with --no-agents"; exit 1; }
  tmux kill-session -t "$SESSION" 2>/dev/null || true
  tmux new-session  -d -s "$SESSION" -x 220 -y 55
  tmux split-window -t "$SESSION:0.0" -v
  tmux split-window -t "$SESSION:0.1" -v
  tmux select-layout -t "$SESSION:0" even-vertical
  # One row per agent: the agent pane (left) beside a live file pane for ITS OWN
  # folder (right) — the three folders are stand-ins for three machines, so each row
  # shows one "machine" hydrating independently. Bottom row = the talk feed.
  # After these -h splits the (positional) indices are:
  #   0.0 fixer agent · 0.1 fixer files · 0.2 reviewer agent · 0.3 reviewer files · 0.4 talk
  tmux split-window -t "$SESSION:0.0" -h
  tmux split-window -t "$SESSION:0.2" -h
  tmux send-keys -t "$SESSION:0.1" "MESH_HOME='$LIVE/fixer' $MESH fs ls -f --room $ROOM_ID --into '$LIVE/fixer-work'" Enter
  tmux send-keys -t "$SESSION:0.3" "MESH_HOME='$LIVE/reviewer' $MESH fs ls -f --room $ROOM_ID --into '$LIVE/reviewer-work'" Enter
  tmux send-keys -t "$SESSION:0.4" "MESH_HOME='$OWNER_HOME' $MESH log -f --room $ROOM_ID" Enter
  tmux send-keys -t "$SESSION:0.0" "bash $LIVE/launch-fixer.sh" Enter
  tmux send-keys -t "$SESSION:0.2" "bash $LIVE/launch-reviewer.sh" Enter
  echo "Launching agents (waiting for TUIs + trust prompt) ..."
  sleep 13
  tmux send-keys -t "$SESSION:0.0" Enter; tmux send-keys -t "$SESSION:0.2" Enter
  sleep 8
  for name in fixer reviewer; do
    MESH_HOME="$LIVE/$name" $MESH inbox --mark >/dev/null 2>&1 || true
    MESH_HOME="$LIVE/$name" nohup $MESHL run --config "$LIVE/$name.yml" --foreground \
        >"/tmp/mesh-$name-daemon.log" 2>&1 &
  done
  sleep 3
  echo "Daemons running (logs: /tmp/mesh-{fixer,reviewer}-daemon.log)"
  echo "  Watch:  tmux attach -t $SESSION   (row 1 = fixer + its files, row 2 = reviewer + its files, row 3 = talk feed)"
fi

# ── onboarding card ─────────────────────────────────────────────────────────────
ANNOUNCE_CMD="MESH_HOME=$OWNER_HOME $MESH announce fix-toggle --room $ROOM_ID --body \"toggle() never un-completes a todo; fix src/todos.ts\" --verdict-by reviewer@build"
cat <<EOF

════════════════════════════════════════════════════════════════════════════
  mesh shared-workspace demo is up.    Room: $ROOM_ID
  Room URL: $ROOM_URL      Invite: $INVITE      (share both to join from another machine)

  THE FILE PLANE — "Dropbox for agents". The room holds the canonical copy of the
  files; a workspace folder syncs to/from it (workspace root = your cwd). Files
  hydrate IN PLACE in a normal folder — no shadow dir.
    owner (you): $OWNER_FS   ← real local copy, already IN SYNC with the room
    fixer:       $LIVE/fixer-work        ← its own endpoint (starts empty, hydrates on demand)
    reviewer:    $LIVE/reviewer-work     ← its own endpoint

  In a REAL project on one machine, agents can simply share your project folder —
  the room still gives the task feed, wakes, leases, the signed log, and merge/
  stale-write protection on every put. The demo gives each agent its OWN folder to
  make the sync loop VISIBLE ('↓ behind' → fs get → '=') and to rehearse Demo 3:
  a second folder behaves exactly like a second machine. What the room adds either way:
    • byte distribution: each endpoint gets its own copy, hydrated on demand (fs get).
    • write coordination: merge-on-write (3-way for code), stale-write protection,
      exclusive leases, prose CRDT, no silent loss — a plain folder gives none of this.

  SEE IT — from the owner's folder (cd first; workspace root = your cwd):
    cd $OWNER_FS
    MESH_HOME=$OWNER_HOME $MESH fs status         # all '=' in-sync — your copy matches the room
    MESH_HOME=$OWNER_HOME $MESH fs ls -f          # live tree: sizes, last editor, leases
    # after the fixer fixes + puts src/todos.ts, the room tip moves past your copy:
    MESH_HOME=$OWNER_HOME $MESH fs status         # src/todos.ts now '↓ behind' — your copy is stale
    MESH_HOME=$OWNER_HOME $MESH fs diff src/todos.ts   # your copy vs the room tip (read-only)
    MESH_HOME=$OWNER_HOME $MESH fs get src/todos.ts    # pull the new bytes → back to '=' in-sync

  CONFLICT RESOLUTION IS BY FILE TYPE:
    code  .ts .js .py …  →  merge      3-way auto-merge on 'fs put'; real overlaps return
                                        <<<<<<< markers, never silently lost
    prose .md .txt       →  shared      live CRDT via 'fs edit'
    any path, on demand  →  exclusive   'mesh fs lock <path>' (serialized lease; 🔒 in status)

  KICK IT OFF  (one human sentence — the whole demo)
    $ANNOUNCE_CMD

  Then: fixer wakes on 'announce' → fs grep/get to read → fixes src/todos.ts → 'fs put'
  → delivers. reviewer wakes on 'deliver' → fs get + bun test → accepts. Watch both
  planes: 'mesh log -f' (TALK) and 'mesh fs ls -f' (SHARE).
EOF
if [ -n "$NO_AGENTS" ]; then
  cat <<EOF
  (--no-agents) Drive the teammates by hand from their homes:
    fixer:     MESH_HOME=$LIVE/fixer    $MESH ...   (claim fix-toggle, fs get/put, deliver)
    reviewer:  MESH_HOME=$LIVE/reviewer $MESH ...   (fs get, accept fix-toggle)
EOF
fi
echo "  Tear down:  bash $0 --clean"
echo "════════════════════════════════════════════════════════════════════════════"

if [[ -n "$FIRE" ]]; then
  echo "Firing: announce fix-toggle"
  eval "$ANNOUNCE_CMD"
fi
