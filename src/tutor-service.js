const DIALOGUE_SCENARIOS = [
  {
    id: "cafe",
    title: "Кафе",
    hintsRu:
      "Ответь по-польски 1-2 короткими предложениями, например: Zwykle zamawiam małą kawę.",
    prompts: [
      "Cześć! Jestem twoim nauczycielem polskiego. Co zwykle zamawiasz w kawiarni?",
      "Dobrze. A jaki napój lubisz najbardziej i dlaczego?",
      "Świetnie. Czy wolisz siedzieć w kawiarni czy brać kawę na wynos?",
    ],
  },
  {
    id: "life",
    title: "О жизни",
    hintsRu:
      "Расскажи о себе простыми фразами, например: Mieszkam w Warszawie i pracuję w biurze.",
    prompts: [
      "Opowiedz trochę o sobie. Gdzie mieszkasz i czym się zajmujesz?",
      "Bardzo dobrze. Co lubisz robić po pracy albo po lekcjach?",
      "A jakie masz plany na ten tydzień?",
    ],
  },
  {
    id: "weekend",
    title: "Планы",
    hintsRu:
      "Говори о выходных и планах, например: W sobotę chcę odpoczywać i spotkać się z rodziną.",
    prompts: [
      "Porozmawiajmy o weekendzie. Co chcesz robić w sobotę?",
      "Brzmi dobrze. A z kim chcesz spędzić weekend?",
      "Na koniec powiedz, gdzie najchętniej odpoczywasz.",
    ],
  },
];

const TRANSLATION_EXERCISES = [
  {
    id: "tr-1",
    promptRu: "Переведи на польский: Я хочу кофе.",
    accepted: ["chcę kawę", "ja chcę kawę"],
    suggestedPolish: "Chcę kawę.",
    explanationRu: "Для базовой фразы достаточно конструкции 'Chcę + винительный падеж'.",
    commonMistakes: [
      {
        pattern: /ja chce kawa/i,
        correction: "Нужно 'chcę' с ę и 'kawę' в форме винительного падежа.",
      },
      {
        pattern: /chce/i,
        correction: "В польском 1-е лицо: 'chcę', а не 'chce'.",
      },
    ],
  },
  {
    id: "tr-2",
    promptRu: "Переведи на польский: Сегодня я иду в магазин.",
    accepted: ["dzisiaj idę do sklepu", "dziś idę do sklepu"],
    suggestedPolish: "Dzisiaj idę do sklepu.",
    explanationRu: "Для направления к месту обычно используется 'do' + родительный падеж.",
    commonMistakes: [
      {
        pattern: /na sklep/i,
        correction: "Для движения в магазин лучше 'do sklepu', а не 'na sklep'.",
      },
    ],
  },
  {
    id: "tr-3",
    promptRu: "Переведи на польский: Добрый вечер, где вокзал?",
    accepted: ["dobry wieczór, gdzie jest dworzec", "dobry wieczór gdzie jest dworzec"],
    suggestedPolish: "Dobry wieczór, gdzie jest dworzec?",
    explanationRu: "В вопросе полезно сохранить связку 'gdzie jest ...'.",
    commonMistakes: [
      {
        pattern: /gdzie dworzec/i,
        correction: "Лучше использовать полную форму вопроса: 'gdzie jest dworzec?'.",
      },
    ],
  },
  {
    id: "tr-4",
    promptRu: "Переведи на польский: Мне нужен маленький чай.",
    accepted: ["potrzebuję małej herbaty", "chcę małą herbatę"],
    suggestedPolish: "Potrzebuję małej herbaty.",
    explanationRu:
      "После 'potrzebuję' существительное обычно идет в родительном падеже, поэтому 'herbaty'.",
    commonMistakes: [
      {
        pattern: /mała herbata/i,
        correction:
          "После 'potrzebuję' лучше использовать форму 'małej herbaty'.",
      },
      {
        pattern: /potrzebuję mała/i,
        correction:
          "При 'potrzebuję' прилагательное и существительное нужно согласовать: 'małej herbaty'.",
      },
    ],
  },
];

function normalize(value) {
  return value
    .toLowerCase()
    .replace(/[.!?,]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export class TutorService {
  constructor() {
    this.dialogueScenarioIndex = 0;
    this.dialoguePromptIndex = 0;
    this.translationStep = 0;
  }

  getExercise(mode) {
    if (mode === "dialogue") {
      const scenario = DIALOGUE_SCENARIOS[this.dialogueScenarioIndex];
      return {
        mode,
        title: `Диалог: ${scenario.title}`,
        prompt: scenario.prompts[this.dialoguePromptIndex],
        helpText: `${scenario.hintsRu} Учитель ответит по-польски, мягко поправит и задаст следующий вопрос.`,
      };
    }

    const exercise =
      TRANSLATION_EXERCISES[this.translationStep % TRANSLATION_EXERCISES.length];
    return {
      mode,
      title: "Перевод с исправлением",
      prompt: exercise.promptRu,
      helpText:
        "Напиши свой вариант на польском. Тренер покажет ошибку, даст объяснение и предложит естественный вариант.",
    };
  }

  advance(mode) {
    if (mode === "dialogue") {
      this.dialogueScenarioIndex =
        (this.dialogueScenarioIndex + 1) % DIALOGUE_SCENARIOS.length;
      this.dialoguePromptIndex = 0;
      return this.getExercise("dialogue");
    }

    this.translationStep =
      (this.translationStep + 1) % TRANSLATION_EXERCISES.length;
    return this.getExercise("translation");
  }

  respond(mode, userInput) {
    if (mode === "dialogue") {
      return this.respondToDialogue(userInput);
    }

    return this.respondToTranslation(userInput);
  }

  respondToDialogue(userInput) {
    const scenario = DIALOGUE_SCENARIOS[this.dialogueScenarioIndex];
    const userText = normalize(userInput);
    const corrections = buildDialogueCorrections(userText);
    const teacherReply = buildDialogueTeacherReply(
      scenario,
      this.dialoguePromptIndex,
      userText,
    );

    this.dialoguePromptIndex += 1;
    const finishedScenario = this.dialoguePromptIndex >= scenario.prompts.length;

    if (finishedScenario) {
      this.dialoguePromptIndex = 0;
      this.dialogueScenarioIndex =
        (this.dialogueScenarioIndex + 1) % DIALOGUE_SCENARIOS.length;
    }

    return {
      mode: "dialogue",
      replyText: finishedScenario
        ? `${teacherReply}\n\nDobrze, zakończyliśmy ten mini-dialog. Możemy przejść do następnego tematu.`
        : teacherReply,
      corrections,
      explanationRu:
        "В режиме диалога тренер ведет разговор по-польски, исправляет самые заметные ошибки и продолжает беседу следующим вопросом.",
      suggestedPolish: buildDialogueSuggestion(userText, scenario.id),
    };
  }

  respondToTranslation(userInput) {
    const exercise =
      TRANSLATION_EXERCISES[this.translationStep % TRANSLATION_EXERCISES.length];
    const normalized = normalize(userInput);
    const corrections = [];
    const isAccepted = exercise.accepted.some(
      (candidate) => normalize(candidate) === normalized,
    );

    if (!isAccepted) {
      exercise.commonMistakes.forEach((mistake) => {
        if (mistake.pattern.test(userInput)) {
          corrections.push(mistake.correction);
        }
      });
    }

    if (corrections.length === 0) {
      corrections.push(
        isAccepted
          ? "Отлично: конструкция звучит естественно для уровня A1."
          : "Близко по смыслу, но стоит проверить форму слов и порядок слов в предложении.",
      );
    }

    this.translationStep += 1;

    return {
      mode: "translation",
      replyText: isAccepted
        ? "Хороший перевод. Можно двигаться дальше."
        : "Вот как можно сделать фразу более естественной.",
      corrections,
      explanationRu: exercise.explanationRu,
      suggestedPolish: exercise.suggestedPolish,
    };
  }
}

function buildDialogueSuggestion(userText, scenarioId) {
  if (scenarioId === "cafe") {
    return userText.includes("kawa")
      ? "Zwykle zamawiam małą kawę, bo bardzo ją lubię."
      : "W kawiarni zwykle zamawiam kawę albo herbatę.";
  }

  if (scenarioId === "life") {
    return userText.includes("mieszk")
      ? "Mieszkam w Warszawie i pracuję w biurze."
      : "Mieszkam w Polsce i uczę się języka polskiego.";
  }

  return userText.includes("rodzin")
    ? "W weekend chcę spędzić czas z rodziną i odpocząć."
    : "W sobotę chcę odpoczywać i spotkać się z przyjaciółmi.";
}

function buildDialogueCorrections(userText) {
  const corrections = [];

  if (userText.length < 5) {
    corrections.push("Попробуй ответить чуть полнее: хотя бы одним коротким предложением на польском.");
  }

  if (/ ja jest /i.test(` ${userText} `)) {
    corrections.push("Лучше говорить 'ja jestem', а не 'ja jest'.");
  }

  if (/ ja ma /i.test(` ${userText} `)) {
    corrections.push("В 1-м лице лучше 'mam', а не 'ma'.");
  }

  if (/ ja lubi /i.test(` ${userText} `)) {
    corrections.push("В 1-м лице правильно 'lubię', а не 'lubi'.");
  }

  if (/ ja chce /i.test(` ${userText} `)) {
    corrections.push("В 1-м лице правильно писать 'chcę', а не 'chce'.");
  }

  if (corrections.length === 0) {
    corrections.push("Хорошо: ответ звучит по теме. Если хочешь, добавляй маленькую причину или деталь, чтобы речь звучала живее.");
  }

  return corrections;
}

function buildDialogueTeacherReply(scenario, promptIndex, userText) {
  if (scenario.id === "cafe") {
    if (promptIndex === 0) {
      return userText.includes("kawa")
        ? "Bardzo dobrze. Kawa to częsty wybór. Powiedz mi teraz: jaki napój lubisz najbardziej i dlaczego?"
        : "Dobrze. Spróbujmy dalej. Jaki napój lubisz najbardziej i dlaczego?";
    }

    if (promptIndex === 1) {
      return "Świetnie. Czy wolisz siedzieć w kawiarni czy brać napój na wynos?";
    }

    return "Bardzo ładnie. Twoje odpowiedzi brzmią coraz bardziej naturalnie.";
  }

  if (scenario.id === "life") {
    if (promptIndex === 0) {
      return "Dobrze, już wiem o tobie trochę więcej. Co lubisz robić po pracy albo po lekcjach?";
    }

    if (promptIndex === 1) {
      return "Bardzo dobrze. A jakie masz plany na ten tydzień?";
    }

    return "Świetnie sobie radzisz. Mówisz prostymi, ale poprawnymi zdaniami.";
  }

  if (promptIndex === 0) {
    return "Brzmi dobrze. A z kim chcesz spędzić weekend?";
  }

  if (promptIndex === 1) {
    return "Super. Na koniec powiedz, gdzie najchętniej odpoczywasz.";
  }

  return "Bardzo dobrze. Umiesz już opowiadać o swoich planach prostym polskim.";
}
