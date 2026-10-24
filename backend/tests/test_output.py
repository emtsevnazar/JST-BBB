def test_list_output(client):
    r = client.get("/api/output")
    assert r.status_code == 200
    assert "files" in r.json()


def test_clear_history(client, monkeypatch, tmp_path):
    import backend.api.output as out_mod

    monkeypatch.setattr(out_mod, "OUTPUT", tmp_path)
    (tmp_path / "x.wav").write_bytes(b"")

    r = client.post("/api/clear-history")
    assert r.status_code == 200
    d = r.json()
    assert d["ok"] is True
    assert d["removed"] == 1


def test_download_all_zip_no_files(client, monkeypatch, tmp_path):
    import backend.api.output as out_mod

    monkeypatch.setattr(out_mod, "OUTPUT", tmp_path)

    r = client.get("/api/download-all-zip")
    assert r.status_code == 404
