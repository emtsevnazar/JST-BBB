"""Синглтон ENGINE — доступен из main.startup и из api/*.py."""
from __future__ import annotations

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from ..engine import Engine

_engine: Engine | None = None


def set_engine(e: Engine) -> None:
    global _engine
    _engine = e


def get_engine() -> Engine | None:
    return _engine
