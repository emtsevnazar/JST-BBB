"""Пути проекта: ROOT, FRONTEND, VOICES, OUTPUT, REFERENCE, SUPPORTED.

Импорт этого модуля создаёт папки VOICES, OUTPUT, FRONTEND (если их нет).
"""

from pathlib import Path

ROOT = Path(__file__).parents[2].resolve()  # voice_forge_studio/
FRONTEND = ROOT / "frontend"
VOICES = ROOT / "voices"
OUTPUT = ROOT / "output"
REFERENCE = OUTPUT / "merged_reference.wav"

for _d in (VOICES, OUTPUT, FRONTEND):
    _d.mkdir(exist_ok=True)

SUPPORTED = {".wav", ".mp3", ".m4a", ".opus", ".flac", ".ogg"}
REFERENCE_EN = OUTPUT / "merged_reference_en.wav"

# v1.7.1: путь к pretrained_models (может быть вне проекта)
_CANDIDATES = [
    ROOT / "pretrained_models",
    ROOT.parent / "pretrained_models",
    Path.home() / "Documents/AAC/main/pretrained_models",
    ROOT.parent.parent / "main/pretrained_models",
]
PRETRAINED = next((c for c in _CANDIDATES if (c / "s3gen.pt").exists()), _CANDIDATES[0])
