"""Moods API endpoint."""
from fastapi import APIRouter, HTTPException

router = APIRouter()


@router.get("/api/moods")
async def api_moods():
    from ..services.jst_moods import list_moods
    all_moods = list_moods()
    spirits = {k: v for k, v in all_moods.items() if k.startswith("spirit_")}
    return {"moods": spirits, "auto": True}
