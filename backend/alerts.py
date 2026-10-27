"""v1.9.5: Alert channel skeleton.

Работает как no-op если JST_SENTRY_DSN не задан ИЛИ нет webhook URL.

Каналы:
1. Sentry events (если observability.init_observability() успешен)
2. Webhook (Slack/Telegram/Discord через JST_ALERT_WEBHOOK)

Интеграция:
- 5xx > 1% за 5 мин → send_alert("error_rate", {...})
- Circuit breaker open → send_alert("circuit_open", {model, timeout})
- Auth brute-force ban → send_alert("auth_ban", {ip_count})
"""

from __future__ import annotations

import json
import logging
import os
import time
import urllib.request
from collections import deque

log = logging.getLogger("JST.Alerts")

_WINDOW_SEC = 300.0  # 5 min
_ERROR_THRESHOLD = 0.01  # 1%
_MIN_REQUESTS = 20  # игнорируем статистику на малой выборке

_requests_5xx: deque = deque(maxlen=10000)  # (ts, is_error)
_last_alert: dict[str, float] = {}
_DEDUP_SEC = 60.0  # не спамить чаще раза в минуту по тому же типу


def _should_dedup(kind: str) -> bool:
    now = time.time()
    last = _last_alert.get(kind, 0.0)
    if now - last < _DEDUP_SEC:
        return True
    _last_alert[kind] = now
    return False


def _send_webhook(kind: str, payload: dict) -> bool:
    """POST JSON в webhook URL. Возвращает True если отправлено."""
    url = os.getenv("JST_ALERT_WEBHOOK", "").strip()
    if not url:
        return False
    try:
        data = json.dumps(
            {"kind": kind, "ts": time.time(), "payload": payload}, ensure_ascii=False
        ).encode()
        req = urllib.request.Request(
            url,
            data=data,
            method="POST",
            headers={"Content-Type": "application/json", "User-Agent": "JST-Alerts/1.9.5"},
        )
        with urllib.request.urlopen(req, timeout=5.0) as resp:  # nosec B310 (webhook URL из env)
            return 200 <= resp.status < 300
    except Exception as e:
        log.warning("[alerts] webhook failed: %s", e)
        return False


def _send_sentry(kind: str, payload: dict) -> bool:
    try:
        import sentry_sdk

        with sentry_sdk.push_scope() as scope:
            scope.set_tag("alert_kind", kind)
            for k, v in payload.items():
                scope.set_extra(k, v)
            sentry_sdk.capture_message(f"[JST alert] {kind}", level="warning")
        return True
    except Exception:
        return False


def send_alert(kind: str, payload: dict) -> None:
    """Единая точка для алертов. Dedup + multi-channel."""
    if _should_dedup(kind):
        return
    log.warning("[alert] %s: %s", kind, payload)
    sent_webhook = _send_webhook(kind, payload)
    sent_sentry = _send_sentry(kind, payload)
    if not (sent_webhook or sent_sentry):
        log.info("[alert] no channels configured — logged only")


def record_request(status_code: int) -> None:
    """Вызывается из audit middleware. Считает error rate."""
    now = time.time()
    is_error = 500 <= status_code < 600
    _requests_5xx.append((now, is_error))
    # Чистим старые
    cutoff = now - _WINDOW_SEC
    while _requests_5xx and _requests_5xx[0][0] < cutoff:
        _requests_5xx.popleft()
    # Проверка threshold
    if len(_requests_5xx) >= _MIN_REQUESTS:
        errors = sum(1 for _, e in _requests_5xx if e)
        rate = errors / len(_requests_5xx)
        if rate > _ERROR_THRESHOLD:
            send_alert(
                "error_rate",
                {
                    "window_sec": _WINDOW_SEC,
                    "requests": len(_requests_5xx),
                    "errors": errors,
                    "rate": round(rate * 100, 2),
                    "threshold_pct": _ERROR_THRESHOLD * 100,
                },
            )


def stats() -> dict:
    """Публичный статус для diagnostics."""
    now = time.time()
    cutoff = now - _WINDOW_SEC
    recent = [(t, e) for t, e in _requests_5xx if t >= cutoff]
    errors = sum(1 for _, e in recent if e)
    return {
        "window_sec": _WINDOW_SEC,
        "requests": len(recent),
        "errors_5xx": errors,
        "error_rate_pct": round(errors / len(recent) * 100, 2) if recent else 0.0,
        "threshold_pct": _ERROR_THRESHOLD * 100,
        "webhook_configured": bool(os.getenv("JST_ALERT_WEBHOOK", "").strip()),
        "sentry_configured": bool(os.getenv("JST_SENTRY_DSN", "").strip()),
    }
