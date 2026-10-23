#!/bin/bash
# JST Studio v2 launcher — с проверками
set -e
cd "$(dirname "$0")"

MODELS="$HOME/Documents/AAC/main/pretrained_models"

echo "═══════════════════════════════════════════"
echo "  JST · Just Start Transform"
echo "═══════════════════════════════════════════"

# 1. venv
if [ -d "../../code/bin" ]; then
  source ../../code/bin/activate
elif [ -d ".venv312/bin" ]; then
  source .venv312/bin/activate
else
  echo "❌ Нет активируемого venv (code/bin или .venv312/bin)"
  exit 1
fi
echo "✅ venv: $(which python)"

# 2. Файлы Multi
MISSING=0
for f in t3_mtl23ls_v2.safetensors s3gen.pt conds.pt ve.pt \
         Cangjie5_TC.json grapheme_mtl_merged_expanded_v1.json tokenizer.json; do
  if [ ! -f "$MODELS/$f" ]; then
    echo "❌ Нет $MODELS/$f"
    MISSING=1
  fi
done
if [ $MISSING -eq 1 ]; then
  echo ""
  echo "⛔ Multi не запустится. Скачайте недостающие файлы:"
  echo "   python -c \"from huggingface_hub import snapshot_download; snapshot_download('ResembleAI/chatterbox', local_dir='$MODELS')\""
  exit 1
fi
echo "✅ Все файлы Multi на месте"

# 3. Синтаксис backend
for py in backend/*.py; do
  if ! python -c "import ast; ast.parse(open('$py').read())" 2>/dev/null; then
    echo "❌ Синтаксическая ошибка: $py"
    python -c "import ast; ast.parse(open('$py').read())"
    exit 1
  fi
done
echo "✅ Все backend-модули синтаксически валидны"

# 4. Загрузить .env (если есть) — HOST, PORT, HF_TOKEN, HF_HOME, PYTORCH_*
if [ -f ".env" ]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
  echo "✅ Загружен .env"
fi

HOST="${HOST:-127.0.0.1}"
PORT="${PORT:-8000}"

# 5. Порт
lsof -ti:$PORT | xargs kill -9 2>/dev/null || true
sleep 1

echo ""
echo "🚀 Запуск на http://$HOST:$PORT"
echo ""
# PYTORCH_ENABLE_MPS_FALLBACK и PYTORCH_MPS_HIGH_WATERMARK_RATIO
# выставляются в backend/core/config.py (читаются из .env или defaults)
uvicorn backend.main:app --host "$HOST" --port "$PORT" --log-level info
