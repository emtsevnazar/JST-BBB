"""save_output: конвертирует samples в выбранный формат через ffmpeg."""
from __future__ import annotations
import logging, subprocess

import librosa, numpy as np, soundfile as sf

from ..core.paths import OUTPUT
from ..core.utils import _num, _int

log = logging.getLogger("JST")


def save_output(samples, sr_in, s, base: str):
    sr_out = _int(s.output_sr, 44100)
    if sr_out != sr_in:
        samples = librosa.resample(samples, orig_sr=sr_in, target_sr=sr_out)
    fi = _num(getattr(s, 'fade_in_sec', 0.0), 0.0)
    fo = _num(getattr(s, 'fade_out_sec', 0.0), 0.0)
    if fi > 0:
        n = min(int(fi * sr_out), len(samples)//4)
        if n > 0: samples[:n] *= np.linspace(0, 1, n, dtype=np.float32)
    if fo > 0:
        n = min(int(fo * sr_out), len(samples)//4)
        if n > 0: samples[-n:] *= np.linspace(1, 0, n, dtype=np.float32)
    wav = OUTPUT / f"{base}.wav"
    bits = _int(s.bit_depth, 16)
    subtype = {8:"PCM_U8", 16:"PCM_16", 24:"PCM_24", 32:"FLOAT"}.get(bits, "PCM_16")
    sf.write(str(wav), samples, sr_out, subtype=subtype)
    fmt = s.output_format or "wav"
    if fmt == "wav": return wav.name
    out = OUTPUT / f"{base}.{fmt}"
    cmd = ["ffmpeg","-y","-i",str(wav)]
    if fmt == "mp3": cmd += ["-b:a","320k"]
    elif fmt == "flac": cmd += ["-compression_level","5"]
    elif fmt == "ogg": cmd += ["-q:a","8"]
    elif fmt == "m4a": cmd += ["-c:a","aac","-b:a","256k"]
    elif fmt == "opus": cmd += ["-c:a","libopus","-b:a","192k"]
    cmd.append(str(out))
    try:
        subprocess.run(cmd, check=True, capture_output=True); return out.name
    except Exception as e:
        log.warning("ffmpeg: %s", e); return wav.name
