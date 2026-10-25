#!/bin/bash
# v1.6.0: еженедельная очистка кешей и мусора
# Запуск: launchd раз в неделю, или вручную

set -e

LOG="$HOME/Documents/AAC/transformation/voice_forge_studio/logs/weekly_cleanup.log"
echo "=== $(date '+%Y-%m-%d %H:%M:%S') ===" >> "$LOG"

# 1. pip cache
pip cache purge 2>/dev/null | tee -a "$LOG" || true

# 2. __pycache__
find "$HOME/Documents/AAC/transformation/voice_forge_studio" -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
echo "✅ __pycache__ удалены" >> "$LOG"

# 3. .pytest_cache
rm -rf "$HOME/Documents/AAC/transformation/voice_forge_studio/.pytest_cache" 2>/dev/null || true
echo "✅ .pytest_cache удалён" >> "$LOG"

# 4. cargo cache (если > 500 MB)
CARGO_SIZE=$(du -sm ~/.cargo/registry 2>/dev/null | awk '{print $1}' || echo "0")
if [ "$CARGO_SIZE" -gt 500 ]; then
  rm -rf ~/.cargo/registry/cache ~/.cargo/registry/src 2>/dev/null || true
  echo "✅ cargo cache очищен (было ${CARGO_SIZE}MB)" >> "$LOG"
fi

# 5. HF cache — только модели > 30 дней без изменений
if [ -d "$HOME/.cache/huggingface/hub" ]; then
  find "$HOME/.cache/huggingface/hub/models--*" -maxdepth 0 -mtime +30 2>/dev/null | while read -r d; do
    echo "  → удаляю старую модель: $(basename "$d")" >> "$LOG"
    rm -rf "$d"
  done
fi

# 6. Логи старше 30 дней
find "$HOME/Documents/AAC/transformation/voice_forge_studio/logs" -name "*.log.*" -mtime +30 -delete 2>/dev/null || true
echo "✅ старые логи удалены" >> "$LOG"

# 7. Итог: размер проекта
echo "Размер проекта: $(du -sh "$HOME/Documents/AAC/transformation/voice_forge_studio" | awk '{print $1}')" >> "$LOG"
echo "Размер HF cache: $(du -sh ~/.cache/huggingface 2>/dev/null | awk '{print $1}' || echo 'n/a')" >> "$LOG"
echo "=== done ===" >> "$LOG"
