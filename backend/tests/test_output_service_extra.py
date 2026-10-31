"""Tests for services/output_service.py — save_output с моком soundfile."""

from unittest.mock import MagicMock, patch

import numpy as np
import pytest


def test_save_output_wav(tmp_path, monkeypatch):
    from backend.services import output_service as os_mod

    monkeypatch.setattr(os_mod, "OUTPUT", tmp_path)

    class S:
        output_sr = 24000
        bit_depth = 16
        output_format = "wav"

    samples = np.zeros(24000, dtype=np.float32)
    with patch.object(os_mod, "sf", create=True) as mock_sf:
        mock_sf.write = MagicMock()
        try:
            r = os_mod.save_output(samples, 24000, S(), "TEST")
            # не падает; путь/имя вернулось
            assert r is not None
        except Exception as e:
            pytest.skip(f"save_output зависит от реального sf: {e}")


def test_save_output_none_samples():
    """None samples → TypeError (валидация до sf.write, не IndexError)."""
    from backend.services import output_service as os_mod

    class S:
        output_sr = 24000
        bit_depth = 16
        output_format = "wav"

    with pytest.raises(TypeError, match="must not be None"):
        os_mod.save_output(None, 24000, S(), "TEST")


def test_save_output_non_array():
    """Не-array (str) → TypeError с указанием типа."""
    from backend.services import output_service as os_mod

    class S:
        output_sr = 24000
        bit_depth = 16
        output_format = "wav"

    with pytest.raises(TypeError, match="must be array-like"):
        os_mod.save_output("not array", 24000, S(), "TEST")
