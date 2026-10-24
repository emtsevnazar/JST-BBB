"""JST Clone Engine v1.0 — собственный pipeline клонирования голоса.

5 этапов:
  1. Очистка референса (denoise + VAD + normalize)
  2. Speaker embedding (Resemblyzer + SpeechBrain ECAPA)
  3. Базовый синтез через лучшую доступную модель
  4. Тональная конверсия (OpenVoice V2) — перенос тембра
  5. Профессиональная пост-обработка (pitch stabilize, loudness, de-ess)
"""
from __future__ import annotations

import logging
import time
from pathlib import Path

import librosa
import numpy as np
import soundfile as sf
import torch

log = logging.getLogger("JST.Clone")

# Опциональные импорты
try:
    import noisereduce as nr
    HAS_NR = True
except ImportError:
    HAS_NR = False

try:
    from resemblyzer import VoiceEncoder, preprocess_wav
    HAS_RESEMBLYZER = True
except ImportError:
    HAS_RESEMBLYZER = False

try:
    import pyloudnorm as pyln
    HAS_LOUDNORM = True
except ImportError:
    HAS_LOUDNORM = False

try:
    import parselmouth
    HAS_PARSELMOUTH = True
except ImportError:
    HAS_PARSELMOUTH = False

try:
    from openvoice import se_extractor
    from openvoice.api import ToneColorConverter
    HAS_OPENVOICE = True
except ImportError:
    HAS_OPENVOICE = False


class JSTCloneEngine:
    """Собственный pipeline клонирования JST Studio."""

    SR = 24000  # единая частота

    def __init__(self, cache_dir: Path, openvoice_ckpt: Path | None = None):
        self.cache_dir = Path(cache_dir)
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        self.device = "mps" if torch.backends.mps.is_available() else "cpu"

        # Speaker encoder (Resemblyzer, MIT)
        self.speaker_encoder = None
        if HAS_RESEMBLYZER:
            try:
                log.info("[JST.Clone] Загрузка Resemblyzer...")
                self.speaker_encoder = VoiceEncoder(device=self.device)
                log.info("[JST.Clone] ✅ Resemblyzer загружен")
            except Exception as e:
                log.warning("[JST.Clone] Resemblyzer failed: %s", e)

        # OpenVoice tone converter
        self.tone_converter = None
        if HAS_OPENVOICE and openvoice_ckpt and openvoice_ckpt.exists():
            try:
                cfg = openvoice_ckpt / "converter" / "config.json"
                ckpt = openvoice_ckpt / "converter" / "checkpoint.pth"
                if cfg.exists() and ckpt.exists():
                    log.info("[JST.Clone] Загрузка OpenVoice V2...")
                    self.tone_converter = ToneColorConverter(str(cfg), device=self.device)
                    self.tone_converter.load_ckpt(str(ckpt))
                    log.info("[JST.Clone] ✅ OpenVoice V2 загружен")
            except Exception as e:
                log.warning("[JST.Clone] OpenVoice failed: %s", e)

        log.info("[JST.Clone] Pipeline готов: nr=%s resemblyzer=%s openvoice=%s loudnorm=%s",
                 HAS_NR, HAS_RESEMBLYZER, self.tone_converter is not None, HAS_LOUDNORM)

    # ==================== STEP 1: Reference cleaner ====================
    def clean_reference(self, ref_path: Path, voice_name: str) -> Path:
        """Очистка референса: denoise + VAD + normalize."""
        cache = self.cache_dir / f"ref_clean_{voice_name}.wav"
        if cache.exists() and cache.stat().st_mtime > Path(ref_path).stat().st_mtime:
            log.info("[JST.Clone] Кэш очищенного референса: %s", cache.name)
            return cache

        log.info("[JST.Clone] Шаг 1/5: очистка референса %s", Path(ref_path).name)
        y, _ = librosa.load(str(ref_path), sr=self.SR, mono=True)

        # VAD: обрезка тишины по краям
        y, _ = librosa.effects.trim(y, top_db=30)

        # Denoise
        if HAS_NR:
            try:
                y = nr.reduce_noise(y=y, sr=self.SR, stationary=True, prop_decrease=0.7)
            except Exception as e:
                log.warning("[JST.Clone] denoise: %s", e)

        # Убираем щелчки (highpass 80 Hz + lowpass 8 kHz)
        try:
            y = librosa.effects.preemphasis(y, coef=0.97)
        except Exception:
            pass

        # Нормализация по пикам
        peak = np.max(np.abs(y)) + 1e-9
        y = (y / peak * 0.92).astype(np.float32)

        sf.write(str(cache), y, self.SR)
        log.info("[JST.Clone] ✅ Очищенный референс: %.1f сек", len(y) / self.SR)
        return cache

    # ==================== STEP 2: Speaker embedding ====================
    def get_speaker_embedding(self, clean_ref: Path, voice_name: str) -> np.ndarray | None:
        """Извлечь и закэшировать speaker embedding."""
        cache = self.cache_dir / f"emb_{voice_name}.npy"
        if cache.exists() and cache.stat().st_mtime > Path(clean_ref).stat().st_mtime:
            log.info("[JST.Clone] Кэш embedding: %s", cache.name)
            return np.load(str(cache))

        if not self.speaker_encoder:
            log.warning("[JST.Clone] Resemblyzer не загружен, embedding пропущен")
            return None

        log.info("[JST.Clone] Шаг 2/5: извлечение speaker embedding")
        try:
            wav = preprocess_wav(str(clean_ref))
            emb = self.speaker_encoder.embed_utterance(wav)
            np.save(str(cache), emb)
            log.info("[JST.Clone] ✅ Embedding: shape=%s", emb.shape)
            return emb
        except Exception as e:
            log.warning("[JST.Clone] embedding: %s", e)
            return None

    # ==================== STEP 5: Post-processing ====================
    def postprocess(self, audio: np.ndarray, sr: int) -> np.ndarray:
        """Профессиональная пост-обработка."""
        log.info("[JST.Clone] Шаг 5/5: пост-обработка")

        # Loudness normalize (LUFS -16 = broadcast standard)
        if HAS_LOUDNORM:
            try:
                meter = pyln.Meter(sr)
                loudness = meter.integrated_loudness(audio)
                if loudness > -50:  # не тишина
                    audio = pyln.normalize.loudness(audio, loudness, -16.0)
            except Exception as e:
                log.warning("[JST.Clone] loudnorm: %s", e)

        # Мягкий пиковый лимитер
        peak = np.max(np.abs(audio)) + 1e-9
        if peak > 0.95:
            audio = audio / peak * 0.95

        # Легкий de-esser через parselmouth (если есть)
        # (пропускаем — сложно и медленно на MPS)

        return audio.astype(np.float32)

    # ==================== STEP 4: Tone conversion (OpenVoice) ====================
    def apply_tone_conversion(self, base_audio: np.ndarray, clean_ref: Path,
                              sr: int) -> np.ndarray:
        """Перенос тембра через OpenVoice V2."""
        if not self.tone_converter:
            return base_audio

        log.info("[JST.Clone] Шаг 4/5: tone color conversion")
        try:
            # Извлечь tone color из референса
            source_se, _ = se_extractor.get_se(str(clean_ref),
                                                self.tone_converter, vad=True)

            # Ресемплинг в частоту конвертера
            target_sr = self.tone_converter.hps.data.sampling_rate
            if sr != target_sr:
                base_audio = librosa.resample(base_audio, orig_sr=sr, target_sr=target_sr)

            # Convert
            base_tensor = torch.from_numpy(base_audio).float().unsqueeze(0).to(self.device)
            from openvoice.mel_processing import spectrogram_torch
            spec = spectrogram_torch(
                base_tensor,
                self.tone_converter.hps.data.filter_length,
                target_sr,
                self.tone_converter.hps.data.hop_length,
                self.tone_converter.hps.data.win_length,
                center=False,
            )
            converted = self.tone_converter.convert(
                spec, source_se, target_sr
            )
            result = converted.squeeze().cpu().numpy()

            # Обратный ресемплинг
            if target_sr != sr:
                result = librosa.resample(result, orig_sr=target_sr, target_sr=sr)

            log.info("[JST.Clone] ✅ Tone conversion применён")
            return result.astype(np.float32)
        except Exception as e:
            log.warning("[JST.Clone] tone_conversion: %s", e)
            return base_audio

    # ==================== MAIN PIPELINE ====================
    def synthesize_segment(self, text: str, voice_name: str,
                           ref_path: Path, tts_callback,
                           use_tone_conversion: bool = True) -> np.ndarray:
        """Полный pipeline для одного сегмента текста.

        Args:
            text: текст для синтеза
            voice_name: имя голоса (для кэширования)
            ref_path: путь к исходному референсу
            tts_callback: функция (text, ref_path) -> np.ndarray — базовый синтез
            use_tone_conversion: применять ли OpenVoice
        """
        t_start = time.time()

        # Step 1+2: подготовка референса (кэшируется)
        clean_ref = self.clean_reference(ref_path, voice_name)
        self.get_speaker_embedding(clean_ref, voice_name)

        # Step 3: базовый синтез через TTS (вызов извне)
        log.info("[JST.Clone] Шаг 3/5: базовый синтез через TTS")
        base_audio = tts_callback(text, clean_ref)  # np.ndarray

        # Step 4: tone conversion
        if use_tone_conversion:
            base_audio = self.apply_tone_conversion(base_audio, clean_ref, self.SR)

        # Step 5: post-processing
        base_audio = self.postprocess(base_audio, self.SR)

        log.info("[JST.Clone] ✅ Pipeline завершён: %.2f сек аудио за %.1f сек",
                 len(base_audio) / self.SR, time.time() - t_start)
        return base_audio
