#!/usr/bin/env bash
# JST Studio — Emergency response (v1.8.0)
set -euo pipefail

BASE="${JST_BASE:-http://127.0.0.1:8000}"
TOKEN="${JST_ADMIN_TOKEN:-}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

usage() {
  cat <<USAGE
Usage: emergency.sh <command> [args]

Commands:
  block <ip>          — заблокировать IP (через /api/security/unblock — add ban)
  unblock <ip>        — разбанить IP
  stop                — остановить синтез (emergency stop)
  resume              — возобновить синтез
  restart             — перезапустить процесс (launchctl kickstart)
  rotate-secrets      — перегенерировать JST_ADMIN_TOKEN + JST_API_KEY
  diagnose            — собрать дамп: healthz, stats, последние 200 строк логов
  report              — полный diagnostics JSON (v1.9.0)
  report-md           — markdown-отчёт для GitHub Issue (v1.9.0)
  slow [N]            — топ медленных endpoints из audit (24h, N=10 default)
  errors              — топ error endpoints + error rate (24h)
  trace <req_id>      — полная трассировка по X-Request-ID (v1.9.2)
  backup              — бэкап output/ + voices/ + .env.local в /tmp/jst-backup-*.tar.gz
USAGE
}

_require_token() {
  if [[ -z "$TOKEN" ]]; then
    TOKEN="$(grep -E '^JST_ADMIN_TOKEN=' "$ROOT/.env.local" 2>/dev/null | cut -d= -f2 || true)"
  fi
  if [[ -z "$TOKEN" ]]; then
    echo "ERR: JST_ADMIN_TOKEN not set (export it or create .env.local)" >&2
    exit 1
  fi
}

cmd="${1:-}"; shift || true

case "$cmd" in
  block)
    _require_token
    IP="${1:?ip required}"
    # Используем internal endpoint через Python (нет публичного add-ban)
    python3 -c "
import sys; sys.path.insert(0, '$ROOT')
from backend.security.hardening import blocklist
for _ in range(5): blocklist.record_fail('$IP', 'manual')
print('blocked $IP:', blocklist.is_banned('$IP'))
"
    ;;
  unblock)
    _require_token
    IP="${1:?ip required}"
    curl -sS -X POST "$BASE/api/security/unblock" \
      -H "X-Admin-Token: $TOKEN" -H 'Content-Type: application/json' \
      -d "{\"ip\":\"$IP\"}"; echo
    ;;
  stop)
    _require_token
    curl -sS -X POST "$BASE/api/emergency/stop?reason=emergency-script" \
      -H "X-Admin-Token: $TOKEN"; echo
    ;;
  resume)
    _require_token
    curl -sS -X POST "$BASE/api/emergency/resume" -H "X-Admin-Token: $TOKEN"; echo
    ;;
  restart)
    _require_token
    curl -sS -X POST "$BASE/api/emergency/restart" -H "X-Admin-Token: $TOKEN"; echo
    ;;
  rotate-secrets)
    NEW_TOKEN=$(python3 -c "import secrets; print(secrets.token_urlsafe(32))")
    NEW_API=$(python3 -c "import secrets; print(secrets.token_urlsafe(32))")
    cp "$ROOT/.env.local" "$ROOT/.env.local.bak.$(date +%s)" 2>/dev/null || true
    printf '# rotated %s\nJST_ADMIN_TOKEN=%s\nJST_API_KEY=%s\n' \
      "$(date -u +%FT%TZ)" "$NEW_TOKEN" "$NEW_API" > "$ROOT/.env.local"
    chmod 600 "$ROOT/.env.local"
    echo "rotated. new admin token: $NEW_TOKEN"
    echo "new api key:       $NEW_API"
    echo "restart service to apply: emergency.sh restart"
    ;;
  diagnose)
    echo "=== healthz ==="; curl -sS "$BASE/healthz"; echo
    echo "=== readyz ==="; curl -sS "$BASE/readyz"; echo
    echo "=== security stats ==="; curl -sS "$BASE/api/security/stats"; echo
    echo "=== last 200 log lines ==="; tail -200 "$ROOT/logs/app.log" 2>/dev/null || true
    ;;
  report)
    # v1.9.0: полный diagnostics JSON
    curl -sS "$BASE/api/security/diagnostics" | python3 -m json.tool
    ;;
  report-md)
    # v1.9.0: markdown (для GitHub Issue)
    curl -sS "$BASE/api/security/diagnostics.md"
    ;;
  slow)
    # v1.9.0: топ медленных endpoints из audit
    LIMIT="${1:-10}"
    curl -sS "$BASE/api/security/diagnostics" | python3 -c "
import sys, json
d = json.load(sys.stdin)
rt = d.get('runtime', {})
print(f'Window: {rt.get(\"window\", \"?\")}')
print(f'Avg: {rt.get(\"avg_duration_ms\")} ms, P95: {rt.get(\"p95_duration_ms\")} ms')
print()
print(f'Top-{min(int($LIMIT), len(rt.get(\"top_slow_endpoints\", [])))} slow endpoints:')
for e in rt.get('top_slow_endpoints', [])[:int($LIMIT)]:
    print(f'  {e[\"max_duration_ms\"]:>8} ms  {e[\"method\"]:6} {e[\"path\"]}')
"
    ;;
  trace)
    # v1.9.2: трассировка по request_id
    RID="${1:?usage: emergency.sh trace <request_id>}"
    LOG="$ROOT/logs/audit.log"
    if [ ! -f "$LOG" ]; then
      echo "ERR: $LOG not found" >&2; exit 1
    fi
    grep -F "\"$RID\"" "$LOG" | python3 -c "
import sys, json
rows = []
for line in sys.stdin:
    try:
        e = json.loads(line)
        rows.append(e)
    except: pass
if not rows:
    print('No entries found for request_id')
else:
    print(f'Found {len(rows)} entries:')
    print(f'{\"ts\":<22} {\"method\":<7} {\"path\":<35} {\"status\":<6} {\"dur_ms\":<8} {\"ip\":<15}')
    print(\"-\" * 95)
    for e in rows:
        ts = e.get(\"ts\", \"-\")
        m = e.get(\"method\", \"-\")
        p = e.get(\"path\", \"-\")[:34]
        s = e.get(\"status\", 0)
        d = e.get(\"duration_ms\", 0) or 0
        ip = e.get(\"ip\", \"-\")
        print(f'{ts:<22} {m:<7} {p:<35} {s:<6} {d:<8.1f} {ip:<15}')
"
    ;;
  errors)
    # v1.9.0: топ error endpoints
    curl -sS "$BASE/api/security/diagnostics" | python3 -c "
import sys, json
d = json.load(sys.stdin)
rt = d.get('runtime', {})
print(f'Errors 5xx: {rt.get(\"errors_5xx\")} ({rt.get(\"error_rate_pct\")}%)')
print(f'Auth fails: {rt.get(\"auth_fails_401\")}')
print()
print('Top error endpoints:')
for e in rt.get('top_error_endpoints', []):
    print(f'  {e[\"errors\"]:>4} errors  {e[\"path\"]}')
"
    ;;
  backup)
    TS=$(date +%Y%m%d-%H%M%S)
    OUT="/tmp/jst-backup-$TS.tar.gz"
    tar czf "$OUT" -C "$ROOT" output/ voices/ .env.local 2>/dev/null || \
      tar czf "$OUT" -C "$ROOT" output/ voices/ 2>/dev/null || true
    chmod 600 "$OUT"
    echo "backup: $OUT"
    ;;
  ""|-h|--help|help)
    usage
    ;;
  *)
    echo "Unknown command: $cmd" >&2; usage; exit 1
    ;;
esac
