"""Общие утилиты: числовые конвертеры."""

from __future__ import annotations

import numpy as np


def _num(v, default=0.0):
    if v is None:
        return float(default)
    try:
        f = float(v)
        return f if np.isfinite(f) else float(default)
    except (TypeError, ValueError):
        return float(default)


def _int(v, default=0):
    if v is None:
        return default
    try:
        return int(v)
    except (TypeError, ValueError):
        return default
