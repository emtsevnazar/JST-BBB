def test_health_ok(client):
    r = client.get("/health")
    assert r.status_code == 200
    d = r.json()
    assert d["ok"] is True
    assert d["engine_ready"] is True
    assert d["sr"] == 24000
    # P3.3 — observability
    assert isinstance(d["version"], str) and d["version"]
    assert isinstance(d["git_sha"], str) and d["git_sha"]
    assert isinstance(d["uptime_sec"], int) and d["uptime_sec"] >= 0
    assert isinstance(d["ws_active"], int) and d["ws_active"] >= 0


def test_api_health(client):
    r = client.get("/api/health")
    assert r.status_code == 200
    d = r.json()
    assert d["ok"] is True
    assert "checks" in d
    assert "rate_limit_remaining" in d
    assert "cached" in d


def test_api_models(client):
    r = client.get("/api/models")
    assert r.status_code == 200
    d = r.json()
    assert "models" in d
    codes = {m["code"] for m in d["models"]}
    assert "core" in codes
    assert "multi" in codes
