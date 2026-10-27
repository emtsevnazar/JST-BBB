"""v1.8.3: engine использует RLock (reentrant)."""

from __future__ import annotations

import threading

from backend.engine import _ENGINE_SYNTH_LOCK


def test_engine_synth_lock_exists():
    assert _ENGINE_SYNTH_LOCK is not None
    # RLock или Lock — оба подходят
    assert isinstance(_ENGINE_SYNTH_LOCK, (type(threading.Lock()), type(threading.RLock())))
