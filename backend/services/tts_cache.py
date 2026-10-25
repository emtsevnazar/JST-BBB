"""TTS-кеш: sha256(text+voice+settings) -> готовый WAV.

Sync-only LRU-кеш. Ключ = sha256(json.dumps({text, voice, settings}, sort_keys=True)).
"""

from __future__ import annotations

import hashlib
import json
import logging
import shutil
import threading
import time
from pathlib import Path

log = logging.getLogger("JST.TTSCache")

MAX_MB = 500.0
MAX_AGE_SEC = 30 * 24 * 3600

CACHE_DIR = Path(__file__).resolve().parents[2] / "output" / "_tts_cache"
CACHE_DIR.mkdir(parents=True, exist_ok=True)

_lock = threading.Lock()
_stats = {"hits": 0, "misses": 0, "puts": 0}


def _key(text, voice, settings):
    payload = json.dumps(
        {"text": text, "voice": voice, "settings": settings},
        sort_keys=True,
        ensure_ascii=False,
    )
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()


def get(text, voice, settings):
    try:
        key = _key(text, voice, settings)
        path = CACHE_DIR / (key + ".wav")
        if path.exists() and path.stat().st_size > 0:
            with _lock:
                _stats["hits"] += 1
            try:
                path.touch()
            except Exception:
                pass
            log.info("[cache] HIT %s (%d bytes)", key[:12], path.stat().st_size)
            return path
        with _lock:
            _stats["misses"] += 1
        return None
    except Exception as e:
        log.warning("[cache] get error: %s", e)
        return None


def put(text, voice, settings, wav_path):
    try:
        key = _key(text, voice, settings)
        dst = CACHE_DIR / (key + ".wav")
        shutil.copy2(str(wav_path), str(dst))
        with _lock:
            _stats["puts"] += 1
        log.info("[cache] PUT %s (%d bytes)", key[:12], dst.stat().st_size)
        _cleanup()
    except Exception as e:
        log.warning("[cache] put error: %s", e)


def stats():
    total_files = 0
    total_mb = 0.0
    try:
        for p in CACHE_DIR.glob("*.wav"):
            total_files += 1
            total_mb += p.stat().st_size / (1024 * 1024)
    except Exception:
        pass
    return {
        **_stats,
        "files": total_files,
        "total_mb": round(total_mb, 2),
    }


def _cleanup():
    try:
        now = time.time()
        files = []
        total_mb = 0.0
        for p in CACHE_DIR.glob("*.wav"):
            try:
                st = p.stat()
                if now - st.st_mtime > MAX_AGE_SEC:
                    p.unlink(missing_ok=True)
                    continue
                files.append((st.st_mtime, st.st_size, p))
                total_mb += st.st_size / (1024 * 1024)
            except Exception:
                continue
        if total_mb > MAX_MB:
            files.sort()
            target_free = total_mb - MAX_MB * 0.8
            freed = 0.0
            for _, size_b, p in files:
                if freed >= target_free:
                    break
                try:
                    p.unlink()
                    freed += size_b / (1024 * 1024)
                except Exception:
                    pass
            log.info("[cache] LRU cleanup: freed %.1f MB (was %.1f MB)", freed, total_mb)
    except Exception as e:
        log.warning("[cache] cleanup error: %s", e)
