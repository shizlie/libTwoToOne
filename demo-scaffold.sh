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
# Env:  ROOM_URL (default https://mesh-room.opensocialforall.workers.dev)   ROOM_ID (default todo-demo-<ts>)
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
# wrangler needed). Set ROOM_URL=http://localhost:8787 to boot/use a local dev room.
ROOM_URL="${ROOM_URL:-https://mesh-room.opensocialforall.workers.dev}"
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

# ── seed the SHARED WORKSPACE with the buggy todo-backend ──────────────────────────
FIXTURE=""
for cand in "$ROOT/examples/todo-backend" "$SCRIPT_DIR/todo-backend"; do
  [ -n "$cand" ] && [ -d "$cand" ] && { FIXTURE="$cand"; break; }
done
[ -n "$FIXTURE" ] || { echo "todo-backend fixture not found"; exit 1; }
echo "Seeding shared workspace from $FIXTURE ..."
( cd "$FIXTURE" && for f in src/todos.ts src/server.ts test/todos.test.ts package.json README.md; do
    [ -f "$f" ] && MESH_HOME="$OWNER_HOME" $MESH fs put "$f" --as "$f" >/dev/null
  done )
echo "Shared workspace seeded:"
MESH_HOME="$OWNER_HOME" $MESH fs ls | sed 's/^/  /'

# ── teammate setup ────────────────────────────────────────────────────────────────
# setup_teammate <id> <skill> <contract.md> <subscribe-perf> <pane>
setup_teammate() {
  local id="$1" skill="$2" contract="$3" perf="$4" pane="$5"
  local name="${id%@*}"
  local home="$LIVE/$name"
  local work="$LIVE/$name-work"
  MESH_HOME="$home" $MESH keygen --id "$id" >/dev/null
  MESH_HOME="$home" $MESH join "$ROOM_URL/v1/rooms/$ROOM_ID" "$INVITE" >/dev/null
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
    cat > "$LIVE/launch-$name.sh" <<EOF
#!/usr/bin/env bash
export MESH_HOME="$home"
export PATH="$AGENT_PATH"
cd "$work"
exec "$CLAUDE_BIN" --dangerously-skip-permissions
EOF
    chmod +x "$LIVE/launch-$name.sh"
  fi
  echo "Teammate $id ready (skill=$skill, wakes on '$perf')"
}

setup_teammate fixer@build     fix    fixer.md     announce  "$SESSION:0.0"
setup_teammate reviewer@build  review reviewer.md  deliver   "$SESSION:0.1"

# ── --simulate: CLI-drive the entire fix (no Claude), then assert it landed ─────────
simulate() {
  local fwork="$LIVE/fixer-work" rwork="$LIVE/reviewer-work" ocheck="$LIVE/owner-check"
  echo
  echo "── SIMULATE (no Claude): owner announces → fixer fixes in the shared workspace → reviewer accepts ──"
  MESH_HOME="$OWNER_HOME" $MESH announce fix-toggle --room "$ROOM_ID" \
    --body "toggle() never un-completes a todo; fix src/todos.ts" --verdict-by reviewer@build >/dev/null
  echo "[owner]    announced fix-toggle (verdict: reviewer@build)"

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
  tmux new-session  -d -s "$SESSION" -x 200 -y 50
  tmux split-window -t "$SESSION:0.0" -v
  tmux split-window -t "$SESSION:0.1" -v
  tmux select-layout -t "$SESSION:0" even-vertical
  tmux send-keys -t "$SESSION:0.2" "MESH_HOME='$OWNER_HOME' $MESH log -f --room $ROOM_ID" Enter
  tmux send-keys -t "$SESSION:0.0" "bash $LIVE/launch-fixer.sh" Enter
  tmux send-keys -t "$SESSION:0.1" "bash $LIVE/launch-reviewer.sh" Enter
  echo "Launching agents (waiting for TUIs + trust prompt) ..."
  sleep 13
  tmux send-keys -t "$SESSION:0.0" Enter; tmux send-keys -t "$SESSION:0.1" Enter
  sleep 8
  for name in fixer reviewer; do
    MESH_HOME="$LIVE/$name" $MESH inbox --mark >/dev/null 2>&1 || true
    MESH_HOME="$LIVE/$name" nohup $MESHL run --config "$LIVE/$name.yml" --foreground \
        >"/tmp/mesh-$name-daemon.log" 2>&1 &
  done
  sleep 3
  echo "Daemons running (logs: /tmp/mesh-{fixer,reviewer}-daemon.log)"
fi

# ── onboarding card ─────────────────────────────────────────────────────────────
ANNOUNCE_CMD="MESH_HOME=$OWNER_HOME $MESH announce fix-toggle --room $ROOM_ID --body \"toggle() never un-completes a todo; fix src/todos.ts\" --verdict-by reviewer@build"
cat <<EOF

════════════════════════════════════════════════════════════════════════════
  mesh shared-workspace demo is up.    Room: $ROOM_ID
  Room URL: $ROOM_URL      Invite: $INVITE      (share both to join from another machine)

  The team shares ONE live workspace (the file plane) — seeded with a buggy
  TODO backend: toggle() never un-completes a todo, so a test fails.

  HOW FILES BEHAVE IN THE SHARED WORKSPACE  (write policy, by extension)
    code   .ts .js .py .go .rs .java …  →  merge   concurrent edits 3-way
                                            auto-merge; real overlaps come
                                            back with <<<<<<< markers (never lost)
    prose  .md .txt  (READMEs, plans)   →  shared  live CRDT: everyone's edits
                                            to README.md merge in real time
    serialize one file when needed      →  mesh fs lock <path>   (exclusive lease)

  INSPECT THE WORKSPACE  (any participant, any machine — no copy, no tarball)
    MESH_HOME=$OWNER_HOME $MESH fs ls
    MESH_HOME=$OWNER_HOME $MESH fs grep "done = true"     # find the bug, server-side
    MESH_HOME=$OWNER_HOME $MESH fs get src/todos.ts       # pull just that file

  KICK IT OFF  (one human sentence — the whole demo)
    $ANNOUNCE_CMD

  Then: fixer wakes → reads the shared workspace → fixes src/todos.ts → puts it
  back (reviewer sees it LIVE) → delivers.  reviewer inspects via 'mesh fs get'
  + 'bun test' → accepts.  Watch files change with 'mesh fs ls' / 'mesh fs get'.
EOF
if [ -z "$NO_AGENTS" ]; then
  echo "  Watch the agents:  tmux attach -t $SESSION"
else
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
