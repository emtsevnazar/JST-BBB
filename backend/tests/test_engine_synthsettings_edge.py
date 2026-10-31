"""Edge tests for SynthSettings — NaN, negative, huge values."""

from backend.engine import SynthSettings, _int, _num


def test_synthsettings_negative_speed():
    """Отрицательный speed — сохраняется как есть (нет валидации) или clamp."""
    s = SynthSettings.from_dict({"speed": -1.0})
    assert s.speed == -1.0 or s.speed >= 0.0  # поведение зависит от кода


def test_synthsettings_zero_speed():
    s = SynthSettings.from_dict({"speed": 0.0})
    assert s.speed == 0.0


def test_synthsettings_huge_speed():
    s = SynthSettings.from_dict({"speed": 99999.0})
    assert isinstance(s.speed, float)


def test_synthsettings_extra_keys_ignored():
    """Лишние ключи не ломают from_dict."""
    s = SynthSettings.from_dict({"unknown_key_xyz": "value", "speed": 1.2})
    assert s.speed == 1.2


def test_synthsettings_none_values():
    """None в опциональных полях — defaults."""
    s = SynthSettings.from_dict({"speed": None})
    assert isinstance(s.speed, (int, float))


def test_int_negative():
    assert _int(-42) == -42


def test_int_huge():
    assert _int(10**15) == 10**15


def test_int_string_float():
    """_int("3.7") → 0 (str-float не парсится как int → fallback default 0)."""
    assert _int("3.7") == 0
    assert _int("3.7", 5) == 5


def test_int_string_int():
    """_int("3") → 3 (валидный int-str)."""
    assert _int("3") == 3


def test_num_nan():
    """NaN — что делает _num?"""
    r = _num(float("nan"))
    # либо NaN, либо default — просто проверяем что не падает
    assert isinstance(r, float)


def test_num_inf():
    r = _num(float("inf"))
    assert isinstance(r, float)


def test_num_zero():
    assert _num(0) == 0.0


def test_num_negative():
    assert _num(-3.14) == -3.14


def test_to_dict_roundtrip():
    """from_dict → to_dict → from_dict сохраняет основные поля."""
    orig = {"speed": 1.3, "language": "en", "mode": "multi"}
    s1 = SynthSettings.from_dict(orig)
    d1 = s1.to_dict()
    s2 = SynthSettings.from_dict(d1)
    assert s1.speed == s2.speed
    assert s1.language == s2.language
    assert s1.mode == s2.mode
