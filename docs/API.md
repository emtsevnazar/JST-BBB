# JST Studio — API Reference

Base URL: http://127.0.0.1:8000
Auth: X-API-Key header (dev: no key required)

## Health & Status
GET /health
GET /healthz
GET /readyz
GET /api/health
GET /api/metrics
GET /api/models
GET /api/languages
GET /api/moods
GET /api/presets
GET /api/formats
POST /api/mode

## Synthesis & Batch
WS /ws/synthesize
POST /api/batch
GET /api/batch/{task_id}
GET /api/batch?limit=50
DELETE /api/batch/{task_id}
WS /ws/batch/{task_id}

## History & Output
GET /api/history?limit=50
GET /api/history/{task_id}
GET /api/history/{task_id}/export
GET /api/output
GET /output/{filename}
POST /api/clear-history
GET /api/download-all-zip
GET /api/download-all-merged

## Voices & STT
GET /api/voices
POST /api/voices/create
POST /api/voices/{voice}/upload
POST /api/voices/{voice}/upload-blob
POST /api/voices/{voice}/rebuild-reference
POST /api/stt
WS /ws/stt

## AI / Emergency / Security
(prefix см. в backend/app.py)
GET /status, POST /enhance
POST /stop, POST /resume, POST /restart
GET /stats, POST /unblock, GET/POST /housekeeping, GET /diagnostics

## Frontend & PWA
GET /
GET /static/*
GET /error
GET /offline
GET /manifest.json
GET /sw.js

## Пример: batch → history → export
curl -X POST http://127.0.0.1:8000/api/batch -H 'Content-Type: application/json' -d '{"text":"hi","voice":"","settings":{}}'
curl http://127.0.0.1:8000/api/history/TASK_ID
curl -o task.zip http://127.0.0.1:8000/api/history/TASK_ID/export
