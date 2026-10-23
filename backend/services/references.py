"""Reference audio: собирает merged_reference_<voice>.wav из файлов профиля."""
from __future__ import annotations
import logging

import librosa, numpy as np, soundfile as sf

from ..core.paths import VOICES, OUTPUT, SUPPORTED
from ..core.utils import _num

log = logging.getLogger("JST")


def build_reference(voice: str, total: float = 15.0):
    folder = VOICES / voice
    if not folder.is_dir(): return None
    files = sorted(f for f in folder.iterdir() if f.suffix.lower() in SUPPORTED)
    if not files: return None
    import noisereduce as nr
    SR = 24000; chunks = []
    per_file = max(4.0, _num(total, 15.0) / len(files))
    for f in files:
        try: y, _ = librosa.load(str(f), sr=SR, mono=True)
        except Exception: continue
        y, _ = librosa.effects.trim(y, top_db=25)
        y = nr.reduce_noise(y=y, sr=SR, stationary=True, prop_decrease=0.6)
        peak = np.max(np.abs(y)) + 1e-9; y = y / peak * 0.9
        n = int(per_file * SR)
        if len(y) < n:
            if len(y) < 2 * SR: continue
            n = len(y)
        s = (len(y) - n) // 2
        chunks.append(y[s:s+n])
    if not chunks: return None
    merged = np.concatenate(chunks)
    mx = int(_num(total, 15.0) * SR)
    if len(merged) > mx:
        mid = len(merged)//2; s = max(0, mid - mx//2)
        merged = merged[s:s+mx]
    peak = np.max(np.abs(merged)) + 1e-9
    merged = (merged / peak * 0.95).astype(np.float32)
    out = OUTPUT / f"merged_reference_{voice}.wav"
    sf.write(str(out), merged, SR)
    log.info("Reference '%s': %.1f s -> %s", voice, len(merged)/SR, out.name)
    return out


def resolve_reference(voice: str, ref_length: int):
    per = OUTPUT / f"merged_reference_{voice}.wav"
    if per.exists():
        try:
            info = sf.info(str(per))
            dur = info.frames / info.samplerate
            if abs(dur - ref_length) > 3:
                return build_reference(voice, ref_length) or per
            return per
        except Exception: return per
    return build_reference(voice, ref_length)
