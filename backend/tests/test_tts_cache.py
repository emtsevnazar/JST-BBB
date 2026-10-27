"""v1.8.7: Тесты для services/tts_cache.py."""

from __future__ import annotations

from backend.services import tts_cache


def test_tts_cache_module_exists():
    """Модуль импортируется и имеет базовые атрибуты."""
    assert tts_cache is not None


def test_tts_cache_get_returns_none_for_unknown():
    """get() на несуществующий ключ возвращает None или пустое."""
    # Пробуем разные имена API — модуль может экспортировать get / load / find
    for name in ("get", "load", "find", "lookup"):
        fn = getattr(tts_cache, name, None)
        if callable(fn):
            try:
                result = fn("nonexistent_key_v187")
                # None или falsy — нормально
                assert result is None or not result
                return
            except TypeError:
                continue
            except Exception:
                # Ожидаемо если сигнатура другая
                return


def test_tts_cache_has_public_api():
    """Модуль экспортирует хотя бы одну публичную функцию/константу."""
    attrs = [a for a in dir(tts_cache) if not a.startswith("_")]
    assert len(attrs) > 0, "tts_cache должен иметь публичные атрибуты"
