#!/usr/bin/env bash
# live-demo.sh — prove ACTIVE agent participation end-to-end.
#
# Stages the canonical /goal with REAL agents (no scripted decisions):
#
#   human (you) ── "I need a homepage" (request) ──▶ room
#   hermes@router  (live Claude, woken by its daemon on `request`)
#                  reads the request, decides the task, `mesh announce homepage`
#   webby@frontend (live Claude, woken by its daemon on `announce`)
#                  `mesh claim homepage` → builds index.html → `mesh deliver`
#   you            `mesh accept homepage` → DONE
#
# Every claim/build/deliver is the agent's OWN decision, driven by its operating
# contract (examples/agent-prompts/{router,frontend}.md loaded as CLAUDE.md)
# and triggered purely by the listener daemon injecting into its live tmux pane.
#
# Requirements on this machine: tmux, bun, and a logged-in `claude` (Claude Max /
# API). `pi`/`omp` work too — swap the adapter + launch binary.
#
# Usage:
#   bash scripts/live-demo.sh            # set up + launch agents, print trigger
#   bash scripts/live-demo.sh --fire     # also post "I need a homepage" for you
#   bash scripts/live-demo.sh --clean    # tear down tmux + state and exit
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# Repo mode when launched from a source checkout (this script lives in <repo>/scripts/);
# otherwise "installed mode": run the published mesh/meshl, with the agent prompts that
# ship next to this script in the public demo bundle.
if [ -f "$SCRIPT_DIR/../packages/cli/src/main.ts" ]; then
  ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
else
  ROOT=""
fi
# Default to the hosted room so installed-mode teammates work out of the box. Set
# ROOM_URL=http://localhost:8787 (source checkout) to boot/use a local dev room, or point
# it at the workers.dev staging room for testing.
ROOM_URL="${ROOM_URL:-https://usemesh.dev}"
ROOM_ID="${ROOM_ID:-homepage-demo-$(date +%s)}"
LIVE="${MESH_LIVE_HOME:-$HOME/.mesh-live}"
SESSION="meshlive"
# Prefer mesh/meshl on PATH (installed via `bun add -g github:shizlie/lib-mesh-room`);
# fall back to the repo source when running from a checkout.
if command -v mesh >/dev/null 2>&1 && command -v meshl >/dev/null 2>&1; then
  MESH="$(command -v mesh)"; MESHL="$(command -v meshl)"
elif [ -n "$ROOT" ]; then
  MESH="bun $ROOT/packages/cli/src/main.ts"; MESHL="bun $ROOT/packages/daemon/src/main.ts"
else
  echo "mesh/meshl not found. Install them first:  bun add -g github:shizlie/lib-mesh-room" >&2
  exit 1
fi
CLAUDE_BIN="$(command -v claude || true)"
# Full PATH captured here is baked into each agent launcher (tmux panes otherwise
# start with a minimal PATH missing claude/node/bun).
AGENT_PATH="$LIVE/bin:$PATH"

# ── teardown ────────────────────────────────────────────────────────────────────
clean() {
  tmux kill-session -t "$SESSION" 2>/dev/null || true
  pkill -f "$LIVE/" 2>/dev/null || true
  rm -rf "$LIVE"
  echo "cleaned: tmux session '$SESSION', daemons, $LIVE"
}
if [[ "${1:-}" == "--clean" ]]; then clean; exit 0; fi

FIRE=""; [[ "${1:-}" == "--fire" ]] && FIRE=1

[[ -n "$CLAUDE_BIN" ]] || { echo "claude not found on PATH"; exit 1; }
command -v tmux >/dev/null || { echo "tmux not found"; exit 1; }

# ── room ────────────────────────────────────────────────────────────────────────
if ! curl -fsS -m 2 "$ROOM_URL/healthz" >/dev/null 2>&1; then
  if [ -n "$ROOT" ]; then
    echo "Booting room (wrangler dev) at $ROOM_URL ..."
    ( cd "$ROOT/packages/room" && bunx wrangler dev --port 8787 >/tmp/mesh-live-room.log 2>&1 ) &
    for _ in $(seq 1 40); do curl -fsS -m 2 "$ROOM_URL/healthz" >/dev/null 2>&1 && break; sleep 1; done
  else
    echo "No room reachable at $ROOM_URL." >&2
    echo "Point ROOM_URL at a deployed room and re-run, e.g.:" >&2
    echo "  ROOM_URL=https://mesh-room.<account>.workers.dev bash live-demo.sh" >&2
    exit 1
  fi
fi
curl -fsS -m 2 "$ROOM_URL/healthz" >/dev/null 2>&1 || { echo "room failed (see /tmp/mesh-live-room.log if booting locally)"; exit 1; }
echo "Room healthy: $ROOM_URL"

rm -rf "$LIVE"; mkdir -p "$LIVE/bin"

# mesh shim — inherits MESH_HOME from the calling pane/agent env.
cat > "$LIVE/bin/mesh" <<EOF
#!/usr/bin/env bash
exec $MESH "\$@"
EOF
chmod +x "$LIVE/bin/mesh"

# ── owner / human ────────────────────────────────────────────────────────────────
export MESH_HOME="$LIVE/harry"
$MESH keygen --id harry@hcproduct >/dev/null
# create-room auto-joins the owner on current CLIs, but we still run an explicit join:
# it is idempotent (reconnect path) and keeps the demo working against older published
# CLIs that predate auto-join. We also parse the invite — the agents below join with it.
INVITE="$($MESH create-room "$ROOM_ID" --owner harry@hcproduct --url "$ROOM_URL" | awk '/Invite:/{print $NF}')"
$MESH join "$ROOM_URL/v1/rooms/$ROOM_ID" "$INVITE" >/dev/null
echo "Owner harry@hcproduct created room $ROOM_ID"
# S-K5/S-K6: new-room genesis is write-closed; this open-collab demo lets agents
# write the shared workspace, so the owner opens the write posture explicitly.
$MESH fs config write open >/dev/null

# ── seed the room charter (Intent I: situated arrival guidance) ────────────────
CHARTER_DIR="$LIVE/charter"
mkdir -p "$CHARTER_DIR/roles"
cat > "$CHARTER_DIR/room.md" <<'EOF'
# homepage-demo — room charter

A human brings work in plain language; the router turns it into a concrete, claimable task;
whichever capable agent is listening claims and delivers it; the human who asked for it rules
on the result.

## Wake signal

A listener daemon watches the room on your behalf. Every `[mesh]` line injected into your
session — including the `[mesh] briefing — …` arrival pointer — is a wake signal. On every
wake, your FIRST action is:

    mesh inbox --mark

Fetch this room charter plus your bound seat's contract plus your current situation in one
call:

    mesh brief

## Task lifecycle

Tasks move `ANNOUNCED → CLAIMED → DELIVERED → DONE` (or back to `ANNOUNCED` on `reject`).
Only the task's named verdict authority — normally the human who requested it — may
`accept`/`reject` a delivery.
EOF
cat > "$CHARTER_DIR/roles/router.md" <<'EOF'
# router — seat contract

You turn a human's plain-language `request` into ONE concrete, claimable task and stop — you
do not build it yourself. Give it a short kebab-case task ref, state exactly what to build in
the body, and make the requester the verdict holder (`--verdict-by <their id>`). Before
announcing, check `mesh state`/inbox — never announce the same request twice.

## Hard constraints

- ONLY `announce`. NEVER `claim`, `deliver`, `accept`, or `reject`.
- Do not implement the work yourself. You route; others build.
- After acting on a wake, stop. Do not poll, loop, or invent work.
EOF
cat > "$CHARTER_DIR/roles/frontend.md" <<'EOF'
# frontend — seat contract

For each task still `ANNOUNCED` whose work is a page/UI or wiring a page to an API, claim it
immediately — first valid claim wins (CAS); a `claim_conflict` means another agent won the
race, not an error. Hold one claim at a time; server/API-implementation tasks are not yours.

Build real, self-contained output (no placeholders), then `mesh deliver <task_ref> --dir .
--body "…"` — a delivery with no directory/artifact is rejected by the room. On `reject`,
read why (`mesh inbox`), fix, and re-deliver.

## Hard constraints

- NEVER `announce` tasks — announcements come from the router/human.
- NEVER `accept` or `reject` — you are not a verdict holder; the room will reject it.
- After acting on a wake, stop. Do not poll, loop, or invent work.
EOF
MESH_HOME="$LIVE/harry" $MESH fs put "$CHARTER_DIR/room.md" --as charter/room.md >/dev/null
MESH_HOME="$LIVE/harry" $MESH fs put "$CHARTER_DIR/roles/router.md" --as charter/roles/router.md >/dev/null
MESH_HOME="$LIVE/harry" $MESH fs put "$CHARTER_DIR/roles/frontend.md" --as charter/roles/frontend.md >/dev/null
echo "Room charter seeded: charter/room.md, charter/roles/{router,frontend}.md"

# Locate an agent operating-contract markdown: repo examples in repo mode, else the
# copy that ships alongside this script in the published demo bundle.
find_contract() {
  local name="$1"
  if [ -n "$ROOT" ] && [ -f "$ROOT/examples/agent-prompts/$name" ]; then
    echo "$ROOT/examples/agent-prompts/$name"
  elif [ -f "$SCRIPT_DIR/$name" ]; then
    echo "$SCRIPT_DIR/$name"
  else
    return 1
  fi
}

# setup_agent <id> <skill> <contract.md> <subscribe-perf> <pane>
setup_agent() {
  local id="$1" skill="$2" contract="$3" perf="$4" pane="$5"
  local name="${id%@*}"
  local home="$LIVE/$name"
  local work="$LIVE/$name-work"

  MESH_HOME="$home" $MESH keygen --id "$id" >/dev/null
  MESH_HOME="$home" $MESH join "$ROOM_URL/v1/rooms/$ROOM_ID" "$INVITE" >/dev/null

  # Intent G role bind, named after the part of $id after '@' ("router"/"frontend" — this
  # demo's ids are <name>@<domain>, not <seat>@<team>), so charter/roles/<seat>.md (seeded
  # above) is reachable via `mesh brief` — binding-sourced role resolution reads GET
  # /roles, never roster.roles, so without this bind the seeded charter is unreachable.
  local role="${id#*@}"
  MESH_HOME="$LIVE/harry" $MESH fs role "$id" "$role" >/dev/null

  mkdir -p "$work"
  local contract_src; contract_src="$(find_contract "$contract")" || { echo "agent prompt '$contract' not found" >&2; exit 1; }
  cp "$contract_src" "$work/CLAUDE.md"

  cat > "$LIVE/launch-$name.sh" <<EOF
#!/usr/bin/env bash
export MESH_HOME="$home"
export PATH="$AGENT_PATH"
cd "$work"
exec "$CLAUDE_BIN" --dangerously-skip-permissions
EOF
  chmod +x "$LIVE/launch-$name.sh"

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
  echo "Agent $id ready (skill=$skill, wakes on '$perf', pane=$pane)"
}

setup_agent hermes@router   routing  router.md          request  "$SESSION:0.0"
setup_agent webby@frontend  frontend frontend.md        announce "$SESSION:0.1"

# ── tmux stage: router | worker | talk feed + share view ─────────────────────────
tmux kill-session -t "$SESSION" 2>/dev/null || true
tmux new-session  -d -s "$SESSION" -x 200 -y 50
tmux split-window -t "$SESSION:0.0" -v
tmux split-window -t "$SESSION:0.1" -v
tmux select-layout -t "$SESSION:0" even-vertical
tmux send-keys -t "$SESSION:0.2" "MESH_HOME='$LIVE/harry' $MESH log -f --room $ROOM_ID" Enter
# Share plane, live: the workspace tree + leases + hydration next to the talk feed —
# watch webby's delivered files appear in the metadata tree as they land.
tmux split-window -t "$SESSION:0.2" -h
tmux send-keys -t "$SESSION:0.3" "MESH_HOME='$LIVE/harry' $MESH fs ls -f --room $ROOM_ID --into '$LIVE/harry-fs'" Enter

# Launch both live Claude agents and accept the folder-trust prompt.
tmux send-keys -t "$SESSION:0.0" "bash $LIVE/launch-hermes.sh" Enter
tmux send-keys -t "$SESSION:0.1" "bash $LIVE/launch-webby.sh" Enter
echo "Launching agents (waiting for TUIs + trust prompt) ..."
sleep 13
tmux send-keys -t "$SESSION:0.0" Enter
tmux send-keys -t "$SESSION:0.1" Enter
sleep 8

# Drain read cursors so the demo trigger is clean, then start the daemons.
for name in hermes webby; do
  MESH_HOME="$LIVE/$name" $MESH inbox --mark >/dev/null 2>&1 || true
  MESH_HOME="$LIVE/$name" nohup $MESHL run --config "$LIVE/$name.yml" --foreground \
      >"/tmp/mesh-$name-daemon.log" 2>&1 &
done
sleep 3
echo "Daemons running (logs: /tmp/mesh-{hermes,webby}-daemon.log)"

cat <<EOF

────────────────────────────────────────────────────────────────────
Live agent mesh is up.  Room: $ROOM_ID

Watch it:   tmux attach -t $SESSION
            (pane 0 = router agent, pane 1 = worker agent,
             pane 2 = room log — the talk feed, pane 3 = live workspace — the share view)

Trigger it (this is the whole demo — one human sentence):
  MESH_HOME=$LIVE/harry $MESH post --room $ROOM_ID "I need a homepage"

Then the router announces, the worker claims + builds + delivers. Accept it:
  MESH_HOME=$LIVE/harry $MESH accept homepage --room $ROOM_ID --body "ship it"

Tear down:  bash $0 --clean
────────────────────────────────────────────────────────────────────
EOF

if [[ -n "$FIRE" ]]; then
  echo "Firing the trigger: \"I need a homepage\""
  MESH_HOME="$LIVE/harry" $MESH post --room $ROOM_ID "I need a homepage"
fi
