"""P4.2: SQLite history — unit + API."""

import time

from backend.services.history import HistoryDB


def _fake_save_output(tmp_path):
    def _save(audio, sr, s, base):
        p = tmp_path / f"{base}.wav"
        p.write_bytes(b"RIFF" + b"\x00" * 96)
        return p.name

    return _save


def _make_task(tid: str, status: str = "done") -> dict:
    return {
        "id": tid,
        "text": f"text-{tid}",
        "voice": "v1",
        "settings": {"output_format": "wav"},
        "status": status,
        "result_file": f"batch_{tid}.wav" if status == "done" else None,
        "error": None if status == "done" else "boom",
        "created_at": 1000.0,
        "started_at": 1001.0,
        "finished_at": 1002.0,
    }


# --- HistoryDB (unit) ---


def test_history_save_and_get(tmp_path):
    db = HistoryDB(tmp_path / "jst.db")
    db.init()
    db.save_task(_make_task("a1"))
    got = db.get_task("a1")
    assert got is not None
    assert got["id"] == "a1"
    assert got["text"] == "text-a1"
    assert got["status"] == "done"
    assert got["result_file"] == "batch_a1.wav"
    assert got["settings"] == {"output_format": "wav"}


def test_history_get_missing(tmp_path):
    db = HistoryDB(tmp_path / "jst.db")
    db.init()
    assert db.get_task("nope") is None


def test_history_list_order_and_limit(tmp_path):
    db = HistoryDB(tmp_path / "jst.db")
    db.init()
    for i, tid in enumerate(["a", "b", "c", "d", "e"]):
        t = _make_task(tid)
        t["finished_at"] = 1000.0 + i  # a — старше, e — новее
        db.save_task(t)
    all_tasks = db.list_tasks(10)
    assert [t["id"] for t in all_tasks] == ["e", "d", "c", "b", "a"]
    top2 = db.list_tasks(2)
    assert [t["id"] for t in top2] == ["e", "d"]


def test_history_upsert(tmp_path):
    db = HistoryDB(tmp_path / "jst.db")
    db.init()
    t = _make_task("x", status="running")
    db.save_task(t)
    t["status"] = "done"
    t["result_file"] = "x.wav"
    db.save_task(t)
    got = db.get_task("x")
    assert got["status"] == "done"
    assert got["result_file"] == "x.wav"


# --- API (client + FakeEngine) ---


def test_api_history_empty(client):
    r = client.get("/api/history")
    assert r.status_code == 200
    d = r.json()
    assert d["ok"] is True
    assert d["tasks"] == []


def test_api_history_get_404(client):
    r = client.get("/api/history/unknown")
    assert r.status_code == 404


def test_api_history_after_batch(client, monkeypatch, tmp_path, fake_ref_path):
    monkeypatch.setattr("backend.services.output_service.OUTPUT", tmp_path)
    monkeypatch.setattr("backend.services.batch.save_output", _fake_save_output(tmp_path))

    r = client.post("/api/batch", json={"text": "hist test", "voice": "", "settings": {}})
    assert r.status_code == 200
    tid = r.json()["task_id"]

    task = None
    for _ in range(150):
        time.sleep(0.1)
        rr = client.get(f"/api/history/{tid}")
        if rr.status_code == 200:
            task = rr.json()["task"]
            break

    assert task is not None, "history не сохранилась за 5 с"
    assert task["id"] == tid
    assert task["status"] == "done"
    assert task["text"] == "hist test"
    assert task["result_file"] is not None

    rl = client.get("/api/history?limit=10")
    ids = [t["id"] for t in rl.json()["tasks"]]
    assert tid in ids


# --- P4.5: ZIP-экспорт ---


def test_export_404(client):
    r = client.get("/api/history/unknown/export")
    assert r.status_code == 404


def test_export_not_done(client):
    from backend.services.history import get_history

    db = get_history()
    assert db is not None
    db.save_task(_make_task("x-running", status="running"))
    r = client.get("/api/history/x-running/export")
    assert r.status_code == 409


def test_export_missing_audio(client, monkeypatch, tmp_path):
    from backend.services.history import get_history

    monkeypatch.setattr("backend.services.output_service.OUTPUT", tmp_path)
    db = get_history()
    assert db is not None
    t = _make_task("x-missing", status="done")
    t["result_file"] = "missing.wav"
    db.save_task(t)
    r = client.get("/api/history/x-missing/export")
    assert r.status_code == 410


def test_export_ok(client, monkeypatch, tmp_path, fake_ref_path):
    import io
    import json
    import zipfile

    monkeypatch.setattr("backend.services.output_service.OUTPUT", tmp_path)
    monkeypatch.setattr("backend.services.batch.save_output", _fake_save_output(tmp_path))

    r = client.post("/api/batch", json={"text": "export test", "voice": "", "settings": {}})
    assert r.status_code == 200
    tid = r.json()["task_id"]

    task = None
    for _ in range(150):
        time.sleep(0.1)
        rr = client.get(f"/api/history/{tid}")
        if rr.status_code == 200:
            task = rr.json()["task"]
            break
    assert task is not None, "history не сохранилась за 5 с"
    assert task["status"] == "done"

    r = client.get(f"/api/history/{tid}/export")
    assert r.status_code == 200
    assert r.headers["content-type"].startswith("application/zip")
    assert "attachment" in r.headers.get("content-disposition", "")

    zf = zipfile.ZipFile(io.BytesIO(r.content))
    names = zf.namelist()
    assert any(n.startswith("audio.") for n in names), names
    assert "settings.json" in names
    assert "metadata.json" in names
    meta = json.loads(zf.read("metadata.json"))
    assert meta["id"] == tid
    assert meta["status"] == "done"
    assert meta["text"] == "export test"
    settings = json.loads(zf.read("settings.json"))
    assert isinstance(settings, dict)
