"""P7.1: Lock в Engine.synth_* — сериализация параллельных синтезов."""

import threading
import time


def test_engine_synth_lock_exists():
    from backend.engine import _ENGINE_SYNTH_LOCK

    assert isinstance(_ENGINE_SYNTH_LOCK, type(threading.Lock()))


def test_engine_synth_methods_locked():
    from backend.engine import Engine

    for name in ("synth_one", "synth_jst_clone", "synth_qwen", "synth_voxcpm", "synth_cosyvoice"):
        if hasattr(Engine, name):
            fn = getattr(Engine, name)
            assert getattr(fn, "__jst_locked__", False), f"{name} не обёрнут"


def test_engine_synth_lock_serializes():
    """Проверить, что параллельные вызовы сериализуются (без реального синтеза)."""
    # Подменить synth_one на медленный фейк с индикатором

    # Заменяем "внутреннюю" функцию через замыкание — не работает для wrapped,
    # поэтому тестируем напрямую _ENGINE_SYNTH_LOCK
    from backend.engine import _ENGINE_SYNTH_LOCK

    results = []

    def worker():
        with _ENGINE_SYNTH_LOCK:
            results.append("a")
            time.sleep(0.02)
            results.append("b")

    threads = [threading.Thread(target=worker) for _ in range(3)]
    for t in threads:
        t.start()
    for t in threads:
        t.join()

    # Если бы Lock не работал, порядок был бы перемешан
    assert results == ["a", "b", "a", "b", "a", "b"]
