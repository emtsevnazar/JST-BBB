# JST Studio — Безопасность

## Auth
- **`X-API-Key: <JST_API_KEY>`** — для всех непубличных HTTP и WS.
- **`X-Admin-Token: <JST_ADMIN_TOKEN>`** — для `/api/admin/error-state` (POST/DELETE).
- **Dev** (без `JST_API_KEY`): всё открыто, WARNING в лог.
- **Prod** (`JST_ENV=production` без `JST_API_KEY`): 503.
- **Публичные:** `/healthz`, `/readyz`, `/dashboard`, `/api/security/stats`, `/error`, `/api/error-state`, `/favicon.ico`, `/api/voice-clone/health`.

## Middleware (порядок = снизу вверх по `add_middleware`)
- **SecurityHeadersMiddleware** — CSP, `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy`
- **RequestSizeLimitMiddleware** — лимит тела
- **CORS** — `JST_ALLOWED_ORIGINS` или whitelist (`127.0.0.1`, `localhost`, `tauri://`)
- **TrustedHostMiddleware** — `JST_ALLOWED_HOSTS` (anti DNS rebinding)
- **GZipMiddleware** (min 500)
- **`@app.middleware("http")`** — redirect на `/error` при unhealthy

## Rate limiting (`RateLimiterV2`)
- `/api/` → **120 req / 60s / IP**
- `/ws/` → **20 conn / 60s / IP**
- `/api/emergency/` → **10 req / 60s / IP**
- Brute-force auth: N fail → IP в `blocklist` (ban)

## Prod hardening (`JST_ENV=production`)
- `docs_url=None` (нет `/docs`)
- `redoc_url=None` (нет `/redoc`)
- `openapi_url=None` (нет `/openapi.json`)
- `TrustedHostMiddleware` обязателен
- `X-Frame-Options: DENY`
- CSP через `SecurityHeadersMiddleware`
- `JST_API_KEY` обязателен (иначе 503)

## Env vars
| Переменная | Назначение | Default |
|---|---|---|
| `JST_ENV` | `dev` / `production` | `dev` |
| `JST_API_KEY` | Ключ для `X-API-Key` | (пусто = dev) |
| `JST_ADMIN_TOKEN` | Токен для `/api/admin/*` | генерируется в `bootstrap.py` |
| `JST_ALLOWED_ORIGINS` | CORS (csv) | whitelist |
| `JST_ALLOWED_HOSTS` | TrustedHost (csv) | `127.0.0.1,localhost` |
| `HOST` / `PORT` | Bind | `127.0.0.1` / `8000` |

## Известные ограничения
- **BOLA/IDOR**: `history/{id}` и `batch/{id}` не проверяют владельца. Приемлемо для `127.0.0.1`. Для публичного — нужна user-auth + owner check.
- **ML threadpool**: `engine.synth_one` через `loop.run_in_executor`, `whisper.transcribe` — аналогично (не блокирует event loop).
- **Аудит**: `pip-audit` 0 CVE, `bandit -ll` 0 findings.
- **Тесты**: auth подменяется фикстурой `_api_key` в `tests/conftest.py`.

## Чек-лист публичного деплоя
- [ ] `JST_ENV=production`
- [ ] `JST_API_KEY` (длинный, случайный)
- [ ] `JST_ALLOWED_HOSTS` / `JST_ALLOWED_ORIGINS` — реальные
- [ ] HTTPS (reverse-proxy)
- [ ] User auth + owner check в history/batch (BOLA)
- [ ] `JST_SENTRY_DSN` для observability
