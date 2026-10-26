"""Doctor: check system health."""

from __future__ import annotations

import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))
VENV_PY = Path("/Users/nazar/Documents/AAC/code/bin/python")


def check(name, fn):
    try:
        ok, detail = fn()
        return ("PASS" if ok else "FAIL", name, detail)
    except Exception as e:
        return ("FAIL", name, str(e)[:80])


def check_venv():
    return (VENV_PY.exists(), str(VENV_PY))


def check_torch():
    import torch

    return (torch.backends.mps.is_available(), f"torch {torch.__version__}")


def check_models():
    import backend.core.paths as paths

    required = ["s3gen.pt", "t3_mtl23ls_v2.safetensors"]
    missing = [r for r in required if not (paths.PRETRAINED / r).exists()]
    return (not missing, "missing: " + ",".join(missing) if missing else "all present")


def check_disk():
    total, used, free = shutil.disk_usage("/")
    free_gb = free / (1024**3)
    return (free_gb > 1.0, f"free: {free_gb:.1f} GB")


def check_memory():
    import psutil

    vm = psutil.virtual_memory()
    return (vm.percent < 90, f"used: {vm.percent:.0f}%")


def check_server():
    import urllib.request

    try:
        r = urllib.request.urlopen("http://127.0.0.1:8000/healthz", timeout=3)
        return (r.status == 200, f"HTTP {r.status}")
    except Exception as e:
        return (False, str(e)[:80])


def check_journal():
    from backend.services import journal

    stats = journal.stats()
    return (True, f"actions={stats['actions']['count']} errors={stats['errors']['count']}")


def main():
    checks = [
        check("venv", check_venv),
        check("torch + MPS", check_torch),
        check("models", check_models),
        check("disk", check_disk),
        check("memory", check_memory),
        check("server /healthz", check_server),
        check("journal", check_journal),
    ]
    fails = 0
    for status, name, detail in checks:
        icon = "PASS" if status == "PASS" else "FAIL"
        print(f"[{icon}] {name:20s} — {detail}")
        if status == "FAIL":
            fails += 1
    print()
    if fails:
        print(f"{fails} failures")
        sys.exit(1)
    print("all checks passed")
    sys.exit(0)


if __name__ == "__main__":
    main()
