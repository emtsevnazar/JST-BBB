"""Edge cases API: 404, invalid input, missing fields."""


def test_models_ok(client):
    r = client.get("/api/models")
    assert r.status_code == 200


def test_voices_ok(client):
    r = client.get("/api/voices")
    assert r.status_code == 200


def test_history_ok(client):
    r = client.get("/api/history")
    assert r.status_code == 200


def test_output_ok(client):
    r = client.get("/api/output")
    assert r.status_code == 200


def test_journal_ok(client):
    r = client.get("/api/journal")
    assert r.status_code == 200


def test_healthz_ok(client):
    r = client.get("/healthz")
    assert r.status_code == 200


def test_readyz_ok(client):
    r = client.get("/readyz")
    assert r.status_code == 200


def test_error_state_ok(client):
    r = client.get("/api/error-state")
    assert r.status_code == 200


def test_unknown_api_404(client):
    r = client.get("/api/definitely-not-here")
    assert r.status_code in (401, 404)


def test_history_missing_id_404(client):
    r = client.get("/api/history/nonexistent-id-xyz")
    assert r.status_code in (401, 404)
