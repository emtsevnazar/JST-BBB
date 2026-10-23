def test_moods(client):
    r = client.get("/api/moods")
    assert r.status_code == 200
    d = r.json()
    assert "moods" in d
    assert d["auto"] is True
    assert isinstance(d["moods"], dict)
    # Все ключи в moods — spirit_*
    for k in d["moods"]:
        assert k.startswith("spirit_")
