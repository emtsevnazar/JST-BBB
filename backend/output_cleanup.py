"""P7.2: Output directory TTL cleanup.

Фоновая очистка output/:
- файлы старше JST_OUTPUT_TTL_DAYS (default 7)
- при превышении JST_OUTPUT_MAX_MB (default 500) — самые старые до 80%
"""

from __future__ import annotations

import asyncio
import logging
import os
import time
from pathlib import Path

log = logging.getLogger("JST.Cleanup")

_AUDIO_EXTS = {".wav", ".mp3", ".ogg", ".flac", ".m4a", ".aac"}

# v1.3.1: orphan temp-файлы (от ZIP / merged) — удаляем через 10 минут
_ORPHAN_TTL_SEC = 10 * 60
_ORPHAN_PATTERNS = (".jst_all_*.zip", ".jst_hist_*.zip")
_ORPHAN_FIXED = (".concat_list.txt", "ALL_MERGED.wav")


def _get_output_dir() -> Path:
    try:
        from .core.paths import OUTPUT  # type: ignore

        return Path(OUTPUT)
    except Exception:
        return Path("output")


_PROTECTED_PREFIXES = (
    "merged_reference_",  # v1.6.9: кеш референса — не удалять (пересборка 15-20с)
)


def _is_audio(p: Path) -> bool:
    try:
        if not p.is_file():
            return False
        if p.suffix.lower() not in _AUDIO_EXTS:
            return False
        # v1.6.9: НЕ трогать кеш референсов
        return not any(p.name.startswith(pref) for pref in _PROTECTED_PREFIXES)
    except Exception:
        return False


async def cleanup_once(ttl_days: int | None = None, max_mb: int | None = None) -> dict:
    if ttl_days is None:
        ttl_days = int(os.getenv("JST_OUTPUT_TTL_DAYS", "3"))
    if max_mb is None:
        max_mb = int(os.getenv("JST_OUTPUT_MAX_MB", "200"))

    out_dir = _get_output_dir()
    if not out_dir.exists():
        return {
            "deleted_by_ttl": 0,
            "deleted_by_size": 0,
            "freed_mb": 0.0,
            "total_mb": 0.0,
            "ttl_days": ttl_days,
            "max_mb": max_mb,
        }

    now = time.time()
    ttl_sec = ttl_days * 86400
    deleted_ttl = 0
    freed = 0

    try:
        audio_files = [p for p in out_dir.iterdir() if _is_audio(p)]
    except Exception as e:
        log.warning(f"cleanup: cannot list {out_dir}: {e}")
        audio_files = []

    # 1. TTL
    if ttl_sec > 0:
        for p in audio_files:
            try:
                st = p.stat()
                if now - st.st_mtime > ttl_sec:
                    p.unlink()
                    deleted_ttl += 1
                    freed += st.st_size
            except FileNotFoundError:
                continue
            except Exception as e:
                log.warning(f"cleanup TTL: {p}: {e}")

    # 2. Size cap
    deleted_size = 0
    if max_mb > 0:
        remaining = [p for p in audio_files if p.exists()]
        try:
            total = sum(p.stat().st_size for p in remaining)
        except Exception:
            total = 0
        max_bytes = max_mb * 1024 * 1024
        if total > max_bytes:
            try:
                remaining.sort(key=lambda p: p.stat().st_mtime)
            except Exception:
                pass
            target = int(max_bytes * 0.8)
            for p in remaining:
                if total <= target:
                    break
                try:
                    st = p.stat()
                    p.unlink()
                    total -= st.st_size
                    freed += st.st_size
                    deleted_size += 1
                except FileNotFoundError:
                    continue
                except Exception as e:
                    log.warning(f"cleanup size: {p}: {e}")

    try:
        total_after = sum(p.stat().st_size for p in out_dir.iterdir() if _is_audio(p))
    except Exception:
        total_after = 0

    # 3. v1.3.1: orphan temp-файлы
    deleted_orphan = 0
    try:
        now2 = time.time()
        for pat in _ORPHAN_PATTERNS:
            for p in out_dir.glob(pat):
                try:
                    st = p.stat()
                    if now2 - st.st_mtime > _ORPHAN_TTL_SEC:
                        p.unlink()
                        deleted_orphan += 1
                        freed += st.st_size
                except FileNotFoundError:
                    continue
                except Exception as e:
                    log.warning(f"cleanup orphan {p}: {e}")
        for name in _ORPHAN_FIXED:
            p = out_dir / name
            try:
                if p.exists():
                    st = p.stat()
                    if now2 - st.st_mtime > _ORPHAN_TTL_SEC:
                        p.unlink()
                        deleted_orphan += 1
                        freed += st.st_size
            except FileNotFoundError:
                continue
            except Exception as e:
                log.warning(f"cleanup orphan {p}: {e}")
    except Exception as e:
        log.warning(f"cleanup orphan: {e}")

    try:
        files_after = sum(1 for p in out_dir.iterdir() if _is_audio(p))
    except Exception:
        files_after = 0
    res = {
        "deleted_by_ttl": deleted_ttl,
        "deleted_by_size": deleted_size,
        "deleted_orphan": deleted_orphan,
        "freed_mb": round(freed / 1024 / 1024, 2),
        "total_mb": round(total_after / 1024 / 1024, 2),
        "files_after": files_after,
        "ttl_days": ttl_days,
        "max_mb": max_mb,
    }
    if deleted_ttl or deleted_size or deleted_orphan:
        log.info(
            f"cleanup: удалено {deleted_ttl + deleted_size + deleted_orphan} файлов "
            f"(TTL={ttl_days}d, max={max_mb}MB), освобождено {res['freed_mb']} MB, "
            f"осталось {res['files_after']} файлов / {res['total_mb']} MB"
        )
    return res


async def cleanup_loop(interval_sec: int = 3600) -> None:
    await asyncio.sleep(10)  # не мешаем старту
    while True:
        try:
            await cleanup_once()
        except asyncio.CancelledError:
            raise
        except Exception as e:
            log.error(f"cleanup loop error: {e}")
        try:
            await asyncio.sleep(interval_sec)
        except asyncio.CancelledError:
            raise
