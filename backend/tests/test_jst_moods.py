"""Unit-тесты для services/jst_moods.py (detect_mood, MOOD_PARAMS)."""

from backend.services.jst_moods import MOOD_PARAMS, detect_mood


def test_detect_mood_returns_known_key():
    mood = detect_mood("Привет, как дела?")
    assert isinstance(mood, str)
    assert mood in MOOD_PARAMS or mood == "neutral"


def test_detect_mood_neutral_default():
    assert detect_mood("") in MOOD_PARAMS
    assert detect_mood("обычный текст без эмоций") in MOOD_PARAMS


def test_detect_mood_sad_keywords():
    # проверяем, что функция не падает и возвращает валидный ключ
    assert detect_mood("Мне очень грустно и печально") in MOOD_PARAMS


def test_mood_params_have_required_fields():
    required = {"exaggeration", "cfg_weight", "temperature", "speed"}
    for name, params in MOOD_PARAMS.items():
        missing = required - set(params.keys())
        assert not missing, f"{name} missing {missing}"


def test_mood_params_values_in_range():
    for name, p in MOOD_PARAMS.items():
        assert 0.0 <= p["exaggeration"] <= 1.0, name
        assert 0.0 <= p["cfg_weight"] <= 1.0, name
        assert 0.0 < p["temperature"] <= 2.0, name
        assert 0.5 <= p["speed"] <= 1.5, name
