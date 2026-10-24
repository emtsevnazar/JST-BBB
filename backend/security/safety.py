"""
JST Safety Module v2.0
- Валидация текста, имён, режимов, языков
- Защита от path traversal
- Rate limiter (in-memory, per-key)
- Валидация файлов (MIME, размер, расширение)
- Sanitization HTML
- Circuit breaker для TTS-моделей
- Безопасное логирование
- Fallback-цепочка
"""
from __future__ import annotations

import logging
import re
import time
import unicodedata
from pathlib import Path

log = logging.getLogger("JST.Safety")

# ============================================================
# 1. ВАЛИДАЦИЯ ТЕКСТА
# ============================================================
MAX_TEXT_LEN = 5000
MIN_TEXT_LEN = 1
CTRL_CHARS = re.compile(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]')

def validate_text(text: str, max_len: int = MAX_TEXT_LEN) -> str:
    """Проверка текста: длина, кодировка, контрольные символы."""
    if not isinstance(text, str):
        raise ValueError("Текст должен быть строкой")
    text = unicodedata.normalize("NFC", text)
    text = CTRL_CHARS.sub("", text).strip()
    if len(text) < MIN_TEXT_LEN:
        raise ValueError("Текст пустой")
    if len(text) > max_len:
        raise ValueError(f"Текст слишком длинный ({len(text)} > {max_len})")
    return text

def validate_voice_name(name: str) -> str:
    """Имена голосов: только [a-zA-Z0-9_-], 1-64 символа."""
    if not name or not isinstance(name, str):
        raise ValueError("Имя голоса пустое")
    if len(name) > 64:
        raise ValueError("Имя голоса слишком длинное")
    if not re.fullmatch(r'[a-zA-Z0-9_\-]+', name):
        raise ValueError("Имя голоса: только a-z, A-Z, 0-9, _, -")
    return name

def validate_mode(mode: str) -> str:
    ALLOWED = {"core", "multi", "jst_clone", "voxcpm", "qwen", "cosyvoice"}
    if mode not in ALLOWED:
        raise ValueError(f"Недопустимый режим: {mode}")
    return mode

def validate_language(lang: str) -> str:
    if lang not in {"ru", "en"}:
        raise ValueError(f"Язык '{lang}' не поддерживается (ru, en)")
    return lang

# ============================================================
# 2. PATH TRAVERSAL
# ============================================================
def safe_path(base: Path, requested: str) -> Path:
    base = base.resolve()
    candidate = (base / requested).resolve()
    if not str(candidate).startswith(str(base) + "/") and candidate != base:
        raise ValueError(f"Path traversal: {requested}")
    return candidate

# ============================================================
# 3. RATE LIMITER
# ============================================================
class RateLimiter:
    def __init__(self, per_minute: int = 60, window: float = 60.0):
        self.per_minute = per_minute
        self.window = window
        self._hits: dict[str, list[float]] = {}

    def check(self, key: str = "global") -> bool:
        now = time.time()
        hits = [t for t in self._hits.get(key, []) if now - t < self.window]
        if len(hits) >= self.per_minute:
            self._hits[key] = hits
            return False
        hits.append(now)
        self._hits[key] = hits
        return True

    def remaining(self, key: str = "global") -> int:
        now = time.time()
        hits = [t for t in self._hits.get(key, []) if now - t < self.window]
        return max(0, self.per_minute - len(hits))

limiter = RateLimiter(per_minute=60)

# ============================================================
# 4. ВАЛИДАЦИЯ ФАЙЛОВ
# ============================================================
ALLOWED_AUDIO_EXT = {".wav", ".mp3", ".m4a", ".opus", ".flac", ".ogg"}
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50 MB
MAGIC_BYTES = {
    b"RIFF": "wav",
    b"ID3":  "mp3",
    b"\xff\xfb": "mp3",
    b"\xff\xf3": "mp3",
    b"\xff\xf2": "mp3",
    b"OggS": "opus/ogg",
    b"fLaC": "flac",
    b"\x00\x00\x00": "m4a",  # ftyp box
}

def validate_audio_file(filename: str, content: bytes) -> str:
    """Проверка расширения, размера, magic bytes."""
    if not filename:
        raise ValueError("Имя файла пустое")
    ext = Path(filename).suffix.lower()
    if ext not in ALLOWED_AUDIO_EXT:
        raise ValueError(f"Недопустимое расширение: {ext} (разрешены: {', '.join(ALLOWED_AUDIO_EXT)})")
    if len(content) > MAX_FILE_SIZE:
        raise ValueError(f"Файл слишком большой ({len(content)//1024//1024} MB > 50 MB)")
    if len(content) < 100:
        raise ValueError("Файл слишком маленький (возможно, пустой)")
    # Проверка magic bytes
    head = content[:12]
    is_valid = False
    for magic in MAGIC_BYTES:
        if head.startswith(magic):
            is_valid = True
            break
    # m4a/fmp4 — ftyp на 4-8 позиции
    if not is_valid and b"ftyp" in head:
        is_valid = True
    if not is_valid:
        # Не блокируем жёстко, только логируем предупреждение (браузеры могут отправлять без magic)
        log.warning(f"Magic bytes не совпали для {filename}: {head[:8].hex()}")
    return ext.lstrip(".")

# ============================================================
# 5. SANITIZE HTML
# ============================================================
def sanitize_html(text: str) -> str:
    """Простое экранирование HTML-тегов (для вывода в UI)."""
    if not isinstance(text, str):
        return ""
    return (text.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace('"', "&quot;")
                .replace("'", "&#x27;"))

# ============================================================
# 6. CIRCUIT BREAKER
# ============================================================
class CircuitBreaker:
    """Отключает модель после N подряд ошибок на T секунд."""
    def __init__(self, threshold: int = 3, timeout: float = 30.0):
        self.threshold = threshold
        self.timeout = timeout
        self._failures: dict[str, int] = {}
        self._opened_at: dict[str, float] = {}

    def is_open(self, key: str) -> bool:
        if key not in self._opened_at:
            return False
        if time.time() - self._opened_at[key] > self.timeout:
            # Пробуем закрыть
            del self._opened_at[key]
            self._failures[key] = 0
            return False
        return True

    def record_success(self, key: str) -> None:
        self._failures[key] = 0
        self._opened_at.pop(key, None)

    def record_failure(self, key: str) -> None:
        self._failures[key] = self._failures.get(key, 0) + 1
        if self._failures[key] >= self.threshold:
            self._opened_at[key] = time.time()
            log.warning(f"[CircuitBreaker] {key} открыт на {self.timeout}s")

    def status(self) -> dict:
        return {
            "failures": dict(self._failures),
            "open": list(self._opened_at.keys()),
        }

breaker = CircuitBreaker(threshold=3, timeout=30.0)

# ============================================================
# 7. БЕЗОПАСНОЕ ЛОГИРОВАНИЕ
# ============================================================
def safe_log(msg: str, max_len: int = 500) -> str:
    if not isinstance(msg, str):
        msg = str(msg)
    return CTRL_CHARS.sub("?", msg)[:max_len]

# ============================================================
# 8. FALLBACK
# ============================================================
def fallback_chain(primary: str) -> list[str]:
    chains = {
        "voxcpm":    ["voxcpm", "multi", "core"],
        "qwen":      ["qwen", "multi", "core"],
        "cosyvoice": ["cosyvoice", "multi", "core"],
        "jst_clone": ["jst_clone", "voxcpm", "multi", "core"],
        "multi":     ["multi", "core"],
        "core":      ["core"],
    }
    return chains.get(primary, ["core"])

# ============================================================
# 9. STARTUP CHECK
# ============================================================
def startup_check(root: Path) -> dict:
    pretrained = Path.home() / "Documents/AAC/main/pretrained_models"
    checks = {
        "pretrained_models": pretrained.exists(),
        "output_dir":        (root / "output").exists() or (root / "output").mkdir(parents=True, exist_ok=True) is None,
        "voices_dir":        (root / "voices").exists(),
        "ffmpeg":            _which("ffmpeg"),
        "voxcpm2":           (pretrained / "VoxCPM2" / "model.safetensors").exists(),
        "cosyvoice":         (pretrained / "CosyVoice-300M").exists(),
        "multi_weights":     (pretrained / "t3_mtl23ls_v2.safetensors").exists(),
    }
    log.info(f"Startup check: {checks}")
    return checks

def _which(cmd: str) -> bool:
    import shutil
    return shutil.which(cmd) is not None

# ============================================================
# 10. SAFE TTS CALL (с circuit breaker + fallback)
# ============================================================
def safe_tts_call(fn, *args, mode: str = "core", **kwargs):
    """
    Безопасно вызывает TTS-функцию с fallback-цепочкой и circuit breaker.
    Возвращает (result, actual_mode).
    """
    last_err = None
    for candidate in fallback_chain(mode):
        if breaker.is_open(candidate):
            log.warning("[safe_tts] %s пропущен (breaker open)", candidate)
            continue
        try:
            log.info("[safe_tts] попытка mode=%s", candidate)
            result = fn(*args, mode=candidate, **kwargs)
            if result is not None:
                breaker.record_success(candidate)
                return result, candidate
        except Exception as e:
            last_err = e
            breaker.record_failure(candidate)
            log.warning("[safe_tts] %s упал: %s", candidate, safe_log(str(e)))
    raise RuntimeError(f"Все модели не сработали. Последняя ошибка: {safe_log(str(last_err))}")

