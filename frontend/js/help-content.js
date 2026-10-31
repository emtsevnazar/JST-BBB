/* help-content.js — JST help HTML extracted from app.js (Phase 5a)
   Pure data, no logic. app.js delegates via window.__jstHelpContent.HELP_HTML.
*/

export const HELP_HTML = `<div class="help-doc">
  <h2 class="help-title">
    <span class="help-ru">Инструкция</span>
    <span class="help-en">User Guide</span>
  </h2>

  <details class="help-section">
    <summary class="help-header">
      <span class="help-pill help-ru">Быстрый старт</span>
      <span class="help-pill help-en">Quick Start</span>
      <span class="help-arrow">&#9679;</span>
    </summary>
    <div class="help-content">
      <div class="help-ru">
        <ol>
          <li><b>Голос</b> — выберите профиль или загрузите свой аудиофайл (5–30 сек чистой речи).</li>
          <li><b>Модель</b> — Multi для русского, JST Clone для клонирования, VoxCPM2 для максимального качества.</li>
          <li><b>Язык</b> — ru или en. Остальные появятся позже, помечены «скоро».</li>
          <li><b>Пресет</b> — базовый тембр (подкаст, диктор, шёпот).</li>
          <li><b>Настроение</b> — эмоциональная окраска (включая JST Spirits).</li>
          <li><b>Текст</b> → <b>Озвучить</b>.</li>
        </ol>
      </div>
      <div class="help-en">
        <ol>
          <li><b>Voice</b> — pick a profile or upload your own audio (5–30 seconds of clean speech).</li>
          <li><b>Model</b> — Multi for Russian, JST Clone for cloning, VoxCPM2 for maximum quality.</li>
          <li><b>Language</b> — ru or en. Others coming later, marked "soon".</li>
          <li><b>Preset</b> — base timbre (podcast, announcer, whisper).</li>
          <li><b>Mood</b> — emotional colour (including JST Spirits).</li>
          <li><b>Text</b> → <b>Speak</b>.</li>
        </ol>
      </div>
    </div>
  </details>

  <details class="help-section">
    <summary class="help-header">
      <span class="help-pill help-ru">Модели</span>
      <span class="help-pill help-en">Models</span>
      <span class="help-arrow">&#9679;</span>
    </summary>
    <div class="help-content">
      <div class="help-ru">
        <table class="help-table">
          <tr><th>Модель</th><th>Языки</th><th>Назначение</th><th>Качество</th></tr>
          <tr><td>Core</td><td>EN</td><td>Базовая, быстрая</td><td>2/5</td></tr>
          <tr><td>Multi</td><td>RU+EN</td><td>Русский через неё, стабильно</td><td>3/5</td></tr>
          <tr><td>JST Clone</td><td>RU+EN</td><td>Свой pipeline: чистка + синтез + пост</td><td>4/5</td></tr>
          <tr><td>VoxCPM2</td><td>RU+EN</td><td>SOTA 48 кГц, лучшее клонирование</td><td>5/5</td></tr>
          <tr><td>Qwen3</td><td>RU+EN</td><td>Альтернатива (отдельный venv)</td><td>4/5</td></tr>
          <tr><td>CosyVoice</td><td>RU+EN</td><td>Резервный движок</td><td>3/5</td></tr>
        </table>
        <p><b>Правило выбора:</b> русский язык — Multi или VoxCPM2; максимальное качество — VoxCPM2; быстро — Core или Multi; эмоции — Multi или JST Clone.</p>
        <p>Все модели Apache 2.0 — коммерческое использование разрешено.</p>
      </div>
      <div class="help-en">
        <table class="help-table">
          <tr><th>Model</th><th>Languages</th><th>Purpose</th><th>Quality</th></tr>
          <tr><td>Core</td><td>EN</td><td>Base, fast</td><td>2/5</td></tr>
          <tr><td>Multi</td><td>RU+EN</td><td>Russian through it, stable</td><td>3/5</td></tr>
          <tr><td>JST Clone</td><td>RU+EN</td><td>Own pipeline: cleanup + synth + post</td><td>4/5</td></tr>
          <tr><td>VoxCPM2</td><td>RU+EN</td><td>SOTA 48 kHz, best cloning</td><td>5/5</td></tr>
          <tr><td>Qwen3</td><td>RU+EN</td><td>Alternative (separate venv)</td><td>4/5</td></tr>
          <tr><td>CosyVoice</td><td>RU+EN</td><td>Backup engine</td><td>3/5</td></tr>
        </table>
        <p><b>Selection rule:</b> Russian — Multi or VoxCPM2; maximum quality — VoxCPM2; fast — Core or Multi; emotions — Multi or JST Clone.</p>
        <p>All models are Apache 2.0 — commercial use allowed.</p>
      </div>
    </div>
  </details>

  <details class="help-section">
    <summary class="help-header">
      <span class="help-pill help-ru">Параметры</span>
      <span class="help-pill help-en">Parameters</span>
      <span class="help-arrow">&#9679;</span>
    </summary>
    <div class="help-content">
      <div class="help-ru">
        <ul>
          <li><b>Выразительность</b> (0.0–1.5): 0.30 — диктор, 0.50 — норма, 0.70 — живо, 0.85+ — эмоционально.</li>
          <li><b>Близость к референсу</b> (0.0–1.0): 0.30 — свобода, 0.50 — баланс, 0.70 — максимум сходства.</li>
          <li><b>Температура</b> (0.5–1.2): 0.70 — стабильно, 0.80 — баланс, 1.00 — живо.</li>
          <li><b>Штраф повторов</b> (1.0–1.5): 1.20 — стандарт, 1.35 — если модель повторяет.</li>
          <li><b>Скорость</b> (0.5–2.0): 0.90 — медленно, 1.00 — норма, 1.10 — живо.</li>
          <li><b>Высота</b> (-12…+12): -2 — серьёзнее, 0 — норма, +2 — женственнее, +4 — детский.</li>
          <li><b>Громкость</b> (0.5–1.5): 0.6 — тихо, 1.0 — норма, 1.1 — громче.</li>
          <li><b>Референс</b> (6–30 сек): 10 — быстро, 15 — стандарт, 20–30 — максимум сходства.</li>
          <li><b>Пауза</b> (0.10–1.00 сек): 0.10 — новости, 0.20 — нейтрально, 0.30 — аудиокнига, 0.50+ — ASMR.</li>
          <li><b>Дробление:</b> short — контроль каждой фразы, medium — по предложению, long — по абзацу.</li>
        </ul>
      </div>
      <div class="help-en">
        <ul>
          <li><b>Exaggeration</b> (0.0–1.5): 0.30 — announcer, 0.50 — normal, 0.70 — lively, 0.85+ — emotional.</li>
          <li><b>Closeness</b> (0.0–1.0): 0.30 — freedom, 0.50 — balance, 0.70 — maximum similarity.</li>
          <li><b>Temperature</b> (0.5–1.2): 0.70 — stable, 0.80 — balance, 1.00 — lively.</li>
          <li><b>Repetition penalty</b> (1.0–1.5): 1.20 — standard, 1.35 — if the model repeats.</li>
          <li><b>Speed</b> (0.5–2.0): 0.90 — slow, 1.00 — normal, 1.10 — lively.</li>
          <li><b>Pitch</b> (-12…+12): -2 — deeper, 0 — normal, +2 — feminine, +4 — child.</li>
          <li><b>Volume</b> (0.5–1.5): 0.6 — quiet, 1.0 — normal, 1.1 — louder.</li>
          <li><b>Reference</b> (6–30 sec): 10 — fast, 15 — standard, 20–30 — maximum similarity.</li>
          <li><b>Pause</b> (0.10–1.00 sec): 0.10 — news, 0.20 — neutral, 0.30 — audiobook, 0.50+ — ASMR.</li>
          <li><b>Splitting:</b> short — control each phrase, medium — per sentence, long — per paragraph.</li>
        </ul>
      </div>
    </div>
  </details>

  <details class="help-section">
    <summary class="help-header">
      <span class="help-pill help-ru">Готовые комбинации</span>
      <span class="help-pill help-en">Ready Presets</span>
      <span class="help-arrow">&#9679;</span>
    </summary>
    <div class="help-content">
      <div class="help-ru">
        <ul>
          <li><b>Диктор:</b> выразительность 0.50, близость 0.50, температура 0.80, скорость 1.00, референс 10, пауза 0.15.</li>
          <li><b>Подкаст:</b> выразительность 0.60, близость 0.45, температура 0.85, скорость 1.05, референс 15, пауза 0.25.</li>
          <li><b>Аудиокнига:</b> выразительность 0.55, близость 0.50, температура 0.78, скорость 1.00, референс 15, пауза 0.30.</li>
          <li><b>ASMR:</b> выразительность 0.30, близость 0.60, температура 0.70, скорость 0.80, референс 20, пауза 0.40.</li>
          <li><b>Трейлер:</b> выразительность 0.75, близость 0.35, температура 0.85, скорость 0.95, референс 15.</li>
        </ul>
      </div>
      <div class="help-en">
        <ul>
          <li><b>Announcer:</b> exaggeration 0.50, closeness 0.50, temperature 0.80, speed 1.00, reference 10, pause 0.15.</li>
          <li><b>Podcast:</b> exaggeration 0.60, closeness 0.45, temperature 0.85, speed 1.05, reference 15, pause 0.25.</li>
          <li><b>Audiobook:</b> exaggeration 0.55, closeness 0.50, temperature 0.78, speed 1.00, reference 15, pause 0.30.</li>
          <li><b>ASMR:</b> exaggeration 0.30, closeness 0.60, temperature 0.70, speed 0.80, reference 20, pause 0.40.</li>
          <li><b>Trailer:</b> exaggeration 0.75, closeness 0.35, temperature 0.85, speed 0.95, reference 15.</li>
        </ul>
      </div>
    </div>
  </details>

  <details class="help-section">
    <summary class="help-header">
      <span class="help-pill help-ru">JST Spirits — авторские настроения</span>
      <span class="help-pill help-en">JST Spirits — signature moods</span>
      <span class="help-arrow">&#9679;</span>
    </summary>
    <div class="help-content">
      <div class="help-ru">
        <ul>
          <li><b>Тёплый</b> — доверительный, дружелюбный (реклама, презентация).</li>
          <li><b>Уверенный</b> — авторитетный, чёткий (деловые звонки).</li>
          <li><b>JST Рассказчик</b> — повествовательный, плавный (аудиокнига).</li>
          <li><b>JST Вдохновляющий</b> — энергичный, мотивирующий (промо, обучение).</li>
          <li><b>JST Загадочный</b> — низкий, таинственный (документалка, триллер).</li>
          <li><b>JST Дружелюбный</b> — лёгкий, улыбчивый (видеоблог, соцсети).</li>
        </ul>
        <p>Режим <b>JST Auto Spirits</b> автоматически определяет настроение по тексту: восклицания → восторг, «груст» → грусть, «шёпот» → шёпот, «доклад» → деловой.</p>
      </div>
      <div class="help-en">
        <ul>
          <li><b>JST Warm</b> — trustworthy, friendly (ads, presentations).</li>
          <li><b>JST Confident</b> — authoritative, crisp (business calls).</li>
          <li><b>JST Storyteller</b> — narrative, smooth (audiobook).</li>
          <li><b>JST Motivational</b> — energetic, inspiring (promo, learning).</li>
          <li><b>JST Mysterious</b> — low, enigmatic (documentary, thriller).</li>
          <li><b>JST Friendly</b> — light, smiling (vlog, social media).</li>
        </ul>
        <p><b>JST Auto Spirits</b> auto-detects mood from the text: exclamations → excited, "sad" → sad, "whisper" → whisper, "report" → professional.</p>
      </div>
    </div>
  </details>

  <details class="help-section">
    <summary class="help-header">
      <span class="help-pill help-ru">Разметка текста</span>
      <span class="help-pill help-en">Text Markup</span>
      <span class="help-arrow">&#9679;</span>
    </summary>
    <div class="help-content">
      <div class="help-ru">
        <ul>
          <li><code>[pause=0.5]</code> — пауза 0.5 сек.</li>
          <li><code>[emph]слово[/emph]</code> — выделить (громче, чётче).</li>
          <li><code>[whisper]текст[/whisper]</code> — шёпот.</li>
          <li><code>[soft]текст[/soft]</code> — тише.</li>
          <li><code>[loud]текст[/loud]</code> — громче.</li>
          <li><code>[slow]текст[/slow]</code> — медленнее.</li>
          <li><code>[fast]текст[/fast]</code> — быстрее.</li>
        </ul>
        <p>Пример: <code>[whisper]Слушай...[/whisper] [pause=0.8] Сегодня я расскажу [emph]главное[/emph].</code></p>
      </div>
      <div class="help-en">
        <ul>
          <li><code>[pause=0.5]</code> — 0.5 second pause.</li>
          <li><code>[emph]word[/emph]</code> — emphasise (louder, clearer).</li>
          <li><code>[whisper]text[/whisper]</code> — whisper.</li>
          <li><code>[soft]text[/soft]</code> — softer.</li>
          <li><code>[loud]text[/loud]</code> — louder.</li>
          <li><code>[slow]text[/slow]</code> — slower.</li>
          <li><code>[fast]text[/fast]</code> — faster.</li>
        </ul>
        <p>Example: <code>[whisper]Listen...[/whisper] [pause=0.8] Today I will tell you [emph]the main thing[/emph].</code></p>
      </div>
    </div>
  </details>

  <details class="help-section">
    <summary class="help-header">
      <span class="help-pill help-ru">Голоса — загрузка</span>
      <span class="help-pill help-en">Voices — upload</span>
      <span class="help-arrow">&#9679;</span>
    </summary>
    <div class="help-content">
      <div class="help-ru">
        <ol>
          <li>Нажмите «Добавить голос».</li>
          <li>Имя: только a–z, 0–9, _ (до 64 символов).</li>
          <li>Перетащите 1–5 файлов (.wav .mp3 .m4a .opus .flac .ogg).</li>
          <li>5–30 секунд чистой речи, один язык, без шума.</li>
          <li>Нажмите «Загрузить».</li>
        </ol>
        <p>Качество клонирования зависит от: чистоты записи, эмоциональной нейтральности, громкости, одного голоса на записи.</p>
      </div>
      <div class="help-en">
        <ol>
          <li>Click "Add voice".</li>
          <li>Name: only a–z, 0–9, _ (up to 64 characters).</li>
          <li>Drop 1–5 files (.wav .mp3 .m4a .opus .flac .ogg).</li>
          <li>5–30 seconds of clean speech, one language, no noise.</li>
          <li>Click "Upload".</li>
        </ol>
        <p>Cloning quality depends on: clean recording, emotional neutrality, loudness, single voice in the file.</p>
      </div>
    </div>
  </details>

  <details class="help-section">
    <summary class="help-header">
      <span class="help-pill help-ru">Безопасность</span>
      <span class="help-pill help-en">Security</span>
      <span class="help-arrow">&#9679;</span>
    </summary>
    <div class="help-content">
      <div class="help-ru">
        <ul>
          <li>Валидация текста: 1–5000 символов, контрольные символы вырезаются.</li>
          <li>Rate limit: 60 запросов в минуту.</li>
          <li>Path traversal: защита от запросов вида <code>../../etc/passwd</code>.</li>
          <li>Fallback: VoxCPM2 → Multi → Core при падении модели.</li>
          <li>Логи: <code>/tmp/jst_run.log</code>.</li>
        </ul>
      </div>
      <div class="help-en">
        <ul>
          <li>Text validation: 1–5000 characters, control characters stripped.</li>
          <li>Rate limit: 60 requests per minute.</li>
          <li>Path traversal: protection against <code>../../etc/passwd</code>-style requests.</li>
          <li>Fallback: VoxCPM2 → Multi → Core when a model fails.</li>
          <li>Logs: <code>/tmp/jst_run.log</code>.</li>
        </ul>
      </div>
    </div>
  </details>

  <details class="help-section">
    <summary class="help-header">
      <span class="help-pill help-ru">Если что-то не работает</span>
      <span class="help-pill help-en">Troubleshooting</span>
      <span class="help-arrow">&#9679;</span>
    </summary>
    <div class="help-content">
      <div class="help-ru">
        <ul>
          <li><b>Непонятный язык</b> — Multi упал в fallback на Core. Проверьте: <code>grep "Core (fallback)" /tmp/jst_run.log</code>. Убедитесь, что в <code>pretrained_models/</code> есть s3gen.pt, t3_mtl23ls_v2.safetensors, Cangjie5_TC.json.</li>
          <li><b>Модалка пустая</b> — Cmd+Shift+R в браузере.</li>
          <li><b>Модель не загружена</b> — подождите 30–40 секунд после запуска сервера.</li>
          <li><b>Reference not found</b> — профиль голоса не сгенерирован, загрузите аудио.</li>
          <li><b>Сервер не отвечает</b> — перезапуск: <code>lsof -ti:8000 | xargs kill -9; nohup ./start.sh &gt; /tmp/jst_run.log 2&gt;&amp;1 &amp;</code></li>
        </ul>
      </div>
      <div class="help-en">
        <ul>
          <li><b>Wrong language</b> — Multi fell back to Core. Check: <code>grep "Core (fallback)" /tmp/jst_run.log</code>. Ensure that <code>pretrained_models/</code> contains s3gen.pt, t3_mtl23ls_v2.safetensors, Cangjie5_TC.json.</li>
          <li><b>Empty modal</b> — Cmd+Shift+R in the browser.</li>
          <li><b>Model not loaded</b> — wait 30–40 seconds after starting the server.</li>
          <li><b>Reference not found</b> — voice profile is not generated, upload audio.</li>
          <li><b>Server not responding</b> — restart: <code>lsof -ti:8000 | xargs kill -9; nohup ./start.sh &gt; /tmp/jst_run.log 2&gt;&amp;1 &amp;</code></li>
        </ul>
      </div>
    </div>
  </details>

</div>`;

if (typeof window !== "undefined") {
  window.__jstHelpContent = { HELP_HTML };
  console.log("[JST help-content] loaded", HELP_HTML.length, "bytes");
}
