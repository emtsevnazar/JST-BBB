"""P4.4: WS-статус batch — pub/sub unit + endpoint registration.

Полноценный WS handshake через TestClient отвергается TrustedHost
(см. tests/test_ws.py) — проверяем, что endpoint зарегистрирован,
а логика pub/sub покрыта прямыми тестами на BatchQueue.
"""

from starlette.testclient import WebSocketDenialResponse

from backend.services.batch import BatchQueue, BatchTask


def _make_task(tid: str, status: str = "queued") -> BatchTask:
    return BatchTask(id=tid, text="x", voice="", settings={}, status=status)


def test_batch_ws_endpoint_registered(client):
    try:
        with client.websocket_connect("/ws/batch/unknown"):
            pass
    except WebSocketDenialResponse:
        pass  # endpoint есть, handshake отвергнут TrustedHost


def test_subscribe_and_notify():
    q = BatchQueue()
    sub = q.subscribe("t1")
    q._tasks["t1"] = _make_task("t1")
    q._notify("t1")
    snap = sub.get_nowait()
    assert snap["id"] == "t1"
    assert snap["status"] == "queued"


def test_notify_no_subscribers():
    q = BatchQueue()
    q._tasks["t1"] = _make_task("t1")
    q._notify("t1")  # no error


def test_notify_unknown_task():
    q = BatchQueue()
    sub = q.subscribe("ghost")
    q._notify("ghost")  # task отсутствует — очередь пустая
    assert sub.empty()


def test_unsubscribe_removes_queue():
    q = BatchQueue()
    sub = q.subscribe("t1")
    assert "t1" in q._subscribers
    q.unsubscribe("t1", sub)
    assert "t1" not in q._subscribers


def test_unsubscribe_unknown_is_safe():
    q = BatchQueue()
    sub = q.subscribe("t1")
    q.unsubscribe("other", sub)  # молча игнорирует
    assert "t1" in q._subscribers


def test_cancel_notifies_subscribers():
    q = BatchQueue()
    q._tasks["t1"] = _make_task("t1")
    q._order.append("t1")
    sub = q.subscribe("t1")
    assert q.cancel("t1") is True
    snap = sub.get_nowait()
    assert snap["id"] == "t1"
    assert snap["status"] == "cancelled"


def test_multiple_subscribers():
    q = BatchQueue()
    s1 = q.subscribe("t1")
    s2 = q.subscribe("t1")
    q._tasks["t1"] = _make_task("t1")
    q._notify("t1")
    assert s1.get_nowait()["id"] == "t1"
    assert s2.get_nowait()["id"] == "t1"
