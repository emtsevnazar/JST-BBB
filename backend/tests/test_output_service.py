"""Unit-тесты для services/output_service.py (save_output, list_output)."""

from pathlib import Path

import numpy as np
import pytest
import soundfile as sf

from backend.services import output_service as out


@pytest.fixture()
def tmp_output(monkeypatch, tmp_path: Path):
    monkeypatch.setattr(out, "OUTPUT", tmp_path)
    return tmp_path


def test_save_output_writes_wav(tmp_output):
    audio = np.zeros(24000, dtype=np.float32)
    path = out.save_output(audio, 24000, name="unit_test")
    p = Path(path)
    assert p.exists()
    assert p.suffix == ".wav"
    # файл можно прочитать обратно
    data, sr = sf.read(str(p))
    assert sr == 24000
    assert len(data) == 24000


def test_list_output_empty(tmp_output):
    assert out.list_output() == []


def test_list_output_after_save(tmp_output):
    audio = np.zeros(12000, dtype=np.float32)
    out.save_output(audio, 24000, name="a")
    out.save_output(audio, 24000, name="b")
    files = out.list_output()
    assert len(files) == 2
    names = {f["name"] if isinstance(f, dict) else f for f in files}
    assert any("a" in str(n) for n in names)
    assert any("b" in n for n in names) if names else True
