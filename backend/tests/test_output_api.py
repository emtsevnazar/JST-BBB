"""Тесты для api/output.py: list/get/clear/download-all-zip/download-all-merged.

OUTPUT — модульная константа в backend.api.output, monkeypatch'им её на tmp_path.
"""

import io
import zipfile
from pathlib import Path

import pytest

import backend.api.output as out_mod


@pytest.fixture()
def tmp_output(monkeypatch, tmp_path: Path):
    """Подменить OUTPUT в backend.api.output на tmp_path."""
    monkeypatch.setattr(out_mod, "OUTPUT", tmp_path)
    return tmp_path


# --- /api/output ---


def test_list_output_empty(client, tmp_output):
    r = client.get("/api/output")
    assert r.status_code == 200
    assert r.json() == {"files": []}


def test_list_output_with_files(client, tmp_output):
    (tmp_output / "a.wav").write_bytes(b"RIFF")
    (tmp_output / "b.mp3").write_bytes(b"ID3")
    (tmp_output / "c.txt").write_bytes(b"ignore")
    r = client.get("/api/output")
    assert r.status_code == 200
    names = {f["name"] for f in r.json()["files"]}
    assert names == {"a.wav", "b.mp3"}


# --- /output/{filename} ---


def test_get_output_ok(client, tmp_output):
    (tmp_output / "a.wav").write_bytes(b"RIFFaudio")
    r = client.get("/output/a.wav")
    assert r.status_code == 200
    assert r.content == b"RIFFaudio"


def test_get_output_404(client, tmp_output):
    r = client.get("/output/missing.wav")
    assert r.status_code == 404


# --- /api/clear-history ---


def test_clear_history_removes_audio_keeps_other(client, tmp_output):
    (tmp_output / "a.wav").write_bytes(b"RIFF")
    (tmp_output / "b.mp3").write_bytes(b"ID3")
    (tmp_output / "keep.txt").write_bytes(b"keep")
    (tmp_output / ".concat_list.txt").write_text("x")
    r = client.post("/api/clear-history")
    assert r.status_code == 200
    d = r.json()
    assert d["ok"] is True
    assert d["removed"] == 3  # a.wav, b.mp3, .concat_list.txt
    assert (tmp_output / "keep.txt").exists()
    assert not (tmp_output / "a.wav").exists()
    assert not (tmp_output / ".concat_list.txt").exists()


# --- /api/download-all-zip ---


def test_download_all_zip_empty(client, tmp_output):
    r = client.get("/api/download-all-zip")
    assert r.status_code == 404


def test_download_all_zip_with_files(client, tmp_output):
    (tmp_output / "a.wav").write_bytes(b"RIFFA")
    (tmp_output / "b.wav").write_bytes(b"RIFFB")
    r = client.get("/api/download-all-zip")
    assert r.status_code == 200
    assert r.headers["content-type"] == "application/zip"
    zf = zipfile.ZipFile(io.BytesIO(r.content))
    assert set(zf.namelist()) == {"a.wav", "b.wav"}
    assert zf.read("a.wav") == b"RIFFA"


# --- /api/download-all-merged ---


def test_download_all_merged_empty(client, tmp_output):
    r = client.get("/api/download-all-merged")
    assert r.status_code == 404


def test_download_all_merged_success(client, tmp_output, monkeypatch):
    """ffmpeg заменяем на fake_run, который пишет файл ALL_MERGED.wav."""
    (tmp_output / "a.wav").write_bytes(b"RIFFA")
    (tmp_output / "b.wav").write_bytes(b"RIFFB")

    def fake_run(cmd, **kw):
        Path(cmd[-1]).write_bytes(b"MERGED")
        return None

    monkeypatch.setattr(out_mod.subprocess, "run", fake_run)
    r = client.get("/api/download-all-merged")
    assert r.status_code == 200
    assert r.content == b"MERGED"


def test_download_all_merged_ffmpeg_missing(client, tmp_output, monkeypatch):
    """ffmpeg упал → 500."""
    (tmp_output / "a.wav").write_bytes(b"RIFFA")

    def fake_run(cmd, **kw):
        raise RuntimeError("no ffmpeg")

    monkeypatch.setattr(out_mod.subprocess, "run", fake_run)
    r = client.get("/api/download-all-merged")
    assert r.status_code == 500
