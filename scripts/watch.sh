#!/bin/bash
# Живой мониторинг: память, health, лог
cd ~/Documents/AAC/transformation/voice_forge_studio

while true; do
  clear
  echo "═══════════ $(date '+%H:%M:%S') ═══════════"
  PID=$(lsof -ti:8000 | head -1)
  if [ -z "$PID" ]; then
    echo "❌ uvicorn НЕ запущен"
  else
    echo "✅ uvicorn PID=$PID"
    ps -p "$PID" -o rss= | awk '{printf "   RSS: %.2f GB\n", $1/1024/1024}'
  fi
  echo ""
  vm_stat | grep -E "Pages free|Pages active|Pages wired" | head -3
  echo ""
  echo "healthz: $(curl -s -o /dev/null -w '%{http_code}' --max-time 2 http://127.0.0.1:8000/healthz)"
  echo ""
  echo "─── memory.log (tail) ───"
  tail -5 logs/memory.log 2>/dev/null || echo "(нет)"
  sleep 5
done
