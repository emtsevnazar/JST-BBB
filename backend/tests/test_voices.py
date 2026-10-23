def test_list_voices(client):
    r = client.get("/api/voices")
    assert r.status_code == 200
    d = r.json()
    assert "voices" in d
    assert isinstance(d["voices"], list)


def test_create_voice_invalid(client):
    # name с "/" — не пройдёт a-zA-Z0-9_-  → 400
    r = client.post("/api/voices/create", data={"name": "bad/name"})
    assert r.status_code == 400


def test_upload_txt_rejected(client, monkeypatch, tmp_path):
    import backend.api.voices as voices_mod
    monkeypatch.setattr(voices_mod, "VOICES", tmp_path)
    (tmp_path / "pytest_voice").mkdir()

    r = client.post(
        "/api/voices/pytest_voice/upload",
        files={"file": ("test.txt", b"hello", "text/plain")},
    )
    assert r.status_code == 400
