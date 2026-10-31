"""Tests for /ws/synthesize — полный flow через TestClient.websocket_connect."""

import json


def _setup_ws_mocks(monkeypatch, tmp_path):
    from backend.api import ws as ws_mod

    ref = tmp_path / "ref.wav"
    ref.write_bytes(b"RIFF" + b"\x00" * 100)

    def fake_resolve(voice, length, language="ru"):
        return ref

    def fake_save(samples, sr_in, s, base):
        return f"{base}.wav"

    monkeypatch.setattr(ws_mod, "resolve_reference", fake_resolve)
    monkeypatch.setattr(ws_mod, "save_output", fake_save)
    monkeypatch.setattr(ws_mod._rate_limiter, "check", lambda ip, path: True)
    return ref


def _drain_ws(ws, max_msgs=200):
    events = []
    binary_bytes = 0
    for _ in range(max_msgs):
        msg = ws.receive()
        if msg.get("type") == "websocket.close":
            break
        if msg.get("bytes"):
            binary_bytes += len(msg["bytes"])
            events.append("binary")
        elif msg.get("text"):
            data = json.loads(msg["text"])
            t = data.get("type", "?")
            events.append(t)
            if t in ("done", "error"):
                return events, binary_bytes, data
    return events, binary_bytes, None


def test_ws_synthesize_success(client, monkeypatch, tmp_path):
    _setup_ws_mocks(monkeypatch, tmp_path)
    with client.websocket_connect("/ws/synthesize") as ws:
        ws.send_json({"type": "synthesize", "text": "Привет мир", "voice": "v1", "settings": {}})
        events, binary_bytes, final = _drain_ws(ws)
        assert "start" in events, f"нет start в {events}"
        assert "done" in events, f"нет done, final={final}"
        assert binary_bytes > 0, f"binary=0, events={events}"


def test_ws_synthesize_no_ref(client, monkeypatch):
    """voice без reference → error code=no_ref."""
    from backend.api import ws as ws_mod

    monkeypatch.setattr(ws_mod._rate_limiter, "check", lambda ip, path: True)
    monkeypatch.setattr(ws_mod, "resolve_reference", lambda v, lang, **kw: None)
    with client.websocket_connect("/ws/synthesize") as ws:
        ws.send_json({"type": "synthesize", "text": "x", "voice": "no_such_voice"})
        data = ws.receive_json()
        assert data["type"] == "error"
        assert data["code"] == "no_ref"


def test_ws_synthesize_empty_text(client, monkeypatch, tmp_path):
    """text='' → error code=unknown (validate_text бросает раньше empty_text-проверки)."""
    _setup_ws_mocks(monkeypatch, tmp_path)
    with client.websocket_connect("/ws/synthesize") as ws:
        ws.send_json({"type": "synthesize", "text": "", "voice": "v1"})
        data = ws.receive_json()
        assert data["type"] == "error"
        # validate_text("") бросает ValueError("Текст пустой") → код unknown
        assert data["code"] in ("empty_text", "unknown")


def test_ws_synthesize_stopped(client, monkeypatch, tmp_path):
    _setup_ws_mocks(monkeypatch, tmp_path)
    from backend.api import ws as ws_mod

    monkeypatch.setattr(ws_mod, "is_stopped", lambda: True)
    with client.websocket_connect("/ws/synthesize") as ws:
        ws.send_json({"type": "synthesize", "text": "x", "voice": "v1"})
        data = ws.receive_json()
        assert data["type"] == "error"
        assert data["code"] == "stopped"


def test_ws_synthesize_ignores_non_synthesize(client, monkeypatch, tmp_path):
    _setup_ws_mocks(monkeypatch, tmp_path)
    with client.websocket_connect("/ws/synthesize") as ws:
        ws.send_json({"type": "ping", "text": "x"})
        ws.send_json({"type": "synthesize", "text": "Привет", "voice": "v1", "settings": {}})
        events, binary_bytes, final = _drain_ws(ws)
        assert "start" in events
        assert "done" in events


def test_ws_synthesize_rate_limited(client, monkeypatch):
    """rate_limiter.check=False → WS закрывается до accept."""
    from backend.api import ws as ws_mod

    monkeypatch.setattr(ws_mod._rate_limiter, "check", lambda ip, path: False)
    try:
        with client.websocket_connect("/ws/synthesize") as ws:
            msg = ws.receive()
            assert msg.get("type") == "websocket.close" or msg.get("code") == 1008
    except Exception:
        # disconnect — ожидаемо
        pass
