"""Централизованный logging: JSON + ротация по дням."""

import logging
import logging.handlers
from pathlib import Path

LOG_DIR = Path("logs")
LOG_DIR.mkdir(exist_ok=True)


def setup_logging(level: int = logging.INFO) -> None:
    root = logging.getLogger()
    root.setLevel(level)

    # JSON-формат для машинной обработки
    json_fmt = logging.Formatter(
        '{"ts":"%(asctime)s","level":"%(levelname)s","logger":"%(name)s","msg":%(message)r}'
    )

    # app.log — JSON, ротация в полночь, 14 дней
    app_handler = logging.handlers.TimedRotatingFileHandler(
        LOG_DIR / "app.log", when="midnight", backupCount=14, encoding="utf-8"
    )
    app_handler.setFormatter(json_fmt)
    root.addHandler(app_handler)

    # error.log — только ERROR+, ротация 30 дней
    err_handler = logging.handlers.TimedRotatingFileHandler(
        LOG_DIR / "error.log", when="midnight", backupCount=30, encoding="utf-8"
    )
    err_handler.setLevel(logging.ERROR)
    err_handler.setFormatter(json_fmt)
    root.addHandler(err_handler)

    # stdout — для launchd (human-readable)
    stream = logging.StreamHandler()
    stream.setFormatter(logging.Formatter("%(asctime)s | %(levelname)-7s | %(name)s | %(message)s"))
    root.addHandler(stream)

    # uvicorn access — в тот же app.log
    for name in ("uvicorn", "uvicorn.access", "uvicorn.error"):
        lg = logging.getLogger(name)
        lg.handlers = [app_handler, stream]
        lg.propagate = False
