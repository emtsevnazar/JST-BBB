#!/usr/bin/env bash
# JST Studio — daily encrypted backup (cron/launchd wrapper, v1.9.3)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TS=$(date -u +%FT%TZ)

echo "[$TS] starting daily backup"
"$ROOT/scripts/emergency.sh" backup --encrypt --keep 7 --paths "output,voices,.env.local" || {
    echo "[$TS] backup FAILED" >&2
    exit 1
}
echo "[$TS] done"
