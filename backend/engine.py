"""JST Engine v2.5 - multi-segment pitch, language, 4 models."""
from __future__ import annotations
import logging, re, sys, time
from dataclasses import dataclass, asdict
from pathlib import Path
import librosa, numpy as np, torch

# Robust path resolution: ищем AAC/main (содержит src/) независимо от расположения engine.py.
_here = Path(__file__).resolve().parent
ROOT = _here.parent  # voice_forge_studio/ (когда engine.py в backend/)
FINETUNING = None
for _p in [_here] + list(_here.parents):
    if (_p / "main" / "src").is_dir():
        FINETUNING = _p / "main"
        break
if FINETUNING is None:
    FINETUNING = Path.home() / "Documents" / "AAC" / "main"
sys.path.insert(0, str(FINETUNING))
try:
    from cosyvoice.cli.cosyvoice import CosyVoice
    from cosyvoice.utils.file_utils import load_wav
    HAS_COSYVOICE = True
except ImportError:
    HAS_COSYVOICE = False
    CosyVoice = None

import warnings as _warnings
_warnings.filterwarnings("ignore", message=".*flash.attn.*")
import io as _io, contextlib as _ctx
_buf = _io.StringIO()
with _ctx.redirect_stdout(_buf), _ctx.redirect_stderr(_buf):
    try:
        from qwen_tts import Qwen3TTSModel
        HAS_QWEN = True
    except ImportError:
        HAS_QWEN = False
        Qwen3TTSModel = None

try:
    from voxcpm import VoxCPM
    HAS_VOXCPM = True
except ImportError:
    HAS_VOXCPM = False
    VoxCPM = None

from src.chatterbox_.tts import ChatterboxTTS
from src.chatterbox_.models.t3.t3 import T3

try:
    from openvoice import se_extractor
    from openvoice.api import ToneColorConverter
    from openvoice.mel_processing import spectrogram_torch
    HAS_OPENVOICE = True
except ImportError:
    HAS_OPENVOICE = False

try:
    from chatterbox.mtl_tts import ChatterboxMultilingualTTS
    HAS_MTL = True
except ImportError:
    try:
        from src.chatterbox_.mtl_tts import ChatterboxMultilingualTTS
        HAS_MTL = True
    except ImportError:
        HAS_MTL = False
        ChatterboxMultilingualTTS = None
from safetensors.torch import load_file

log = logging.getLogger("JST.Engine")

# Lazy: тяжёлые модели загружаются при первом обращении
LAZY_MODELS = True
# Включить загрузку конкретных моделей при старте (для отладки)
EAGER_LOAD = set()  # пример: {"qwen"}

try:
    from .services.clone_engine import JSTCloneEngine
    HAS_CLONE = True
except ImportError as e:
    HAS_CLONE = False
    JSTCloneEngine = None

SUPPORTED_LANGUAGES = {"ru", "en"}  # core model
ALL_LANGUAGES = {"ar","da","de","el","en","es","fi","fr","he","hi","it","ja","ko","ms","nl","no","pl","pt","ru","sv","sw","tr","zh"}  # multilingual model


def _num(v, d=0.0):
    if v is None:
        return d
    try:
        f = float(v)
        return f if np.isfinite(f) else d
    except (TypeError, ValueError):
        return d


def _int(v, d=0):
    if v is None:
        return d
    try:
        return int(v)
    except (TypeError, ValueError):
        return d


@dataclass
class SynthSettings:
    exaggeration: float = 0.50
    cfg_weight: float = 0.50
    temperature: float = 0.80
    repetition_penalty: float = 1.20
    speed: float = 1.0
    pitch_shift: int = 0
    volume: float = 1.0
    language: str = "ru"
    output_format: str = "wav"
    output_sr: int = 44100
    bit_depth: int = 16
    mode: str = "core"
    ref_length: int = 15
    pause_between: float = 0.20
    emphasis: bool = True
    sentence_split: str = "medium"
    fade_in_sec: float = 0.0
    fade_out_sec: float = 0.0
    accent: str = "neutral"
    mood: str = "auto"

    @classmethod
    def from_dict(cls, d):
        safe = {}
        for f in cls.__dataclass_fields__:
            if f in d and d[f] is not None:
                safe[f] = d[f]
        return cls(**safe)
    def to_dict(self): return asdict(self)


ACCENT_MODIFIERS = {
    "neutral":   {"exag": 0.00, "temp": 0.00, "speed": 1.00, "pitch": 0},
    "soft":      {"exag": -0.10, "temp": -0.05, "speed": 0.95, "pitch": -1},
    "energetic": {"exag": 0.15, "temp": 0.05, "speed": 1.08, "pitch": +1},
    "dramatic":  {"exag": 0.25, "temp": 0.10, "speed": 0.92, "pitch": -2},
    "calm":      {"exag": -0.05, "temp": -0.10, "speed": 0.90, "pitch": -1},
    "bright":    {"exag": 0.10, "temp": 0.03, "speed": 1.03, "pitch": +2},
}


class Engine:
    def __init__(self, base_model_dir=None, merged_t3=None,
                 reference_wav=None, device="auto"):
        self.device = self._pick(device)
        base = Path(base_model_dir) if base_model_dir else FINETUNING / "pretrained_models"
        merged = Path(merged_t3) if merged_t3 else ROOT / "t3_finetuned_merged.safetensors"
        self.reference = Path(reference_wav) if reference_wav else ROOT / "output" / "merged_reference.wav"
        if not base.exists():
            raise FileNotFoundError(f"Net bazy: {base}")

        log.info("Zagruzka ChatterboxTTS iz %s na %s", base, self.device)
        t0 = time.time()
        self.engine = ChatterboxTTS.from_local(str(base), device=self.device)
        self.base_t3_state = {k: v.clone() for k, v in self.engine.t3.state_dict().items()}
        self.base_vocab = self.engine.t3.hp.text_tokens_dict_size

        if merged.exists() and merged.stat().st_size > 1024 * 1024:
            log.info("Zagruzka obuchennogo T3 iz %s", merged.name)
            self.merged_t3_state = load_file(str(merged))
            self.merged_vocab = 2454
            for k, v in self.merged_t3_state.items():
                if "text_emb" in k or "text_head" in k:
                    self.merged_vocab = v.shape[0]; break
            self.has_lora = True
        else:
            log.warning("merged_t3.net - LoRA/Pro rabotayut kak Core")
            self.merged_t3_state = self.base_t3_state
            self.merged_vocab = self.base_vocab
            self.has_lora = False

        self._apply_state(self.base_t3_state, self.base_vocab, "Core")
        self.current_mode = "core"
        # Гарантируем атрибуты моделей
        if not hasattr(self, "mtl_engine"): self.mtl_engine = None
        if not hasattr(self, "cosyvoice"): self.cosyvoice = None
        if not hasattr(self, "qwen_tts"): self.qwen_tts = None
        self.clone_engine = None
        if HAS_CLONE:
            try:
                ov_ckpt = FINETUNING / "checkpoints" / "openvoice_v2"
                self.clone_engine = JSTCloneEngine(
                    cache_dir=ROOT / "output" / "_clone_cache",
                    openvoice_ckpt=ov_ckpt if ov_ckpt.exists() else None,
                )
                log.info("[JST.Clone] ✅ Clone Engine готов")
            except Exception as e:
                log.warning("[JST.Clone] init failed: %s", e)
                self.clone_engine = None
        self.voxcpm = None
        self._voxcpm_loaded = False
        if HAS_VOXCPM and (not LAZY_MODELS or "voxcpm" in EAGER_LOAD):
            self._load_voxcpm()
        if not hasattr(self, "openvoice_converter"): self.openvoice_converter = None
        self.mtl_engine = None
        self.openvoice_converter = None
        if HAS_OPENVOICE:
            log.info("Zagruzka OpenVoice V2...")
            try:
                ckpt = FINETUNING / "checkpoints" / "openvoice_v2"
                if ckpt.exists():
                    self.openvoice_converter = ToneColorConverter(str(ckpt / "converter" / "config.json"), device=self.device)
                    self.openvoice_converter.load_ckpt(str(ckpt / "converter" / "checkpoint.pth"))
                    log.info("✅ OpenVoice V2 zagruzhen")
                else:
                    log.warning("OpenVoice checkpoints not found at %s", ckpt)
            except Exception as e:
                log.warning("OpenVoice load failed: %s", e)
                self.openvoice_converter = None
        if HAS_MTL:
            log.info("Zagruzka ChatterboxMultilingualTTS...")
            try:
                self.mtl_engine = ChatterboxMultilingualTTS.from_local(str(base), device=self.device)
                log.info("✅ Multilingual zagruzhen")
            except Exception as e:
                log.warning("Multilingual load failed: %s", e)
                self.mtl_engine = None
        self.sr = self.engine.sr
        import inspect
        self.supports_language_id = "language_id" in inspect.signature(self.engine.generate).parameters
        log.info("Gotovo za %.1f s (sr=%d, %s, lang_id=%s, lora=%s)",
                 time.time()-t0, self.sr, self.device, self.supports_language_id, self.has_lora)

    def _apply_state(self, state, vocab, label):
        hp = self.engine.t3.hp
        hp.text_tokens_dict_size = vocab
        new_t3 = T3(hp=hp)
        new_t3.load_state_dict(state, strict=False)
        self.engine.t3 = new_t3.to(self.device).eval()
        log.info("[%s] T3 primenen (vocab=%d)", label, vocab)

    def set_mode(self, mode):
        mode = (mode or "core").lower()
        if mode == "zeroshot":
            mode = "core"
        if mode == self.current_mode:
            return
        if mode == "voxcpm":
            self._load_voxcpm()
        elif mode == "qwen":
            self._load_qwen()
        elif mode == "cosyvoice":
            self._load_cosyvoice()
        if mode == "core":
            self._apply_state(self.base_t3_state, self.base_vocab, "Core")
        elif mode == "cosyvoice":
            if getattr(self, "cosyvoice", None) is None:
                log.warning("[cosyvoice] not available, fallback to Core")
                self._apply_state(self.base_t3_state, self.base_vocab, "Core (fallback)")
        elif mode == "jst_clone":
            if self.clone_engine is None:
                log.warning("[jst_clone] not available, fallback to Core")
                self._apply_state(self.base_t3_state, self.base_vocab, "Core (fallback)")
        elif mode == "voxcpm":
            if self.voxcpm is None:
                log.warning("[voxcpm] not available, fallback to Core")
                self._apply_state(self.base_t3_state, self.base_vocab, "Core (fallback)")
        elif mode == "qwen":
            if self.qwen_tts is None:
                log.warning("[qwen] not available, fallback to Core")
                self._apply_state(self.base_t3_state, self.base_vocab, "Core (fallback)")
            # Qwen не использует T3, поэтому state не меняем
        elif mode == "multi":
            if self.mtl_engine is None:
                log.warning("[multi] not available, fallback to Core weights")
                self._apply_state(self.base_t3_state, self.base_vocab, "Core (fallback)")
        elif mode in ("lora", "pro"):
            if not self.has_lora:
                log.warning("[%s] not trained, fallback to Core weights", mode)
                self._apply_state(self.base_t3_state, self.base_vocab, mode.capitalize() + " (fallback)")
            else:
                self._apply_state(self.merged_t3_state, self.merged_vocab, mode.capitalize())
        else:
            raise ValueError(f"Rezhim: {mode}")
        self.current_mode = mode

    @staticmethod
    def _pick(pref):
        if pref != "auto": return pref
        if torch.cuda.is_available(): return "cuda"
        if torch.backends.mps.is_available(): return "mps"
        return "cpu"

    @staticmethod
    def parse_markup(text):
        segments = []
        cur_lang = "ru"
        cur_volume = 1.0
        cur_speed = 1.0
        cur_pitch = 0
        cur_whisper = False
        buf = []
        pending_pause = 0.0
        emph_pending = False

        def flush(pause=0.0):
            nonlocal buf, pending_pause, emph_pending
            raw = "".join(buf).strip()
            buf = []
            if raw or pause > 0 or pending_pause > 0:
                segments.append({
                    "text": raw,
                    "pause": max(_num(pending_pause), _num(pause)),
                    "emphasize": emph_pending,
                    "language": cur_lang,
                    "volume": cur_volume,
                    "speed": cur_speed,
                    "pitch": cur_pitch,
                    "whisper": cur_whisper,
                })
                pending_pause = 0.0
                emph_pending = False

        i = 0
        while i < len(text):
            m = re.match(r"\[([a-z][a-z])\]", text[i:])
            if m:
                flush(); cur_lang = m.group(1); i += m.end(); continue
            m = re.match(r"[{]p:([0-9.]+)[}]", text[i:])
            if m:
                flush(pause=_num(m.group(1))); i += m.end(); continue
            m = re.match(r"<v:([0-9.]+)>", text[i:])
            if m:
                flush(); cur_volume = _num(m.group(1), 1.0); i += m.end(); continue
            if text[i:i+4] == "</v>":
                flush(); cur_volume = 1.0; i += 4; continue
            m = re.match(r"<s:([0-9.]+)>", text[i:])
            if m:
                flush(); cur_speed = _num(m.group(1), 1.0); i += m.end(); continue
            if text[i:i+4] == "</s>":
                flush(); cur_speed = 1.0; i += 4; continue
            m = re.match(r"<p:([+-]?[0-9.]+)>", text[i:])
            if m:
                flush(); cur_pitch = _int(m.group(1), 0); i += m.end(); continue
            if text[i:i+4] == "</p>":
                flush(); cur_pitch = 0; i += 4; continue
            if text[i:i+3] == "<w>":
                flush(); cur_whisper = True; i += 3; continue
            if text[i:i+4] == "</w>":
                flush(); cur_whisper = False; i += 4; continue
            if text[i:i+3] == "...":
                buf.append("..."); pending_pause = max(pending_pause, 0.35); i += 3; continue
            if text[i:i+2] == "//":
                flush(pause=0.10); i += 2; continue
            if text[i] == "*":
                j = text.find("*", i+1)
                if j > i:
                    buf.append(text[i+1:j]); emph_pending = True; i = j+1; continue
            if text[i] == "_":
                j = text.find("_", i+1)
                if j > i:
                    flush(); buf.append(text[i+1:j]); flush(); i = j+1; continue
            if text[i] == "~":
                j = text.find("~", i+1)
                if j > i:
                    flush(); prev = cur_whisper; cur_whisper = True
                    buf.append(text[i+1:j]); flush(); cur_whisper = prev
                    i = j+1; continue
            buf.append(text[i]); i += 1
        flush()
        return [s for s in segments if s["text"] or s["pause"] > 0]

    @staticmethod
    def split_into_sentences(text, style="medium"):
        text = (text or "").strip()
        if not text: return []
        if style == "long": return [text]
        max_chars = 120 if style == "short" else 220
        raw = re.split(r"(?<=[.!?])\s+", text)
        out = []
        for p in raw:
            p = p.strip()
            if not p: continue
            if len(p) > max_chars:
                subs = re.split(r"(?<=[,;:])\s+", p)
                for s in subs:
                    s = s.strip()
                    if s: out.append(s)
            else:
                out.append(p)
        merged = []
        for p in out:
            if merged and len(p.split()) < 3:
                merged[-1] += " " + p
            else:
                merged.append(p)
        return merged

    def _post(self, wav, s, volume_mul=1.0, speed_mul=1.0, pitch_mul=0, whisper=False):
        y = np.asarray(wav, dtype=np.float32).squeeze()
        if y.ndim > 1: y = y[0]
        total_speed = _num(s.speed, 1.0) * _num(speed_mul, 1.0)
        if abs(total_speed - 1.0) > 0.01:
            try:
                import pyrubberband as pyrb
                y = pyrb.time_stretch(y, self.sr, rate=total_speed)
            except ImportError:
                y = librosa.effects.time_stretch(y, rate=total_speed)
        total_pitch = _int(s.pitch_shift, 0) + _int(pitch_mul, 0)
        if total_pitch != 0:
            try:
                import pyrubberband as pyrb
                y = pyrb.pitch_shift(y, self.sr, n_steps=total_pitch)
            except ImportError:
                # librosa требует именованные аргументы
                y = librosa.effects.pitch_shift(y=y, sr=self.sr, n_steps=total_pitch)
        vol = _num(s.volume, 1.0) * _num(volume_mul, 1.0)
        if whisper: vol *= 0.55
        if abs(vol - 1.0) > 0.01:
            y = y * vol
            peak = float(np.max(np.abs(y))) + 1e-9
            if peak > 0.99: y = y / peak * 0.95
        return y.astype(np.float32)

    def synth_one(self, text, ref_audio, settings, emphasize=False,
                  volume_mul=1.0, whisper=False, speed_mul=1.0, pitch_mul=0):
        accent = ACCENT_MODIFIERS.get(settings.accent or "neutral", ACCENT_MODIFIERS["neutral"])
        exag = _num(settings.exaggeration, 0.5) + (0.15 if emphasize else 0.0) + accent["exag"]
        temp = _num(settings.temperature, 0.8) + (0.03 if emphasize else 0.0) + accent["temp"]
        speed_mul = _num(speed_mul, 1.0) * accent["speed"]
        pitch_mul = _int(pitch_mul, 0) + accent["pitch"]
        if settings.mode == "pro":
            exag = min(1.0, exag + 0.10); temp = min(1.5, temp + 0.05)
        if whisper: exag = 0.30; temp = 0.85
        if settings.mode == "multi" and self.mtl_engine is not None:
            lang = settings.language if settings.language in ALL_LANGUAGES else "ru"
            wav = self.mtl_engine.generate(
                text,
                language_id=lang,
                audio_prompt_path=str(ref_audio),
                exaggeration=min(1.0, exag),
                cfg_weight=_num(settings.cfg_weight, 0.5),
                temperature=min(1.5, temp),
                repetition_penalty=_num(settings.repetition_penalty, 1.2),
            )
        else:
            kwargs = dict(
                audio_prompt_path=str(ref_audio),
                exaggeration=min(1.0, exag),
                cfg_weight=_num(settings.cfg_weight, 0.5),
                temperature=min(1.5, temp),
                repetition_penalty=_num(settings.repetition_penalty, 1.2),
            )
            if self.supports_language_id and settings.language in SUPPORTED_LANGUAGES:
                kwargs["language_id"] = settings.language
            wav = self.engine.generate(text, **kwargs)
        if isinstance(wav, torch.Tensor):
            wav = wav.detach().cpu().numpy()
        return self._post(wav, settings, volume_mul=volume_mul,
                          speed_mul=speed_mul, pitch_mul=pitch_mul, whisper=whisper)

    def clone_with_openvoice(self, text, ref_audio, settings):
        """Клонирование через OpenVoice V2 (zero-shot)."""
        if self.openvoice_converter is None:
            raise RuntimeError("OpenVoice not loaded")
        # 1. Извлекаем tone color из референса
        source_se, _ = se_extractor.get_se(str(ref_audio), self.openvoice_converter, vad=True)
        # 2. Генерируем базовый TTS (используем Chatterbox как базу)
        base_wav = self.synth_one(text, ref_audio, settings)
        # 3. Применяем tone color conversion
        import torch
        from openvoice.mel_processing import spectrogram_torch
        base_tensor = torch.from_numpy(base_wav).float().unsqueeze(0).to(self.device)
        spec = spectrogram_torch(base_tensor, self.openvoice_converter.hps.data.filter_length,
                                 self.openvoice_converter.hps.data.sampling_rate,
                                 self.openvoice_converter.hps.data.hop_length,
                                 self.openvoice_converter.hps.data.win_length,
                                 center=False)
        converted = self.openvoice_converter.convert(
            spec, source_se, self.openvoice_converter.hps.data.sampling_rate
        )
        return converted.squeeze().cpu().numpy()

    def synth_cosyvoice(self, text, ref_audio, settings, prompt_text=""):
        """Клонирование через CosyVoice3 (Apache 2.0)."""
        if self.cosyvoice is None:
            raise RuntimeError("CosyVoice not loaded")
        # Для качественного клонирования нужен prompt_text (транскрипт референса)
        # Если prompt_text пуст, используем заглушку, но качество будет ниже
        if not prompt_text:
            prompt_text = " "  # минимальный текст
        outputs = self.cosyvoice.inference_zero_shot(
            text,
            prompt_text,
            str(ref_audio),
            stream=False
        )
        import torch
        audio = torch.cat([o['tts_speech'] for o in outputs], dim=1).squeeze().cpu().numpy()
        return self._post(audio, settings)

    def synth_qwen(self, text, ref_audio, settings, prompt_text=""):
        """Клонирование через Qwen3-TTS (Apache 2.0)."""
        if self.qwen_tts is None:
            raise RuntimeError("Qwen3-TTS not loaded")
        # Qwen3-TTS для клонирования использует reference audio + transcript (ICL mode)
        # prompt_text — это транскрипт референсного аудио
        try:
            # Пытаемся использовать ICL mode (с транскриптом)
            wav = self.qwen_tts.generate_voice_clone(
                text=text,
                ref_audio=str(ref_audio),
                ref_text=prompt_text,
                language=settings.language,
            )
        except (AttributeError, TypeError):
            # Fallback: без транскрипта (x_vector_only_mode)
            wav = self.qwen_tts.generate(
                text=text,
                ref_audio=str(ref_audio),
                language=settings.language,
            )
        import torch
        audio = wav.squeeze().cpu().numpy() if isinstance(wav, torch.Tensor) else wav
        return self._post(audio, settings)

    def synth_voxcpm(self, text, ref_audio, settings, prompt_text=""):
        """Клонирование через VoxCPM2 (Apache 2.0)."""
        if self.voxcpm is None:
            raise RuntimeError("VoxCPM2 not loaded")
        # Ultimate Cloning: передаём и аудио, и его транскрипт
        wav = self.voxcpm.generate(
            text=text,
            reference_wav_path=str(ref_audio),
            prompt_wav_path=str(ref_audio),
            prompt_text=prompt_text,
            cfg_value=2.0,
            inference_timesteps=10,
        )
        import torch
        audio = wav.squeeze().cpu().numpy() if isinstance(wav, torch.Tensor) else wav
        return self._post(audio, settings)

    def synth_jst_clone(self, text, ref_audio, settings, voice_name="voice"):
        """Собственный JST Clone Engine: чистит реф → синтез → tone conversion → post."""
        if self.clone_engine is None:
            raise RuntimeError("JST Clone Engine не загружен")

        def tts_callback(t, clean_ref):
            # Базовый синтез через лучшую доступную модель
            if getattr(self, "voxcpm", None) is not None:
                try:
                    return self.synth_voxcpm(t, clean_ref, settings, prompt_text="")
                except Exception as e:
                    log.warning("[JST.Clone] voxcpm failed: %s, → chatterbox", e)
            if getattr(self, "qwen_tts", None) is not None:
                try:
                    return self.synth_qwen(t, clean_ref, settings, prompt_text="")
                except Exception as e:
                    log.warning("[JST.Clone] qwen failed: %s, → chatterbox", e)
            # Fallback — Chatterbox
            return self.synth_one(t, clean_ref, settings)

        return self.clone_engine.synthesize_segment(
            text=text,
            voice_name=voice_name,
            ref_path=Path(ref_audio),
            tts_callback=tts_callback,
            use_tone_conversion=True,
        )

    def _load_voxcpm(self):
        """Ленивая загрузка VoxCPM2."""
        if self._voxcpm_loaded or self.voxcpm is not None:
            return self.voxcpm
        self._voxcpm_loaded = True
        if not HAS_VOXCPM:
            return None
        log.info("[Lazy] Zagruzka VoxCPM2 (первый раз, ~4 GB)...")
        try:
            self.voxcpm = VoxCPM.from_pretrained("openbmb/VoxCPM2", load_denoiser=False)
            log.info("✅ VoxCPM2 zagruzhen")
        except Exception as e:
            log.warning("VoxCPM2 load failed: %s", e)
            self.voxcpm = None
        return self.voxcpm

    def _load_qwen(self):
        """Ленивая загрузка Qwen3-TTS."""
        if self._qwen_loaded or self.qwen_tts is not None:
            return self.qwen_tts
        self._qwen_loaded = True
        if not HAS_QWEN:
            return None
        log.info("[Lazy] Zagruzka Qwen3-TTS (первый раз, ~3 GB)...")
        try:
            self.qwen_tts = Qwen3TTSModel.from_pretrained(
                "Qwen/Qwen3-TTS-12Hz-1.7B-Base",
                device_map="mps",
                dtype=torch.float16,
            )
            log.info("✅ Qwen3-TTS zagruzhen")
        except Exception as e:
            log.warning("Qwen3-TTS load failed: %s", e)
            self.qwen_tts = None
        return self.qwen_tts

    def _load_cosyvoice(self):
        """Ленивая загрузка CosyVoice3."""
        if self._cosy_loaded or self.cosyvoice is not None:
            return self.cosyvoice
        self._cosy_loaded = True
        if not HAS_COSYVOICE:
            return None
        log.info("[Lazy] Zagruzka CosyVoice3...")
        try:
            model_dir = FINETUNING / "pretrained_models" / "CosyVoice-300M"
            if not model_dir.exists():
                model_dir = "pretrained_models/CosyVoice-300M"
            self.cosyvoice = CosyVoice(str(model_dir), load_jit=False, load_trt=False, fp16=False)
            log.info("✅ CosyVoice3 zagruzhen")
        except Exception as e:
            log.warning("CosyVoice load failed: %s", e)
            self.cosyvoice = None
        return self.cosyvoice

    def silence(self, sec):
        return np.zeros(int(_num(sec, 0.0) * self.sr), dtype=np.float32)
