__version__ = "2.0.0"

# === v1.10.71: load .env before imports ===
import os as _os_env
from pathlib import Path as _Path_env

def _load_env_files_safe():
    try:
        for _fname in (".env.local", ".env"):
            _p = _Path_env(__file__).resolve().parent.parent / _fname
            if not _p.exists():
                continue
            try:
                for _line in _p.read_text(encoding="utf-8").splitlines():
                    _line = _line.strip()
                    if not _line or _line.startswith("#") or "=" not in _line:
                        continue
                    _k, _, _v = _line.partition("=")
                    _k = _k.strip()
                    _v = _v.strip().strip(chr(34)).strip(chr(39))
                    if _k and _k not in _os_env.environ:
                        _os_env.environ[_k] = _v
            except Exception:
                pass
    except Exception:
        pass

_load_env_files_safe()
# === /v1.10.71 ===
