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
