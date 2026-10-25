from fastapi import Request

from .app import app

__all__ = ["app"]


@app.get("/api/audit")
async def api_audit(request: Request, limit: int = 100):
    """v0.9.0: Последние N событий аудита (только localhost)."""
    from starlette.responses import JSONResponse

    ip = request.client.host if request.client else "unknown"
    if ip not in ("127.0.0.1", "::1", "localhost"):
        return JSONResponse({"error": "forbidden"}, status_code=403)
    from backend.audit import read_last

    limit = max(1, min(int(limit), 1000))
    return {"count": limit, "events": read_last(limit)}
