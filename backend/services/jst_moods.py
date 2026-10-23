"""
JST Mood Engine v1.0
Пресеты настроений для VoxCPM2 / Chatterbox.
Работает через стилевые инструкции в тексте.
"""
from __future__ import annotations

MOODS = {
    # code: (prefix_ru, prefix_en, описание)
    "neutral":      ("(спокойный, естественный темп)",     "(calm, natural, steady pace)",       "Нейтрально"),
    "happy":        ("(весёлый, яркий, чуть быстрее)",     "(cheerful, bright, slightly faster)", "Весело"),
    "sad":          ("(грустный, медленный, тихий)",       "(sad, slow, soft voice)",             "Грустно"),
    "angry":        ("(напряжённый, низкий тон, резко)",   "(tense, low pitch, clipped words)",   "Злость"),
    "excited":      ("(энергично, быстро, высокий тон)",   "(energetic, fast, high pitch)",       "Восторг"),
    "whisper":      ("(шёпот, интимно, медленно)",         "(whispering, intimate, slow)",        "Шёпот"),
    "professional": ("(серьёзно, уверенно, размеренно)",   "(serious, confident, measured)",      "Деловой"),
    "asmr":         ("(очень тихо, близко к микрофону)",   "(very soft, close-mic, slow)",        "ASMR"),
    "podcast":      ("(разговорно, дружелюбно, живо)",     "(conversational, friendly, lively)",  "Подкаст"),
    "audiobook":    ("(плавно, выразительно, размеренно)", "(smooth, expressive, measured)",      "Аудиокнига"),
    "news":         ("(диктор, чётко, ровно)",             "(announcer, clear, even pace)",       "Диктор"),
    "trailer":      ("(эпично, мощно, драматично)",        "(epic, powerful, dramatic)",          "Трейлер"),
}

# JST Preset — авторский, зависит от настроения и текста
JST_PRESET = {
    "auto_detect": True,
    "rules": [
        # (regex, mood)
        (r'[!?]{2,}|ура|вау|класс|супер',   "excited"),
        (r'\?$',                             "neutral"),
        (r'груст|печаль|тоск|увы',           "sad"),
        (r'шёпот|тихо|секрет',               "whisper"),
        (r'уважаем|коллег|доклад|отчёт',     "professional"),
    ],
    "default": "neutral",
}

def detect_mood(text: str) -> str:
    """JST Preset: автоматическое определение настроения по тексту."""
    import re
    for pattern, mood in JST_PRESET["rules"]:
        if re.search(pattern, text, re.IGNORECASE):
            return mood
    return JST_PRESET["default"]

def apply_mood(text: str, mood: str | None = None, lang: str = "ru") -> str:
    """Добавляет стилевую инструкцию перед текстом."""
    if mood is None and JST_PRESET["auto_detect"]:
        mood = detect_mood(text)
    prefix_ru, prefix_en, _ = MOODS.get(mood or "neutral", MOODS["neutral"])
    prefix = prefix_ru if lang == "ru" else prefix_en
    return f"{prefix} {text}"

def list_moods() -> dict:
    """Список для API /api/moods."""
    return {
        code: {"name": data[2], "prefix_ru": data[0], "prefix_en": data[1]}
        for code, data in MOODS.items()
    }

# === JST Spirits — кастомные пресеты под бренд ===
# Формат: code: (prefix_ru, prefix_en, name_ru, params)
# params — усиление exaggeration / cfg / temp / speed относительно базы
JST_SPIRITS = {
    "spirit_warm": {
        "name": "Тёплый",
        "name_en": "Warm",
        "prefix_ru": "(тёплый, доверительный, дружелюбный)",
        "prefix_en": "(warm, trustworthy, friendly)",
        "exaggeration": 0.55, "cfg_weight": 0.50,
        "temperature": 0.82, "speed": 1.00,
    },
    "spirit_confident": {
        "name": "Уверенный",
        "name_en": "Confident",
        "prefix_ru": "(уверенный, авторитетный, чёткий)",
        "prefix_en": "(confident, authoritative, crisp)",
        "exaggeration": 0.50, "cfg_weight": 0.55,
        "temperature": 0.78, "speed": 1.00,
    },
    "spirit_storyteller": {
        "name": "Рассказчик",
        "name_en": "Storyteller",
        "prefix_ru": "(повествовательный, плавный, с интонациями)",
        "prefix_en": "(storytelling, smooth, expressive)",
        "exaggeration": 0.60, "cfg_weight": 0.48,
        "temperature": 0.80, "speed": 0.98,
    },
    "spirit_motivational": {
        "name": "Вдохновляющий",
        "name_en": "Motivational",
        "prefix_ru": "(вдохновляющий, энергичный, мотивирующий)",
        "prefix_en": "(motivational, energetic, inspiring)",
        "exaggeration": 0.72, "cfg_weight": 0.42,
        "temperature": 0.85, "speed": 1.05,
    },
    "spirit_mysterious": {
        "name": "Загадочный",
        "name_en": "Mysterious",
        "prefix_ru": "(загадочный, низкий, таинственный)",
        "prefix_en": "(mysterious, low, enigmatic)",
        "exaggeration": 0.45, "cfg_weight": 0.52,
        "temperature": 0.75, "speed": 0.92,
    },
    "spirit_friendly": {
        "name": "Дружелюбный",
        "name_en": "Friendly",
        "prefix_ru": "(дружелюбный, лёгкий, улыбчивый)",
        "prefix_en": "(friendly, light, smiling)",
        "exaggeration": 0.62, "cfg_weight": 0.45,
        "temperature": 0.84, "speed": 1.02,
    },

    "spirit_solemn": {
        "name": "Торжественный",
        "name_en": "Solemn",
        "prefix_ru": "(торжественный, величественный, праздничный)",
        "prefix_en": "(solemn, majestic, ceremonial)",
        "exaggeration": 0.65, "cfg_weight": 0.48,
        "temperature": 0.78, "speed": 0.95,
    },
    "spirit_thoughtful": {
        "name": "Задумчивый",
        "name_en": "Thoughtful",
        "prefix_ru": "(задумчивый, размышляющий, неспешный)",
        "prefix_en": "(thoughtful, reflective, slow)",
        "exaggeration": 0.42, "cfg_weight": 0.55,
        "temperature": 0.75, "speed": 0.92,
    },
    "spirit_lost": {
        "name": "Потерянный",
        "name_en": "Lost",
        "prefix_ru": "(потерянный, неуверенный, тихий)",
        "prefix_en": "(lost, uncertain, quiet)",
        "exaggeration": 0.35, "cfg_weight": 0.58,
        "temperature": 0.72, "speed": 0.88,
    },
    "spirit_sad": {
        "name": "Грустный",
        "name_en": "Sad",
        "prefix_ru": "(грустный, печальный, тихий)",
        "prefix_en": "(sad, mournful, quiet)",
        "exaggeration": 0.38, "cfg_weight": 0.55,
        "temperature": 0.74, "speed": 0.90,
    },
    "spirit_tired": {
        "name": "Уставший",
        "name_en": "Tired",
        "prefix_ru": "(уставший, медленный, тихий)",
        "prefix_en": "(tired, slow, quiet)",
        "exaggeration": 0.30, "cfg_weight": 0.60,
        "temperature": 0.70, "speed": 0.85,
    },
    "spirit_cheerful": {
        "name": "Бодрый",
        "name_en": "Cheerful",
        "prefix_ru": "(бодрый, энергичный, весёлый)",
        "prefix_en": "(cheerful, energetic, lively)",
        "exaggeration": 0.68, "cfg_weight": 0.44,
        "temperature": 0.86, "speed": 1.08,
    },
}

# Дополняем MOODS spirits-пресетами (для /api/moods и UI)
for _code, _data in JST_SPIRITS.items():
    MOODS[_code] = (_data["prefix_ru"], _data["prefix_en"], _data["name"])

# Параметры для применения в синтезе
MOOD_PARAMS = {
    # Базовые
    "neutral":      {"exaggeration": 0.50, "cfg_weight": 0.50, "temperature": 0.80, "speed": 1.00},
    "happy":        {"exaggeration": 0.65, "cfg_weight": 0.45, "temperature": 0.85, "speed": 1.05},
    "sad":          {"exaggeration": 0.40, "cfg_weight": 0.55, "temperature": 0.75, "speed": 0.90},
    "angry":        {"exaggeration": 0.75, "cfg_weight": 0.40, "temperature": 0.85, "speed": 1.05},
    "excited":      {"exaggeration": 0.80, "cfg_weight": 0.40, "temperature": 0.90, "speed": 1.10},
    "whisper":      {"exaggeration": 0.30, "cfg_weight": 0.60, "temperature": 0.70, "speed": 0.85},
    "professional": {"exaggeration": 0.50, "cfg_weight": 0.50, "temperature": 0.80, "speed": 1.00},
    "asmr":         {"exaggeration": 0.25, "cfg_weight": 0.65, "temperature": 0.70, "speed": 0.80},
    "podcast":      {"exaggeration": 0.60, "cfg_weight": 0.45, "temperature": 0.85, "speed": 1.05},
    "audiobook":    {"exaggeration": 0.55, "cfg_weight": 0.50, "temperature": 0.78, "speed": 1.00},
    "news":         {"exaggeration": 0.45, "cfg_weight": 0.55, "temperature": 0.78, "speed": 1.00},
    "trailer":      {"exaggeration": 0.75, "cfg_weight": 0.35, "temperature": 0.85, "speed": 0.95},
}
# Спириты
for _code, _data in JST_SPIRITS.items():
    MOOD_PARAMS[_code] = {
        "exaggeration": _data["exaggeration"],
        "cfg_weight": _data["cfg_weight"],
        "temperature": _data["temperature"],
        "speed": _data["speed"],
    }
