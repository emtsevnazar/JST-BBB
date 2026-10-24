"""P4.1: batch synthesis — unit (BatchQueue) + API (client)."""

import time

from backend.services.batch import BatchQueue

# --- BatchQueue (без запуска worker) ---


def test_queue_submit_get_status():
    q = BatchQueue()
    tid = q.submit("hello", "voice1", {"output_format": "wav"})
    task = q.get(tid)
    assert task is not None
    assert task.status == "queued"
    assert task.text == "hello"
    assert task.voice == "voice1"
    assert task.settings == {"output_format": "wav"}


def test_queue_cancel():
    q = BatchQueue()
    tid = q.submit("hello", "", {})
    assert q.cancel(tid) is True
    assert q.get(tid).status == "cancelled"


def test_queue_cancel_unknown():
    q = BatchQueue()
    assert q.cancel("unknown") is False


def test_queue_cancel_done_task():
    q = BatchQueue()
    tid = q.submit("hello", "", {})
    q.get(tid).status = "done"
    assert q.cancel(tid) is False


def test_queue_list_newest_first():
    q = BatchQueue()
    ids = [q.submit(f"t{i}", "", {}) for i in range(3)]
    tasks = q.list()
    assert len(tasks) == 3
    assert tasks[0].id == ids[-1]  # новые сверху
    assert tasks[-1].id == ids[0]


def test_queue_max_history():
    q = BatchQueue()
    for i in range(BatchQueue.MAX_HISTORY + 50):
        q.submit(f"t{i}", "", {})
    assert len(q._tasks) == BatchQueue.MAX_HISTORY
    assert len(q._order) == BatchQueue.MAX_HISTORY


# --- API (через TestClient + FakeEngine) ---


def test_api_submit_ok(client):
    r = client.post("/api/batch", json={"text": "hello", "voice": "", "settings": {}})
    assert r.status_code == 200
    d = r.json()
    assert d["ok"] is True
    assert isinstance(d["task_id"], str)
    assert len(d["task_id"]) > 0


def test_api_submit_validation_empty_text(client):
    r = client.post("/api/batch", json={"text": "", "voice": "", "settings": {}})
    assert r.status_code == 422


def test_api_get_not_found(client):
    r = client.get("/api/batch/unknown")
    assert r.status_code == 404


def test_api_list(client):
    r = client.get("/api/batch?limit=10")
    assert r.status_code == 200
    d = r.json()
    assert d["ok"] is True
    assert isinstance(d["tasks"], list)


def test_api_cancel_not_found(client):
    r = client.delete("/api/batch/unknown")
    assert r.status_code == 409


def test_batch_end_to_end(client, monkeypatch, tmp_path, fake_ref_path):
    """POST -> poll -> done -> файл в OUTPUT (tmp_path)."""
    monkeypatch.setattr("backend.services.output_service.OUTPUT", tmp_path)

    r = client.post("/api/batch", json={"text": "hello batch", "voice": "", "settings": {}})
    assert r.status_code == 200, r.text
    tid = r.json()["task_id"]

    task = None
    last_status: int | None = None
    last_body: str | None = None
    for _ in range(100):  # 10 секунд — с запасом для покрытия/медленных машин
        time.sleep(0.1)
        rr = client.get(f"/api/batch/{tid}")
        last_status, last_body = rr.status_code, rr.text
        if rr.status_code != 200:
            continue
        d = rr.json().get("task")
        if d is None:
            continue
        if d["status"] in ("done", "error", "cancelled"):
            task = d
            break

    assert task is not None, (
        f"worker не завершил за 10 с; last GET={last_status} body={last_body!r}"
    )
    assert task["status"] == "done", f"status={task['status']} error={task.get('error')}"
    assert task["result_file"] is not None
    assert task["result_file"].endswith(".wav")
    assert (tmp_path / task["result_file"]).exists()
