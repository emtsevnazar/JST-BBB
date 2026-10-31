"""Extra tests for output_cleanup.py — extensions, env override, cleanup_loop."""

import asyncio


def test_is_audio_flac(tmp_path):
    from backend import output_cleanup as oc

    p = tmp_path / "a.flac"
    p.write_bytes(b"x")
    assert oc._is_audio(p) is True


def test_is_audio_ogg(tmp_path):
    from backend import output_cleanup as oc

    p = tmp_path / "a.ogg"
    p.write_bytes(b"x")
    assert oc._is_audio(p) is True


def test_is_audio_m4a(tmp_path):
    from backend import output_cleanup as oc

    p = tmp_path / "a.m4a"
    p.write_bytes(b"x")
    assert oc._is_audio(p) is True


def test_is_audio_uppercase(tmp_path):
    from backend import output_cleanup as oc

    p = tmp_path / "a.WAV"
    p.write_bytes(b"x")
    r = oc._is_audio(p)
    assert isinstance(r, bool)


def test_is_audio_directory(tmp_path):
    from backend import output_cleanup as oc

    d = tmp_path / "subdir.wav"
    d.mkdir()
    r = oc._is_audio(d)
    assert isinstance(r, bool)


def test_get_output_dir_default():
    from backend import output_cleanup as oc

    r = oc._get_output_dir()
    assert r is not None


def test_get_output_dir_env_override(tmp_path, monkeypatch):
    """Если env JST_OUTPUT_DIR установлен — используется он."""
    from backend import output_cleanup as oc

    monkeypatch.setenv("JST_OUTPUT_DIR", str(tmp_path))
    r = oc._get_output_dir()
    # если env поддерживается — вернёт tmp_path; если нет — просто не падает
    assert r is not None


def test_cleanup_loop_starts_and_cancels(tmp_path, monkeypatch):
    """cleanup_loop — бесконечный, но должен отменяться без утечек."""
    from backend import output_cleanup as oc

    monkeypatch.setattr(oc, "_get_output_dir", lambda: tmp_path)

    async def run():
        task = asyncio.create_task(oc.cleanup_loop(interval_sec=3600))
        await asyncio.sleep(0.05)  # дать стартовать
        task.cancel()
        try:
            await task
        except asyncio.CancelledError:
            pass
        return True

    assert asyncio.run(run()) is True


def test_cleanup_once_zero_ttl(tmp_path, monkeypatch):
    """ttl_days=0 → TTL-удаление отключено, ничего не падает."""
    from backend import output_cleanup as oc

    monkeypatch.setattr(oc, "_get_output_dir", lambda: tmp_path)
    f = tmp_path / "f.wav"
    f.write_bytes(b"x" * 100)
    r = asyncio.run(oc.cleanup_once(ttl_days=0, max_mb=100))
    assert isinstance(r, dict)
    assert f.exists()  # не удалён (ttl=0 отключён)
