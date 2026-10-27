"""v1.8.5: Observability — Sentry init (no-op если JST_SENTRY_DSN не задан).

Использование:
  from .observability import init_observability
  init_observability()  # вызывается в app.py до FastAPI()

Если JST_SENTRY_DSN не установлен — полностью no-op, нулевые накладные расходы.
Если установлен — ловит исключения, performance traces, request IDs.
"""

from __future__ import annotations

import logging
import os

log = logging.getLogger("JST.Observability")


def init_observability() -> bool:
    """Инициализирует Sentry если JST_SENTRY_DSN задан. Возвращает True если включён."""
    dsn = os.getenv("JST_SENTRY_DSN", "").strip()
    if not dsn:
        log.info("[sentry] JST_SENTRY_DSN not set — observability disabled (no-op)")
        return False

    try:
        import sentry_sdk
        from sentry_sdk.integrations.fastapi import FastApiIntegration
        from sentry_sdk.integrations.starlette import StarletteIntegration
    except ImportError:
        log.warning(
            "[sentry] JST_SENTRY_DSN is set but sentry-sdk not installed. "
            "Install: pip install 'sentry-sdk[fastapi]'"
        )
        return False

    env = os.getenv("JST_ENV", "dev").lower()
    traces = float(os.getenv("JST_SENTRY_TRACES_RATE", "0.1"))

    try:
        sentry_sdk.init(
            dsn=dsn,
            environment=env,
            release=os.getenv("JST_RELEASE", "jst-studio@1.8.5"),
            traces_sample_rate=traces,
            profiles_sample_rate=traces,
            send_default_pii=False,
            attach_stacktrace=True,
            integrations=[
                FastApiIntegration(),
                StarletteIntegration(),
            ],
            before_send=_before_send,
        )
        log.info("[sentry] initialized: env=%s, traces=%.2f", env, traces)
        return True
    except Exception as e:
        log.error("[sentry] init failed: %s", e)
        return False


def _before_send(event, hint):
    """Не отправлять 401/403/404 — это нормальные auth/404, шум."""
    exc = hint.get("exc_info")
    if exc:
        from fastapi import HTTPException

        if isinstance(exc[1], HTTPException) and exc[1].status_code in (401, 403, 404):
            return None
    return event


def capture_message(msg: str, level: str = "info", **extra) -> None:
    """No-op если Sentry выключен."""
    try:
        import sentry_sdk

        sentry_sdk.capture_message(msg, level=level)
        with sentry_sdk.push_scope() as scope:
            for k, v in extra.items():
                scope.set_extra(k, v)
    except Exception:
        pass
