"""v1.8.1: Bootstrap helpers — auto-token init.

Вынесено из app.py для чистоты и переиспользования.
"""

from __future__ import annotations

import logging
import os

log = logging.getLogger("JST.Bootstrap")


def _init_admin_token() -> None:
    """v1.7.10: загрузить JST_ADMIN_TOKEN из .env.local (если есть) или сгенерировать.

    Логика:
    1. Если JST_ADMIN_TOKEN уже в os.environ — используем его.
    2. Иначе читаем .env.local: если там есть токен — загружаем в environ.
    3. Иначе генерируем новый, ПЕРЕЗАПИСЫВАЕМ .env.local (не append!),
       chmod 600, выводим в log.warning (shown once).
    """
    import secrets as _secrets
    import time as _time
    from pathlib import Path as _Path

    if os.getenv("JST_ADMIN_TOKEN", "").strip():
        log.info("[security] JST_ADMIN_TOKEN already in env")
        return

    env_local = _Path(__file__).resolve().parent.parent / ".env.local"

    # Шаг 1: попытаться прочитать из .env.local
    existing_token = None
    if env_local.exists():
        try:
            for line in env_local.read_text(encoding="utf-8").splitlines():
                line = line.strip()
                if line.startswith("JST_ADMIN_TOKEN="):
                    existing_token = line.split("=", 1)[1].strip()
        except Exception as e:
            log.warning("[security] failed to read .env.local: %s", e)

    if existing_token:
        os.environ["JST_ADMIN_TOKEN"] = existing_token
        log.info("[security] JST_ADMIN_TOKEN loaded from .env.local")
        return

    # Шаг 2: сгенерировать новый
    token = _secrets.token_urlsafe(32)
    os.environ["JST_ADMIN_TOKEN"] = token
    log.warning("[security] JST_ADMIN_TOKEN auto-generated. Shown ONCE below:")
    log.warning("[security]   JST_ADMIN_TOKEN=%s", token)
    try:
        # ПЕРЕЗАПИСЫВАЕМ (не append!) — гарантирует один токен в файле
        with env_local.open("w", encoding="utf-8") as f:
            f.write("# v1.7.10: auto-generated secrets — DO NOT COMMIT\n")
            f.write(f"# {_time.strftime('%Y-%m-%d %H:%M:%S')}\n")
            f.write(f"JST_ADMIN_TOKEN={token}\n")
        try:
            os.chmod(env_local, 0o600)
        except Exception:
            pass
        log.info("[security] token saved to %s (chmod 600)", env_local)
    except Exception as e:
        log.error("[security] failed to save token: %s", e)
