"""
JST Security Hardening v1.0 (v1.7.10)
- IPBlocklist: 5 fails / 5min -> 15min ban
- RateLimiterV2: per-(ip, prefix) buckets (fix: /api/ eats /ws/ budget)
- SelfHealingWatchdog: thread probes /healthz -> SIGTERM self on 3 fails
"""

from __future__ import annotations

import logging
import os
import signal
import threading
import time
import urllib.error
import urllib.request
from collections import deque

log = logging.getLogger("JST.Hardening")


class IPBlocklist:
    def __init__(
        self,
        threshold: int = 5,
        fail_window: float = 300.0,
        ban_duration: float = 900.0,
        max_ips: int = 10000,
    ):
        self.threshold = threshold
        self.fail_window = fail_window
        self.ban_duration = ban_duration
        self.max_ips = max_ips
        self._fails: dict[str, deque] = {}
        self._banned: dict[str, float] = {}
        self._lock = threading.Lock()
        self._stats = {"bans_total": 0, "checks_total": 0, "blocked_total": 0}

    def is_banned(self, ip: str) -> bool:
        with self._lock:
            self._stats["checks_total"] += 1
            until = self._banned.get(ip)
            if until is None:
                return False
            if time.time() >= until:
                del self._banned[ip]
                return False
            self._stats["blocked_total"] += 1
            return True

    def record_fail(self, ip: str, reason: str = "") -> bool:
        with self._lock:
            now = time.time()
            dq = self._fails.setdefault(ip, deque(maxlen=50))
            dq.append(now)
            while dq and now - dq[0] > self.fail_window:
                dq.popleft()
            if len(dq) >= self.threshold:
                self._banned[ip] = now + self.ban_duration
                self._stats["bans_total"] += 1
                log.warning(
                    "IP banned: %s for %ss (%d fails, reason=%s)",
                    ip,
                    self.ban_duration,
                    len(dq),
                    reason or "n/a",
                )
                dq.clear()
                if len(self._banned) > self.max_ips:
                    oldest = min(self._banned, key=self._banned.get)
                    del self._banned[oldest]
                return True
            return False

    def record_success(self, ip: str) -> None:
        with self._lock:
            self._fails.pop(ip, None)

    def unblock(self, ip: str) -> bool:
        with self._lock:
            was = ip in self._banned
            self._banned.pop(ip, None)
            self._fails.pop(ip, None)
            return was

    def ban_now(self, ip: str, reason: str = "") -> bool:
        """v1.9.1: принудительный бан (brute-force protection)."""
        with self._lock:
            self._banned[ip] = time.time() + self.ban_duration
            self._stats["bans_total"] += 1
            log.warning("IP force-banned: %s for %ss (%s)", ip, self.ban_duration, reason or "n/a")
            return True

    def stats(self) -> dict:
        with self._lock:
            now = time.time()
            active = {
                ip: round(until - now, 1) for ip, until in self._banned.items() if until > now
            }
            return {
                **self._stats,
                "active_bans": len(active),
                "banned_ips": list(active.items())[:20],
            }


class RateLimiterV2:
    def __init__(self, limits: dict[str, tuple[int, float]], max_buckets: int = 10000):
        self.limits = limits
        self.max_buckets = max_buckets
        self._buckets: dict[tuple[str, str], deque] = {}
        self._lock = threading.Lock()
        self._stats = {"hits": 0, "exceeded": 0}

    def _match_prefix(self, path: str):
        # v1.7.10-fix: longest prefix first so /api/emergency/ wins over /api/
        for prefix in sorted(self.limits.keys(), key=len, reverse=True):
            if path.startswith(prefix):
                limit, window = self.limits[prefix]
                return prefix, limit, window
        return None

    def check(self, ip: str, path: str) -> bool:
        m = self._match_prefix(path)
        if m is None:
            return True
        prefix, limit, window = m
        with self._lock:
            self._stats["hits"] += 1
            now = time.time()
            key = (ip, prefix)
            bucket = self._buckets.setdefault(key, deque(maxlen=limit * 2))
            while bucket and now - bucket[0] > window:
                bucket.popleft()
            if len(bucket) >= limit:
                self._stats["exceeded"] += 1
                return False
            bucket.append(now)
            if len(self._buckets) > self.max_buckets:
                self._buckets.pop(next(iter(self._buckets)), None)
            return True

    def get_limit(self, path: str) -> tuple[int, float] | None:
        """v1.9.2: возвращает (limit, window_seconds) для пути или None."""
        m = self._match_prefix(path)
        if m is None:
            return None
        _, limit, window = m
        return limit, window

    def reset_seconds(self, ip: str, path: str) -> float:
        """v1.9.2: секунды до освобождения самой старой записи в bucket."""
        m = self._match_prefix(path)
        if m is None:
            return 0.0
        prefix, _, window = m
        with self._lock:
            now = time.time()
            bucket = self._buckets.get((ip, prefix))
            if not bucket:
                return 0.0
            oldest = bucket[0]
            return max(0.0, window - (now - oldest))

    def remaining(self, ip: str, path: str) -> int:
        m = self._match_prefix(path)
        if m is None:
            return -1
        prefix, limit, window = m
        with self._lock:
            now = time.time()
            bucket = self._buckets.get((ip, prefix), deque())
            hits = sum(1 for t in bucket if now - t <= window)
            return max(0, limit - hits)

    def stats(self) -> dict:
        with self._lock:
            return {**self._stats, "buckets": len(self._buckets)}


class CircuitBreaker:
    """v1.9.4: Circuit breaker для TTS-моделей.

    После threshold последовательных ошибок — модель временно отключается
    на timeout секунд. Fallback на другую модель в ws.py/batch.py.

    Auto-close: если после timeout снова ошибка → повторно открыть.
    """

    def __init__(self, threshold: int = 3, timeout: float = 30.0, max_keys: int = 1000):
        self.threshold = threshold
        self.timeout = timeout
        self.max_keys = max_keys
        self._failures: dict[str, int] = {}
        self._opened_at: dict[str, float] = {}
        self._lock = threading.Lock()
        self._stats = {"checks": 0, "opens": 0, "rejects": 0, "successes": 0}

    def is_open(self, key: str) -> bool:
        with self._lock:
            self._stats["checks"] += 1
            opened = self._opened_at.get(key)
            if opened is None:
                return False
            if time.time() - opened > self.timeout:
                self._opened_at.pop(key, None)
                self._failures.pop(key, None)
                return False
            self._stats["rejects"] += 1
            return True

    def remaining(self, key: str) -> float:
        """Секунды до автозакрытия, 0 если не открыт."""
        with self._lock:
            opened = self._opened_at.get(key)
            if opened is None:
                return 0.0
            return max(0.0, self.timeout - (time.time() - opened))

    def record_success(self, key: str) -> None:
        with self._lock:
            self._failures.pop(key, None)
            self._opened_at.pop(key, None)
            self._stats["successes"] += 1

    def record_failure(self, key: str) -> None:
        with self._lock:
            self._failures[key] = self._failures.get(key, 0) + 1
            if self._failures[key] >= self.threshold:
                self._opened_at[key] = time.time()
                self._stats["opens"] += 1
                log.warning(
                    "circuit OPEN: %s (threshold=%d, timeout=%.0fs)",
                    key,
                    self.threshold,
                    self.timeout,
                )
            if len(self._failures) > self.max_keys:
                self._failures.pop(next(iter(self._failures)), None)

    def stats(self) -> dict:
        with self._lock:
            return {
                **self._stats,
                "open": list(self._opened_at.keys()),
                "tracked": len(self._failures),
                "threshold": self.threshold,
                "timeout": self.timeout,
            }


class SelfHealingWatchdog:
    def __init__(
        self,
        url: str = "http://127.0.0.1:8000/healthz",
        interval: float = 20.0,
        threshold: int = 3,
        startup_grace: float = 120.0,
    ):
        self.url = url
        self.interval = interval
        self.threshold = threshold
        self._fails = 0
        self._kicks = 0
        self._last_check = 0.0
        self._last_status = "unknown"
        self._lock = threading.Lock()
        self._thread: threading.Thread | None = None
        self._stop = threading.Event()
        self.startup_grace = startup_grace
        self.started_at = time.time()

    def start(self):
        if self._thread and self._thread.is_alive():
            return
        self._thread = threading.Thread(target=self._run, daemon=True, name="watchdog")
        self._thread.start()
        log.info("[watchdog] started (interval=%ss, threshold=%d)", self.interval, self.threshold)

    def stop(self):
        self._stop.set()

    def _run(self):
        while not self._stop.wait(self.interval):
            ok = self._probe()
            with self._lock:
                self._last_check = time.time()
                if ok:
                    if self._fails > 0:
                        log.info("[watchdog] healthz recovered")
                    self._fails = 0
                    self._last_status = "ok"
                else:
                    if time.time() - self.started_at < self.startup_grace:
                        self._last_status = "grace"
                        continue
                    self._fails += 1
                    self._last_status = f"fail({self._fails})"
                    log.warning("[watchdog] healthz fail %d/%d", self._fails, self.threshold)
                    if self._fails >= self.threshold:
                        self._recover()

    def _probe(self) -> bool:
        # v1.1.26 FIX: HTTP-ответ (4xx/5xx) = сервер ЖИВ, не убивать его.
        # Watchdog должен ловить только network errors / timeouts (сервер мёртв).
        # Раньше: except Exception: return False — 403 от blocklist → SIGTERM self.
        try:
            with urllib.request.urlopen(self.url, timeout=5.0):  # nosec B310 (internal /healthz only)
                return True  # got response = alive
        except urllib.error.HTTPError:
            return True  # 4xx/5xx = response from live server = alive
        except Exception:
            return False  # ConnectionError / Timeout = server dead

    def _recover(self):
        pid = os.getpid()
        log.error("[watchdog] threshold reached - SIGTERM self (pid=%d)", pid)
        with self._lock:
            self._kicks += 1
            self._fails = 0
        try:
            os.kill(pid, signal.SIGTERM)
        except Exception as e:
            log.error("[watchdog] SIGTERM failed: %s", e)

    def stats(self) -> dict:
        with self._lock:
            return {
                "last_check": self._last_check,
                "last_status": self._last_status,
                "fails": self._fails,
                "kicks": self._kicks,
                "url": self.url,
                "threshold": self.threshold,
                "interval": self.interval,
            }


class AuthBruteForce:
    """v1.9.1: счётчик неудачных auth-попыток по IP.

    После threshold фейлов в window секунд — триггерит ban через IPBlocklist.
    """

    def __init__(self, threshold: int = 5, window: float = 300.0, max_ips: int = 10000):
        self.threshold = threshold
        self.window = window
        self.max_ips = max_ips
        self._fails: dict[str, list[float]] = {}
        self._lock = threading.Lock()
        self._stats = {"checks": 0, "bans": 0}

    def record_fail(self, ip: str) -> bool:
        with self._lock:
            self._stats["checks"] += 1
            now = time.time()
            fails = [t for t in self._fails.get(ip, []) if now - t < self.window]
            fails.append(now)
            if len(fails) >= self.threshold:
                self._fails.pop(ip, None)
                self._stats["bans"] += 1
                return True
            self._fails[ip] = fails
            if len(self._fails) > self.max_ips:
                self._fails.pop(next(iter(self._fails)), None)
            return False

    def record_success(self, ip: str) -> None:
        with self._lock:
            self._fails.pop(ip, None)

    def stats(self) -> dict:
        with self._lock:
            return {**self._stats, "tracked_ips": len(self._fails)}


blocklist = IPBlocklist()
rate_limiter = RateLimiterV2(
    {
        "/api/": (120, 60),
        "/ws/": (20, 60),
        "/api/emergency/": (10, 60),
    }
)
auth_bruteforce = AuthBruteForce()
circuit_breaker = CircuitBreaker()
watchdog = SelfHealingWatchdog()
