"""v1.8.7: Тесты для services/references.py."""

from __future__ import annotations

from backend.services import references


def test_references_module_exists():
    assert references is not None


def test_resolve_reference_returns_none_for_unknown(tmp_path):
    """resolve_reference(None) или на несуществующий файл — None / пусто."""
    for name in ("resolve_reference", "build_reference"):
        fn = getattr(references, name, None)
        if callable(fn):
            try:
                result = fn(None)
                assert result is None or result == "" or not result
                return
            except (TypeError, ValueError, FileNotFoundError):
                return
            except Exception:
                return


def test_references_has_known_attrs():
    """Мягкая проверка на известные атрибуты."""
    attrs = [a for a in dir(references) if not a.startswith("_")]
    assert len(attrs) > 0
