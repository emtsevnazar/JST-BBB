def test_csp_header(client):
    r = client.get("/health")
    assert r.status_code == 200
    assert "content-security-policy" in {k.lower() for k in r.headers}


def test_xframe_deny(client):
    r = client.get("/health")
    assert r.status_code == 200
    assert r.headers.get("x-frame-options") == "DENY"


def test_dns_rebinding(client):
    r = client.get("/health", headers={"host": "evil.com"})
    assert r.status_code == 400
