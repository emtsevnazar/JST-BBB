def test_stt_txt_rejected(client):
    r = client.post(
        "/api/stt",
        files={"file": ("test.txt", b"hello", "text/plain")},
    )
    assert r.status_code == 400
