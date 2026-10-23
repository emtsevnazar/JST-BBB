#!/bin/bash
cd "$(dirname "$0")"
source ../../code/bin/activate 2>/dev/null || source venv/bin/activate 2>/dev/null || true
export PYTORCH_ENABLE_MPS_FALLBACK=1
export PYTORCH_MPS_HIGH_WATERMARK_RATIO=0.0

[ -d backend ] || { echo "❌ Нет backend/"; exit 1; }
[ -d frontend ] || { echo "❌ Нет frontend/"; exit 1; }
[ -f frontend/index.html ] || { echo "❌ Нет frontend/index.html"; exit 1; }
[ -f frontend/app.js ] || { echo "❌ Нет frontend/app.js"; exit 1; }
[ -f frontend/style.css ] || { echo "❌ Нет frontend/style.css"; exit 1; }

SIZE=$(stat -f%z t3_finetuned_merged.safetensors 2>/dev/null || echo 0)
if false; then
  echo "❌ t3_finetuned_merged.safetensors слишком мал ($SIZE байт)"
  exit 1
fi

lsof -ti:8000 | xargs kill -9 2>/dev/null || true
sleep 1

echo ""
echo "═══════════════════════════════════════════"
echo "  JST · Just Start Transform"
echo "  Откройте: http://127.0.0.1:8000"
echo "═══════════════════════════════════════════"
echo ""

uvicorn backend.main:app --host 127.0.0.1 --port 8000 --log-level info
