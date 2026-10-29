// JST test phrases extension — 8 languages × 20 phrases
// v1.5.5: DE, FR, ES, ZH, JA, KO, PT, IT
// Fallback: если в JST_TEST_PHRASES нет языка — Random берёт ru/en
(function () {
  if (!window.JST_TEST_PHRASES) return;

  var EXT = {
    de: [
      "Hallo.", "Guten Tag.", "Wie geht's?", "Danke sehr.", "Bis später.",
      "In Ordnung.", "Einverstanden.", "Verstanden.", "Wunderbar!", "Los geht's.",
      "Jetzt nicht.", "Es ist spät.", "Alles bereit.", "Ruf mich an.", "Hast du kurz Zeit?",
      "Ich bin müde.", "Alles gut.", "Sei vorsichtig.", "Ich freue mich.", "Bis morgen."
    ],
    fr: [
      "Bonjour.", "Bonsoir.", "Ça va ?", "Merci beaucoup.", "À bientôt.",
      "D'accord.", "Entendu.", "Compris.", "Excellent !", "Allons-y.",
      "Pas maintenant.", "Il est tard.", "Tout est prêt.", "Appelle-moi.", "T'as une minute ?",
      "Je suis fatigué.", "Tout va bien.", "Sois prudent.", "Je suis content.", "À demain."
    ],
    es: [
      "Hola.", "Buenos días.", "¿Cómo estás?", "Muchas gracias.", "Hasta luego.",
      "Vale.", "De acuerdo.", "Entendido.", "¡Excelente!", "Vamos.",
      "Ahora no.", "Es tarde.", "Todo listo.", "Llámame.", "¿Tienes un minuto?",
      "Estoy cansado.", "Todo bien.", "Ten cuidado.", "Estoy contento.", "Hasta mañana."
    ],
    zh: [
      "你好。", "早上好。", "你好吗？", "非常感谢。", "回头见。",
      "好的。", "同意。", "明白了。", "太好了！", "走吧。",
      "现在不行。", "很晚了。", "都准备好了。", "给我打电话。", "你有时间吗？",
      "我累了。", "一切都好。", "小心点。", "我很高兴。", "明天见。"
    ],
    ja: [
      "こんにちは。", "おはよう。", "元気ですか？", "ありがとう。", "またね。",
      "いいよ。", "賛成。", "わかった。", "すごい！", "行こう。",
      "今はだめ。", "もう遅い。", "準備できた。", "電話して。", "ちょっといい？",
      "疲れた。", "大丈夫。", "気をつけて。", "嬉しい。", "また明日。"
    ],
    ko: [
      "안녕하세요.", "좋은 아침.", "어떻게 지내세요?", "감사합니다.", "또 봐요.",
      "좋아요.", "동의해요.", "알겠어요.", "훌륭해요!", "가자.",
      "지금은 안 돼요.", "늦었어요.", "모두 준비됐어요.", "전화해 주세요.", "잠깐 시간 있어요?",
      "피곤해요.", "다 좋아요.", "조심하세요.", "기뻐요.", "내일 봐요."
    ],
    pt: [
      "Olá.", "Bom dia.", "Como vai?", "Muito obrigado.", "Até logo.",
      "Está bem.", "Combinado.", "Entendi.", "Excelente!", "Vamos.",
      "Agora não.", "Está tarde.", "Tudo pronto.", "Me liga.", "Tem um minuto?",
      "Estou cansado.", "Tudo bem.", "Cuidado.", "Estou feliz.", "Até amanhã."
    ],
    it: [
      "Ciao.", "Buongiorno.", "Come stai?", "Grazie mille.", "A dopo.",
      "Va bene.", "D'accordo.", "Capito.", "Perfetto!", "Andiamo.",
      "Non ora.", "È tardi.", "Tutto pronto.", "Chiamami.", "Hai un minuto?",
      "Sono stanco.", "Tutto bene.", "Stai attento.", "Sono contento.", "A domani."
    ]
  };

  // Merge, не перезаписывая существующие (ru, en)
  Object.keys(EXT).forEach(function (lang) {
    if (!window.JST_TEST_PHRASES[lang]) {
      window.JST_TEST_PHRASES[lang] = EXT[lang];
    }
  });

  console.log("[JST] test_phrases_ext: добавлено " + Object.keys(EXT).length + " языков (DE/FR/ES/ZH/JA/KO/PT/IT)");
})();
