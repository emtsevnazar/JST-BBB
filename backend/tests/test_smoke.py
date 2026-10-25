"""P3.7a: smoke — end-to-end через весь ASGI-стек (TestClient + FakeEngine).

Проверяет: 7 роутеров, security middleware, static, WS handshake,
frontend HTML, mode switch, валидацию. Быстро (~5 сек), без моделей.
"""


def test_smoke_full_stack(client):
    """Один тест — все endpoints, чтобы падение сразу показало, что сломалось."""

    # --- 1. Frontend + static ---
    r = client.get("/")
    assert r.status_code == 200
    assert "text/html" in r.headers["content-type"]
    assert len(r.text) > 1000

    r = client.get("/static/style.css")
    assert r.status_code == 200
    assert "text/css" in r.headers["content-type"]

    # --- 2. Health (P3.3 — observability) ---
    r = client.get("/health")
    assert r.status_code == 200
    d = r.json()
    assert d["ok"] is True
    assert d["engine_ready"] is True
    assert d["sr"] == 24000
    assert isinstance(d["version"], str)
    assert isinstance(d["git_sha"], str)
    assert isinstance(d["uptime_sec"], int)
    assert isinstance(d["ws_active"], int)

    r = client.get("/api/health")
    assert r.status_code == 200
    d = r.json()
    assert d["ok"] is True
    assert isinstance(d["checks"], dict)
    assert "rate_limit_remaining" in d

    # --- 3. System ---
    r = client.get("/api/models")
    assert r.status_code == 200
    codes = {m["code"] for m in r.json()["models"]}
    assert {
        "core",
        "multi",
        "jst_clone",
    } <= codes  # v1.5.4: voxcpm/qwen/cosyvoice удалены (нет моделей)

    r = client.get("/api/moods")
    assert r.status_code == 200
    assert isinstance(r.json()["moods"], dict)

    r = client.get("/api/presets")
    assert r.status_code == 200
    assert isinstance(r.json()["presets"], dict)

    r = client.get("/api/languages")
    assert r.status_code == 200
    langs = {lang["code"] for lang in r.json()["languages"]}
    assert "ru" in langs
    assert "en" in langs

    r = client.get("/api/formats")
    assert r.status_code == 200
    assert "wav" in r.json()["formats"]

    # --- 4. Mode switch ---
    r = client.post("/api/mode", data={"mode": "core"})
    assert r.status_code == 200
    assert r.json()["ok"] is True

    r = client.post("/api/mode", data={"mode": "bad"})
    assert r.status_code == 400

    # --- 5. Voices + output ---
    r = client.get("/api/voices")
    assert r.status_code == 200
    assert isinstance(r.json()["voices"], list)

    r = client.get("/api/output")
    assert r.status_code == 200
    assert isinstance(r.json()["files"], list)

    # --- 6. STT валидация ---
    r = client.post("/api/stt", files={"file": ("a.txt", b"hello", "text/plain")})
    assert r.status_code == 400

    # --- 7. Security middleware ---
    r = client.get("/health")
    assert r.headers.get("x-frame-options") == "DENY"
    assert "content-security-policy" in {k.lower() for k in r.headers}

    r = client.get("/health", headers={"host": "evil.com"})
    assert r.status_code == 400

    # --- 8. WS endpoint зарегистрирован ---
    from starlette.testclient import WebSocketDenialResponse

    try:
        with client.websocket_connect("/ws/synthesize"):
            pass
    except WebSocketDenialResponse:
        pass  # endpoint есть, handshake отвергнут TrustedHost (ok для smoke)
