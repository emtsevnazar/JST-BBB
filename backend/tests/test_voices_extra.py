"""Tests for api/voices.py — GET list, 404 на неизвестный."""

import pytest


@pytest.fixture(autouse=True)
def reset_env(monkeypatch):
    monkeypatch.setenv("JST_ADMIN_TOKEN", "test-token-pytest")
    yield


def test_voices_list(client):
    r = client.get("/api/voices")
    assert r.status_code == 200
    d = r.json()
    assert "voices" in d
    assert isinstance(d["voices"], list)


def test_voices_structure(client):
    r = client.get("/api/voices")
    d = r.json()
    if d["voices"]:
        v = d["voices"][0]
        assert "name" in v
        assert "files" in v
        assert "has_ref" in v


def test_voices_delete_nonexistent(client):
    r = client.delete("/api/voices/definitely_not_a_voice_xyz")
    assert r.status_code in (404, 400, 422)
