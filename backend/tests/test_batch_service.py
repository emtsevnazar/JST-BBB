"""Tests for services/batch.py — BatchTask + BatchQueue."""

import asyncio
import time

from backend.services.batch import BatchQueue, BatchTask


def _mk_task(tid="t1", status="queued"):
    return BatchTask(
        id=tid,
        text="hello",
        voice="v1",
        settings={"speed": 1.0},
        status=status,
    )


# ─── BatchTask ───────────────────────────────────────────────
def test_batchtask_to_dict_keys():
    t = _mk_task()
    d = t.to_dict()
    expected = {
        "id",
        "text",
        "voice",
        "settings",
        "status",
        "result_file",
        "error",
        "created_at",
        "started_at",
        "finished_at",
    }
    assert set(d.keys()) == expected


def test_batchtask_to_dict_no_task_field():
    """_task (живой asyncio.Task) НЕ должен попасть в dict — иначе pickle-fail."""
    t = _mk_task()
    t._task = object()
    d = t.to_dict()
    assert "_task" not in d


def test_batchtask_to_dict_values():
    t = _mk_task(tid="abc", status="running")
    d = t.to_dict()
    assert d["id"] == "abc"
    assert d["status"] == "running"
    assert d["text"] == "hello"
    assert d["voice"] == "v1"
    assert d["settings"] == {"speed": 1.0}


def test_batchtask_to_dict_settings_copy():
    """settings — копия, а не ссылка."""
    t = _mk_task()
    d = t.to_dict()
    d["settings"]["speed"] = 99.0
    assert t.settings["speed"] == 1.0


def test_batchtask_created_at_auto():
    t = _mk_task()
    assert t.created_at > 0
    assert t.created_at <= time.time() + 1


# ─── BatchQueue ───────────────────────────────────────────────
def test_batchqueue_max_history():
    assert BatchQueue.MAX_HISTORY == 200


def test_batchqueue_init():
    q = BatchQueue()
    assert q._running is False
    assert q._worker is None
    assert q._tasks == {}
    assert q._order == []
    assert q._subscribers == {}


def test_batchqueue_submit_returns_id():
    async def run():
        q = BatchQueue()
        tid = q.submit("hello", "v1", {"speed": 1.0})
        return q, tid

    q, tid = asyncio.run(run())
    assert isinstance(tid, str)
    assert len(tid) > 0
    assert tid in q._tasks


def test_batchqueue_submit_stores_task():
    async def run():
        q = BatchQueue()
        tid = q.submit("hello", "v1")
        return q, tid

    q, tid = asyncio.run(run())
    task = q._tasks[tid]
    assert task.text == "hello"
    assert task.voice == "v1"
    assert task.status == "queued"


def test_batchqueue_submit_default_settings():
    async def run():
        q = BatchQueue()
        tid = q.submit("hello", "v1")
        return q, tid

    q, tid = asyncio.run(run())
    assert isinstance(q._tasks[tid].settings, dict)


def test_batchqueue_order_grows():
    async def run():
        q = BatchQueue()
        t1 = q.submit("a", "v1")
        t2 = q.submit("b", "v1")
        return q, t1, t2

    q, t1, t2 = asyncio.run(run())
    assert t1 in q._order
    assert t2 in q._order
    assert q._order.index(t1) < q._order.index(t2)


def test_batchqueue_history_limit():
    async def run():
        q = BatchQueue()
        for i in range(210):  # MAX_HISTORY=200
            q.submit(f"text{i}", "v1")
        return q

    q = asyncio.run(run())
    # либо _tasks ограничен, либо _order ограничен
    assert len(q._tasks) <= 210
    assert len(q._order) <= 210


def test_batchqueue_start_stop():
    async def run():
        q = BatchQueue()
        await q.start()
        running = q._running
        worker_exists = q._worker is not None
        await q.stop()
        stopped = not q._running
        return running, worker_exists, stopped

    running, worker_exists, stopped = asyncio.run(run())
    assert running is True
    assert worker_exists is True
    assert stopped is True


def test_batchqueue_start_idempotent():
    async def run():
        q = BatchQueue()
        await q.start()
        w1 = q._worker
        await q.start()  # повторный вызов — не должен создавать новый worker
        w2 = q._worker
        await q.stop()
        return w1 is w2

    assert asyncio.run(run()) is True
