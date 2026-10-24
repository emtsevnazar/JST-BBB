"""P5.4: real-engine smoke — путь Engine.synth_one → save_output → history → export.

По умолчанию SKIPPED (нужны реальные веса ~2GB и загрузка Engine 30-60 с).
CI этот файл не трогает (skipif не проходит).

Запуск локально:

    cd backend
    JST_REAL_ENGINE=1 /Users/nazar/Documents/AAC/code/bin/python3 \
        -m pytest tests/test_real_engine.py -v -s --no-cov

Проверяет:
- Engine грузится (lifespan), /health = ok
- POST /api/batch → done (без ошибок save_output / ffmpeg)
- result_file существует в OUTPUT, размер > 10 KB (не пустой wav)
- /api/history/{id} → status=done, result_file совпадает
- /api/history/{id}/export → ZIP (audio + settings.json + metadata.json)
- второй прогон с settings.output_format="mp3" → result_file оканчивается .mp3
"""

from __future__ import annotations

import io
import os
import time
import zipfile

import pytest

pytestmark = pytest.mark.skipif(
    not os.getenv("JST_REAL_ENGINE"),
    reason="real-engine smoke: set JST_REAL_ENGINE=1 (нужны веса ~2GB)",
)


def _wait_done(client, task_id: str, timeout: float = 180.0) -> dict:
    deadline = time.time() + timeout
    last = None
    while time.time() < deadline:
        time.sleep(0.5)
        r = client.get(f"/api/batch/{task_id}")
        assert r.status_code == 200, r.text
        last = r.json()["task"]
        if last["status"] in ("done", "error", "cancelled"):
            return last
    raise AssertionError(f"batch {task_id} не завершился за {timeout}с: {last}")


def test_real_batch_wav_and_export(real_client):
    # 1) health + engine готов
    r = real_client.get("/health")
    assert r.status_code == 200, r.text
    h = r.json()
    assert h["ok"] is True
    assert h["engine_ready"] is True

    # 2) batch → done
    r = real_client.post(
        "/api/batch",
        json={"text": "Проверка реального движка. Раз, два, три.", "voice": "", "settings": {}},
    )
    assert r.status_code == 200, r.text
    tid = r.json()["task_id"]

    task = _wait_done(real_client, tid)
    assert task["status"] == "done", f"error: {task.get('error')}"
    assert task["result_file"], "result_file пустой"
    assert task["result_file"].endswith(".wav"), task["result_file"]

    # 3) файл реально на диске и не пустой
    from backend.services import output_service

    audio = output_service.OUTPUT / task["result_file"]
    assert audio.exists(), f"нет файла {audio}"
    size = audio.stat().st_size
    assert size > 10_000, f"файл слишком маленький ({size} B) — возможно, пустой wav"

    # 4) history содержит запись
    r = real_client.get(f"/api/history/{tid}")
    assert r.status_code == 200, r.text
    hist = r.json()["task"]
    assert hist["status"] == "done"
    assert hist["result_file"] == task["result_file"]
    assert hist["text"].startswith("Проверка реального движка")

    # 5) ZIP-экспорт — 3 файла, метаданные корректны
    r = real_client.get(f"/api/history/{tid}/export")
    assert r.status_code == 200, r.text
    assert r.headers["content-type"].startswith("application/zip")
    zf = zipfile.ZipFile(io.BytesIO(r.content))
    names = zf.namelist()
    assert any(n.startswith("audio.") for n in names), names
    assert "settings.json" in names
    assert "metadata.json" in names
    # аудио в архиве совпадает по размеру с файлом на диске
    audio_in_zip = next(n for n in names if n.startswith("audio."))
    assert len(zf.read(audio_in_zip)) == size


def test_real_batch_mp3_conversion(real_client):
    """save_output для mp3 идёт через ffmpeg — проверяем, что конвертация не падает."""
    r = real_client.post(
        "/api/batch",
        json={
            "text": "Конвертация в mp3.",
            "voice": "",
            "settings": {"output_format": "mp3"},
        },
    )
    assert r.status_code == 200, r.text
    tid = r.json()["task_id"]

    task = _wait_done(real_client, tid)
    assert task["status"] == "done", f"error: {task.get('error')}"
    assert task["result_file"], "result_file пустой"
    assert task["result_file"].endswith(".mp3"), (
        f"ожидали .mp3, получили {task['result_file']} — "
        "вероятно, ffmpeg не установлен и save_output вернул fallback wav"
    )

    from backend.services import output_service

    audio = output_service.OUTPUT / task["result_file"]
    assert audio.exists()
    assert audio.stat().st_size > 5_000
