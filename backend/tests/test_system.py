def test_presets(client):
    r = client.get("/api/presets")
    assert r.status_code == 200
    assert "presets" in r.json()


def test_formats(client):
    r = client.get("/api/formats")
    assert r.status_code == 200
    d = r.json()
    assert "formats" in d
    assert "sample_rates" in d
    assert "bit_depths" in d


def test_languages(client):
    r = client.get("/api/languages")
    assert r.status_code == 200
    assert "languages" in r.json()


def test_mode_valid(client):
    r = client.post("/api/mode", data={"mode": "core"})
    assert r.status_code == 200
    d = r.json()
    assert d["ok"] is True
    assert d["mode"] == "core"


def test_mode_invalid(client):
    r = client.post("/api/mode", data={"mode": "bad"})
    assert r.status_code == 400
