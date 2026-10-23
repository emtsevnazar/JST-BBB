"""Централизованная конфигурация из env / .env (pydantic-settings)."""
from __future__ import annotations

import os
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

ROOT = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    """Настройки приложения. Читаются из .env и os.environ."""

    model_config = SettingsConfigDict(
        env_file=ROOT / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    # HTTP
    host: str = "127.0.0.1"
    port: int = 8000

    # HuggingFace
    hf_token: str | None = None
    hf_home: str | None = None

    # PyTorch MPS
    pytorch_enable_mps_fallback: str = "1"
    pytorch_mps_high_watermark_ratio: str = "0.0"


# Один экземпляр на процесс
settings = Settings()

# Экспорт в os.environ до импорта downstream-библиотек (huggingface_hub и др.)
if settings.hf_token:
    os.environ["HF_TOKEN"] = settings.hf_token
if settings.hf_home:
    os.environ["HF_HOME"] = settings.hf_home
os.environ["PYTORCH_ENABLE_MPS_FALLBACK"] = settings.pytorch_enable_mps_fallback
os.environ["PYTORCH_MPS_HIGH_WATERMARK_RATIO"] = settings.pytorch_mps_high_watermark_ratio
