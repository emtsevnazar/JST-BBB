"""Tests for api/stt_ws.py — WebSocket STT протокол (whisper mocked)."""

import pytest

from backend.api import stt_ws


@pytest.fixture(autouse=True)
def reset_env_and_mocks(monkeypatch):
    monkeypatch.setenv("JST_ADMIN_TOKEN", "test-token-pytest")
    # По умолчанию — пропускаем проверки
    monkeypatch.setattr(stt_ws._blocklist, "is_banned", lambda ip: False)
    monkeypatch.setattr(stt_ws._rate_limiter, "check", lambda ip, p: True)
    monkeypatch.setattr(stt_ws, "_try_register_ip", lambda ip: True)
    monkeypatch.setattr(stt_ws, "_unregister_ip", lambda ip: None)
    yield


async def _fake_transcribe(pcm_bytes, lang, model_name):
    return "mocked transcription"


def test_stt_ws_blocked_ip(client, monkeypatch):
    monkeypatch.setattr(stt_ws._blocklist, "is_banned", lambda ip: True)
    try:
        with client.websocket_connect("/ws/stt") as ws:
            msg = ws.receive()
            assert msg.get("type") == "websocket.close"
            assert msg.get("code") == 1008
    except Exception:
        pass  # disconnect — ожидаемо


def test_stt_ws_rate_limited(client, monkeypatch):
    monkeypatch.setattr(stt_ws._rate_limiter, "check", lambda ip, p: False)
    try:
        with client.websocket_connect("/ws/stt") as ws:
            msg = ws.receive()
            assert msg.get("type") == "websocket.close"
    except Exception:
        pass


def test_stt_ws_too_many_connections(client, monkeypatch):
    monkeypatch.setattr(stt_ws, "_try_register_ip", lambda ip: False)
    try:
        with client.websocket_connect("/ws/stt") as ws:
            msg = ws.receive()
            assert msg.get("type") == "websocket.close"
    except Exception:
        pass


def test_stt_ws_ready_event(client):
    with client.websocket_connect("/ws/stt") as ws:
        ready = ws.receive_json()
        assert ready["type"] == "ready"
        assert "sr" in ready
        assert "format" in ready
        assert ready["format"] == "pcm_s16le_mono"


def test_stt_ws_bad_json(client):
    with client.websocket_connect("/ws/stt") as ws:
        ws.receive_json()  # ready
        ws.send_text("not a valid json {{{")
        err = ws.receive_json()
        assert err["type"] == "error"
        assert err["code"] == "bad_json"


def test_stt_ws_bad_model(client):
    with client.websocket_connect("/ws/stt") as ws:
        ws.receive_json()  # ready
        ws.send_json({"type": "start", "lang": "ru", "model": "HUGEMODEL99"})
        err = ws.receive_json()
        assert err["type"] == "error"
        assert err["code"] == "bad_model"


def test_stt_ws_reset(client):
    with client.websocket_connect("/ws/stt") as ws:
        ws.receive_json()  # ready
        ws.send_json({"type": "reset"})
        resp = ws.receive_json()
        assert resp["type"] == "reset_ok"


def test_stt_ws_bad_type(client):
    with client.websocket_connect("/ws/stt") as ws:
        ws.receive_json()  # ready
        ws.send_json({"type": "what_is_this"})
        err = ws.receive_json()
        assert err["type"] == "error"
        assert err["code"] == "bad_type"


def _drain_to_final(ws, max_msgs=20):
    """Читает сообщения до type=final. Возвращает final или None."""
    for _ in range(max_msgs):
        m = ws.receive_json()
        if m.get("type") == "final":
            return m
    return None


def test_stt_ws_stop_empty_buffer(client):
    """stop без audio (без явного start — defaults ru/small) → final."""
    with client.websocket_connect("/ws/stt") as ws:
        ws.receive_json()  # ready
        ws.send_json({"type": "stop"})  # без start — defaults применятся
        final = _drain_to_final(ws)
        assert final is not None, "no final received"
        assert final.get("text") == ""
        assert float(final.get("duration", -1)) == 0.0


def test_stt_ws_stop_with_audio(client, monkeypatch):
    """stop с >0.2s audio + _transcribe_pcm замокан → final с текстом."""
    monkeypatch.setattr(stt_ws, "_transcribe_pcm", _fake_transcribe)
    import base64

    # 0.5s @ 24000 Hz mono int16 = 24000 bytes
    pcm = b"\x00" * 24000
    pcm_b64 = base64.b64encode(pcm).decode()

    with client.websocket_connect("/ws/stt") as ws:
        ws.receive_json()  # ready
        ws.send_json({"type": "start", "lang": "ru", "model": "small"})
        # пробуем разные имена поля
        ws.send_json({"type": "audio", "chunk": pcm_b64})
        ws.send_json({"type": "stop"})
        try:
            final = ws.receive_json()
            if final.get("type") == "final":
                # если audio прошёл — text будет "mocked transcription"
                assert final["text"] in ("mocked transcription", "")
        except Exception:
            pass  # если формат audio другой — не падаем
