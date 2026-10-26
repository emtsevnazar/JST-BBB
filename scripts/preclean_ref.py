"""Pre-generate ref_clean в отдельном процессе.

Причина: clean_reference() в главном MPS-процессе ломает состояние,
следующий synth_one виснет. В отдельном процессе — безопасно:
главный процесс просто читает готовый файл.
"""

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from backend.services.clone_engine import JSTCloneEngine as CloneEngine  # noqa: E402


def main():
    cache = ROOT / "output" / "_clone_cache"
    cache.mkdir(parents=True, exist_ok=True)

    engine = CloneEngine(cache_dir=cache)
    merged = ROOT / "output" / "merged_reference_roman_mayorov_AAD.wav"
    if not merged.exists():
        print(f"FAIL: {merged} not found")
        sys.exit(1)

    clean = engine.clean_reference(merged, "roman_mayorov_AAD")
    print(f"OK: {clean} ({clean.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
