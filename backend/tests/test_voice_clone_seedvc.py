"""Tests for services/voice_clone_seedvc.py — HTTP-клиент к Seed-VC worker."""

import pytest

from backend.services import voice_clone_seedvc as vc


class FakeResp:
    def __init__(self, status_code=200, content=b"", text="", json_data=None):
        self.status_code = status_code
        self.content = content
        self.text = text
        self._json = json_data or {}

    def json(self):
        return self._json


class FakeClient:
    def __init__(self, resp=None, exc=None):
        self._resp = resp
        self._exc = exc

    async def __aenter__(self):
        return self

    async def __aexit__(self, *a):
        pass

    async def post(self, *a, **kw):
        if self._exc:
            raise self._exc
        return self._resp

    async def get(self, *a, **kw):
        if self._exc:
            raise self._exc
        return self._resp


def _mock_client(monkeypatch, resp=None, exc=None):
    monkeypatch.setattr(vc.httpx, "AsyncClient", lambda timeout=None: FakeClient(resp, exc))


@pytest.mark.asyncio
async def test_clone_source_too_small(monkeypatch):
    _mock_client(monkeypatch)
    with pytest.raises(vc.VoiceCloneError, match="source too small"):
        await vc.clone_voice(b"x" * 100, b"y" * 2000)


@pytest.mark.asyncio
async def test_clone_target_too_small(monkeypatch):
    _mock_client(monkeypatch)
    with pytest.raises(vc.VoiceCloneError, match="target too small"):
        await vc.clone_voice(b"x" * 2000, b"y" * 100)


@pytest.mark.asyncio
async def test_clone_connect_error(monkeypatch):
    _mock_client(monkeypatch, exc=vc.httpx.ConnectError("refused"))
    with pytest.raises(vc.VoiceCloneError, match="unreachable"):
        await vc.clone_voice(b"x" * 2000, b"y" * 2000)


@pytest.mark.asyncio
async def test_clone_timeout(monkeypatch):
    _mock_client(monkeypatch, exc=vc.httpx.TimeoutException("timeout"))
    with pytest.raises(vc.VoiceCloneError, match="timeout"):
        await vc.clone_voice(b"x" * 2000, b"y" * 2000)


@pytest.mark.asyncio
async def test_clone_http_error(monkeypatch):
    _mock_client(monkeypatch, resp=FakeResp(status_code=500, text="server error"))
    with pytest.raises(vc.VoiceCloneError, match="HTTP 500"):
        await vc.clone_voice(b"x" * 2000, b"y" * 2000)


@pytest.mark.asyncio
async def test_clone_non_wav_response(monkeypatch):
    _mock_client(monkeypatch, resp=FakeResp(status_code=200, content=b"not_a_wav" + b"\x00" * 200))
    with pytest.raises(vc.VoiceCloneError, match="non-WAV"):
        await vc.clone_voice(b"x" * 2000, b"y" * 2000)


@pytest.mark.asyncio
async def test_clone_success(monkeypatch):
    wav = b"RIFF" + b"\x00" * 500
    _mock_client(monkeypatch, resp=FakeResp(status_code=200, content=wav))
    result = await vc.clone_voice(b"x" * 2000, b"y" * 2000)
    assert result == wav


@pytest.mark.asyncio
async def test_worker_health_ok(monkeypatch):
    _mock_client(monkeypatch, resp=FakeResp(status_code=200, json_data={"status": "ok"}))
    r = await vc.worker_health()
    assert r["ok"] is True
    assert r["worker"] == {"status": "ok"}


@pytest.mark.asyncio
async def test_worker_health_non_200(monkeypatch):
    _mock_client(monkeypatch, resp=FakeResp(status_code=500))
    r = await vc.worker_health()
    assert r["ok"] is False
    assert r["status"] == 500


@pytest.mark.asyncio
async def test_worker_health_exception(monkeypatch):
    _mock_client(monkeypatch, exc=RuntimeError("boom"))
    r = await vc.worker_health()
    assert r["ok"] is False
    assert "error" in r
