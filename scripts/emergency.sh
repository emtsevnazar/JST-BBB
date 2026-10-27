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
  backup [--encrypt] [--keep N] [--paths "a,b,c"]
                      — encrypted backup в ~/.jst-backups/ (rotation keep N=7)
  restore <file>      — восстановить из backup (auto-decrypt если .enc)
  list-backups        — показать существующие бэкапы
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
    # v1.9.3: auto-backup .env.local before rotation
    echo "[rotate-secrets] creating encrypted backup of current .env.local..."
    "$0" backup --encrypt --paths ".env.local" --keep 10 >/dev/null 2>&1 || \
      echo "WARN: backup failed, continuing" >&2

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
    # v1.9.3: encrypted backup with rotation
    # usage: backup [--encrypt] [--keep N] [--paths "output,voices,.env.local"]
    ENCRYPT=0
    KEEP=7
    PATHS="output voices .env.local"

    while [[ $# -gt 0 ]]; do
      case "$1" in
        --encrypt) ENCRYPT=1; shift ;;
        --keep)    KEEP="$2"; shift 2 ;;
        --paths)   PATHS="${2//,/ }"; shift 2 ;;
        *) echo "Unknown backup arg: $1" >&2; exit 1 ;;
      esac
    done

    BACKUP_DIR="${JST_BACKUP_DIR:-$HOME/.jst-backups}"
    mkdir -p "$BACKUP_DIR"
    chmod 700 "$BACKUP_DIR"

    TS=$(date +%Y%m%d-%H%M%S)

    if [[ "$ENCRYPT" -eq 1 ]]; then
      KEY_FILE="${JST_BACKUP_KEY:-$HOME/.jst-backup-key}"
      if [[ ! -f "$KEY_FILE" ]]; then
        openssl rand -base64 32 > "$KEY_FILE"
        chmod 600 "$KEY_FILE"
        echo "WARN: generated new key at $KEY_FILE — KEEP THIS SAFE (no key = no restore)" >&2
      fi
      OUT="$BACKUP_DIR/jst-$TS.tar.gz.enc"
      tar czf - -C "$ROOT" $PATHS 2>/dev/null | \
        openssl enc -aes-256-cbc -pbkdf2 -salt -pass "file:$KEY_FILE" -out "$OUT"
    else
      OUT="$BACKUP_DIR/jst-$TS.tar.gz"
      tar czf "$OUT" -C "$ROOT" $PATHS 2>/dev/null
    fi

    if [[ -f "$OUT" ]]; then
      chmod 600 "$OUT"
      SIZE=$(du -h "$OUT" | awk '{print $1}')
      echo "backup: $OUT ($SIZE, encrypt=$ENCRYPT)"
    else
      echo "ERR: backup file not created" >&2; exit 1
    fi

    # rotation: keep only last $KEEP
    if [[ "$KEEP" -gt 0 ]]; then
      REMOVED=0
      while IFS= read -r f; do
        rm -f "$f"
        REMOVED=$((REMOVED + 1))
      done < <(ls -t "$BACKUP_DIR"/jst-*.tar.gz* 2>/dev/null | tail -n +$((KEEP + 1)))
      [[ "$REMOVED" -gt 0 ]] && echo "rotated: $REMOVED old backup(s) removed"
    fi
    ;;

  restore)
    # v1.9.3: restore from backup
    FILE="${1:?usage: emergency.sh restore <backup_file>}"
    [[ ! -f "$FILE" ]] && { echo "ERR: $FILE not found" >&2; exit 1; }

    if [[ "$FILE" == *.enc ]]; then
      KEY_FILE="${JST_BACKUP_KEY:-$HOME/.jst-backup-key}"
      [[ ! -f "$KEY_FILE" ]] && { echo "ERR: key not found: $KEY_FILE" >&2; exit 1; }
      openssl enc -d -aes-256-cbc -pbkdf2 -pass "file:$KEY_FILE" -in "$FILE" | \
        tar xzf - -C "$ROOT"
    else
      tar xzf "$FILE" -C "$ROOT"
    fi
    echo "restored from $FILE -> $ROOT"
    ;;

  list-backups)
    BACKUP_DIR="${JST_BACKUP_DIR:-$HOME/.jst-backups}"
    if [[ ! -d "$BACKUP_DIR" ]]; then
      echo "(no backups dir: $BACKUP_DIR)"
      exit 0
    fi
    ls -lh "$BACKUP_DIR"/jst-* 2>/dev/null || echo "(no backups yet)"
    ;;
  ""|-h|--help|help)
    usage
    ;;
  *)
    echo "Unknown command: $cmd" >&2; usage; exit 1
    ;;
esac
