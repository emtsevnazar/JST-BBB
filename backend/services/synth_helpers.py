"""P5.5: общий синтез одного текстового фрагмента — выбор метода по settings.mode.

Извлечено из api/ws.py (там был inline if/elif с одним багом:
порядок аргументов synth_one: (text, ref, settings), а не (text, settings)).
Синхронный — вызывается из asyncio.to_thread.
"""

from __future__ import annotations

import logging

import numpy as np

from ..core.utils import _int
from .references import resolve_reference

log = logging.getLogger("JST.Synth")


def synth_chunk(engine, text: str, voice: str, settings) -> np.ndarray:
    """Синтез одного фрагмента текста. Возвращает float32 mono.

    Поднимает RuntimeError, если нет референса или режим не загружен.
    """
    ref = resolve_reference(voice, _int(getattr(settings, "ref_length", 15), 15))
    if not ref or not ref.exists():
        raise RuntimeError(f"No reference for '{voice or 'default'}'")

    mode = getattr(settings, "mode", "core") or "core"

    if mode == "jst_clone" and getattr(engine, "clone_engine", None) is not None:
        return engine.synth_jst_clone(text, str(ref), settings, voice_name=voice)
    if mode == "voxcpm" and getattr(engine, "voxcpm", None) is not None:
        return engine.synth_voxcpm(text, str(ref), settings, prompt_text="")
    if mode == "qwen" and getattr(engine, "qwen_tts", None) is not None:
        return engine.synth_qwen(text, str(ref), settings, prompt_text="")
    if mode == "cosyvoice" and getattr(engine, "cosyvoice", None) is not None:
        return engine.synth_cosyvoice(text, str(ref), settings, prompt_text="")

    # core / multi / fallback
    return engine.synth_one(
        text,
        str(ref),
        settings,
        emphasize=False,
        volume_mul=1.0,
        whisper=False,
        speed_mul=1.0,
    )
