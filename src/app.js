import { WORDS } from "./words-data.js";
import {
  buildQuizQuestion,
  createDefaultProgress,
  mergeWordsWithProgress,
  selectStudyWords,
  summarizeProgress,
  updateTranslationStreak,
  upsertWordProgress,
} from "./state-model.js";
import { createServices } from "./storage.js";
import { TutorService } from "./tutor-service.js";

const DEFAULT_TAB = "words";
const NEW_WORDS_BATCH_SIZE = 12;

const state = {
  services: null,
  tutorService: new TutorService(),
  words: WORDS,
  user: null,
  progress: createDefaultProgress(WORDS),
  reviewSessions: [],
  chatMessages: [],
  activeTab: DEFAULT_TAB,
  topicFilter: "all",
  levelFilter: "all",
  archiveMode: "cards",
  gameMode: "cards",
  chatMode: "translation",
  quiz: null,
  currentGameIndex: 0,
  currentTranslateDirection: "pl-ru",
  deferredInstallPrompt: null,
  authPending: false,
  authMode: "chooser",
};

const ui = {};

function setHidden(element, value) {
  if (element) {
    element.hidden = value;
  }
}

function cacheDom() {
  ui.appShell = document.querySelector("#app-shell");
  ui.authPanel = document.querySelector("#auth-panel");
  ui.dashboard = document.querySelector("#dashboard");
  ui.bottomNav = document.querySelector("#bottom-nav");
  ui.authChooser = document.querySelector("#auth-chooser");
  ui.authForm = document.querySelector("#auth-form");
  ui.authStatus = document.querySelector("#auth-status");
  ui.nameField = document.querySelector("#name-field");
  ui.nameInput = document.querySelector("#name-input");
  ui.emailInput = document.querySelector("#email-input");
  ui.passwordInput = document.querySelector("#password-input");
  ui.authChoiceLogin = document.querySelector("#auth-choice-login");
  ui.authChoiceRegister = document.querySelector("#auth-choice-register");
  ui.authSubmitButton = document.querySelector("#auth-submit-button");
  ui.authSwitchButton = document.querySelector("#auth-switch-button");
  ui.authBackButton = document.querySelector("#auth-back-button");
  ui.headerProfile = document.querySelector("#header-profile");
  ui.headerProfileName = document.querySelector("#header-profile-name");
  ui.headerProfileSubtitle = document.querySelector("#header-profile-subtitle");
  ui.headerNewCount = document.querySelector("#header-new-count");
  ui.headerArchivedCount = document.querySelector("#header-archived-count");
  ui.headerReviewCount = document.querySelector("#header-review-count");
  ui.logoutButton = document.querySelector("#logout-button");
  ui.installButton = document.querySelector("#install-button");
  ui.syncMode = document.querySelector("#sync-mode");
  ui.topicFilter = document.querySelector("#topic-filter");
  ui.levelFilter = document.querySelector("#level-filter");
  ui.wordList = document.querySelector("#word-list");
  ui.stickerGrid = document.querySelector("#sticker-grid");
  ui.translateStage = document.querySelector("#translate-stage");
  ui.translateForm = document.querySelector("#translate-form");
  ui.translateInput = document.querySelector("#translate-input");
  ui.translatePrompt = document.querySelector("#translate-prompt");
  ui.translateFeedback = document.querySelector("#translate-feedback");
  ui.translateDirectionLabel = document.querySelector("#translate-direction-label");
  ui.translateStreakLabel = document.querySelector("#translate-streak-label");
  ui.prevWordButton = document.querySelector("#prev-word-button");
  ui.nextWordButton = document.querySelector("#next-word-button");
  ui.gamePositionLabel = document.querySelector("#game-position-label");
  ui.archiveWordList = document.querySelector("#archive-word-list");
  ui.archiveCards = document.querySelector("#archive-cards");
  ui.quizPanel = document.querySelector("#quiz-panel");
  ui.quizQuestion = document.querySelector("#quiz-question");
  ui.quizOptions = document.querySelector("#quiz-options");
  ui.quizFeedback = document.querySelector("#quiz-feedback");
  ui.archiveModeButtons = document.querySelectorAll("[data-archive-mode]");
  ui.gameModeButtons = document.querySelectorAll("[data-game-mode]");
  ui.chatModeButtons = document.querySelectorAll("[data-chat-mode]");
  ui.exerciseCard = document.querySelector("#exercise-card");
  ui.nextExerciseButton = document.querySelector("#next-exercise-button");
  ui.chatLog = document.querySelector("#chat-log");
  ui.chatForm = document.querySelector("#chat-form");
  ui.chatInput = document.querySelector("#chat-input");
  ui.tutorPanelTitle = document.querySelector("#tutor-panel-title");
  ui.chatPanelTitle = document.querySelector("#chat-panel-title");
  ui.chatPanelHint = document.querySelector("#chat-panel-hint");
  ui.tabButtons = document.querySelectorAll("[data-tab]");
  ui.tabPanels = document.querySelectorAll("[data-tab-panel]");
}

function visibleWords() {
  return selectStudyWords(state.words, state.progress, {
    topic: state.topicFilter,
    level: state.levelFilter,
    limit: NEW_WORDS_BATCH_SIZE,
  });
}

function activeLearningWords() {
  return selectStudyWords(state.words, state.progress, {
    topic: state.topicFilter,
    level: state.levelFilter,
  });
}

function clampGameIndex(words) {
  if (words.length === 0) {
    state.currentGameIndex = 0;
    return;
  }

  if (state.currentGameIndex >= words.length) {
    state.currentGameIndex = words.length - 1;
  }

  if (state.currentGameIndex < 0) {
    state.currentGameIndex = 0;
  }
}

function archivedWords() {
  return mergeWordsWithProgress(state.words, state.progress).filter(
    (word) => word.progress.status === "archived",
  );
}

function updateAuthVisibility() {
  const loggedIn = Boolean(state.user);
  ui.appShell?.classList.toggle("is-authenticated", loggedIn);
  setHidden(ui.authPanel, loggedIn);
  setHidden(ui.dashboard, !loggedIn);
  setHidden(ui.bottomNav, !loggedIn);
  setHidden(ui.logoutButton, !loggedIn);
  setHidden(ui.headerProfile, !loggedIn);
}

function authModeCopy() {
  if (state.authMode === "register") {
    return {
      submit: "Создать аккаунт",
      switchText: "Уже есть аккаунт? Войти",
      status: "Заполни имя, email и пароль, чтобы создать свой аккаунт.",
    };
  }

  if (state.authMode === "login") {
    return {
      submit: "Войти",
      switchText: "Нет аккаунта? Зарегистрироваться",
      status: "Введи email и пароль, чтобы войти в свой аккаунт.",
    };
  }

  return {
    submit: "Войти",
    switchText: "Зарегистрироваться",
    status: "Выбери, хочешь ты войти в аккаунт или создать новый.",
  };
}

function renderAuthPanel() {
  if (state.user) {
    return;
  }

  const isChooser = state.authMode === "chooser";
  const isRegister = state.authMode === "register";
  const copy = authModeCopy();

  setHidden(ui.authChooser, !isChooser);
  setHidden(ui.authForm, isChooser);
  setHidden(ui.nameField, !isRegister);
  setHidden(ui.authBackButton, isChooser);

  if (ui.nameInput) {
    ui.nameInput.required = isRegister;
  }

  if (ui.authSubmitButton) {
    ui.authSubmitButton.textContent = state.authPending ? "Подождите..." : copy.submit;
  }

  if (ui.authSwitchButton) {
    ui.authSwitchButton.textContent = state.authPending ? "Подождите..." : copy.switchText;
  }

  if (ui.authStatus && !ui.authStatus.dataset.locked) {
    ui.authStatus.textContent = copy.status;
  }
}

function renderProfile() {
  if (!state.user) {
    return;
  }

  const createdAtText = `Аккаунт создан ${new Date(
    state.user.createdAt,
  ).toLocaleDateString("ru-RU")}`;

  ui.headerProfileName.textContent = state.user.displayName || state.user.email;
  ui.headerProfileSubtitle.textContent = createdAtText;
  ui.syncMode.textContent = state.services.authService.getModeLabel();
}

function renderStats() {
  const summary = summarizeProgress(state.words, state.progress);
  ui.headerNewCount.textContent = `Новых слов: ${summary.newWords}`;
  ui.headerArchivedCount.textContent = `В архиве: ${summary.archived}`;
  ui.headerReviewCount.textContent = `Повторений: ${state.reviewSessions.length}`;
}

function renderTopicFilter() {
  if (!ui.topicFilter) {
    return;
  }

  const topics = [...new Set(state.words.map((word) => word.topic))];
  const options = ['<option value="all">Все темы</option>']
    .concat(
      topics.map(
        (topic) =>
          `<option value="${topic}" ${
            state.topicFilter === topic ? "selected" : ""
          }>${topic}</option>`,
      ),
    )
    .join("");

  ui.topicFilter.innerHTML = options;
}

function renderLevelFilter() {
  if (!ui.levelFilter) {
    return;
  }

  const levelOrder = ["A1", "A2", "B1", "B2", "C1"];
  const levels = [...new Set(state.words.map((word) => word.level))];
  levels.sort((left, right) => levelOrder.indexOf(left) - levelOrder.indexOf(right));
  const options = ['<option value="all">Все уровни</option>']
    .concat(
      levels.map(
        (level) =>
          `<option value="${level}" ${
            state.levelFilter === level ? "selected" : ""
          }>${level}</option>`,
      ),
    )
    .join("");

  ui.levelFilter.innerHTML = options;
}

function renderWords() {
  const wordsMarkup = visibleWords()
    .map(
      (word) => `
        <article class="word-card">
          <div class="word-card__header">
            <strong>${word.polish}</strong>
            <span class="tag">${word.progress.status === "archived" ? "В архиве" : word.level}</span>
          </div>
          <p class="word-card__translation">${word.russian}</p>
          <p class="word-card__topic">${word.topic}</p>
          <p class="word-card__example">${word.example}</p>
          <div class="word-card__actions">
            <button class="primary-button" type="button" data-jump-tab="game">
              Тренировать
            </button>
            <button
              class="link-button"
              type="button"
              data-progress-word="${word.id}"
              data-progress-status="${word.progress.status === "archived" ? "learning" : "archived"}"
            >
              ${word.progress.status === "archived" ? "Вернуть" : "Знаю"}
            </button>
          </div>
        </article>
      `,
    )
    .join("");

  ui.wordList.innerHTML =
    wordsMarkup ||
    '<p class="support-copy">В разделе новых слов сейчас пусто: текущая порция уже изучена. Перейди в архив для повторения или смени тему, чтобы открыть другую группу слов.</p>';
}

function stickerMarkup(word, scope) {
  return `
    <article class="sticker-card" data-word-id="${word.id}" data-scope="${scope}">
      <div class="sticker-card__inner">
        <div class="sticker-card__front">
          <button class="sticker-card__surface" type="button" data-flip-word="${word.id}" aria-label="Перевернуть карточку ${word.polish}">
            <div class="sticker-card__meta">${word.topic}</div>
            <strong>${word.polish}</strong>
            <p class="support-copy">Нажми, чтобы увидеть перевод</p>
          </button>
        </div>
        <div class="sticker-card__back">
          <button class="sticker-card__surface" type="button" data-flip-word="${word.id}" aria-label="Перевернуть карточку назад ${word.polish}">
            <div class="sticker-card__meta">${word.topic}</div>
            <strong>${word.russian}</strong>
            <p class="support-copy">${word.example}</p>
          </button>
          <div class="sticker-card__actions">
            <button class="primary-button" type="button" data-progress-word="${word.id}" data-progress-status="archived">
              ЗНАЮ
            </button>
            <button class="secondary-button" type="button" data-progress-word="${word.id}" data-progress-status="learning">
              ЕЩЕ УЧУ
            </button>
          </div>
        </div>
      </div>
    </article>
  `;
}

function renderGame() {
  const cards = activeLearningWords();
  clampGameIndex(cards);

  if (!cards.length) {
    ui.stickerGrid.innerHTML =
      '<p class="support-copy">Все слова уже перенесены в архив. Перейди в архив и повтори их там.</p>';
    setHidden(ui.translateStage, true);
    setHidden(ui.stickerGrid, false);
    ui.gamePositionLabel.textContent = "Слово 0 из 0";
    ui.prevWordButton.disabled = true;
    ui.nextWordButton.disabled = true;
    return;
  }

  const currentWord = cards[state.currentGameIndex];
  ui.gamePositionLabel.textContent = `Слово ${state.currentGameIndex + 1} из ${cards.length}`;
  ui.prevWordButton.disabled = state.currentGameIndex === 0;
  ui.nextWordButton.disabled = state.currentGameIndex === cards.length - 1;
  ui.gameModeButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.gameMode === state.gameMode);
  });

  if (state.gameMode === "cards") {
    setHidden(ui.stickerGrid, false);
    setHidden(ui.translateStage, true);
    ui.stickerGrid.innerHTML = stickerMarkup(currentWord, "game");
    return;
  }

  setHidden(ui.stickerGrid, true);
  setHidden(ui.translateStage, false);
  renderTranslateGame(currentWord);
}

function renderTranslateGame(word) {
  const prompt =
    state.currentTranslateDirection === "pl-ru" ? word.polish : word.russian;
  const directionLabel =
    state.currentTranslateDirection === "pl-ru"
      ? "Польский → Русский"
      : "Русский → Польский";
  const streak = state.progress[word.id]?.translationStreak ?? 0;

  ui.translateDirectionLabel.textContent = directionLabel;
  ui.translatePrompt.textContent = prompt;
  ui.translateStreakLabel.textContent = `Серия: ${streak} / 5`;
  ui.translateInput.value = "";
  ui.translateInput.placeholder =
    state.currentTranslateDirection === "pl-ru"
      ? "Напиши перевод на русском"
      : "Напиши перевод на польском";
  ui.translateFeedback.textContent =
    "Напиши перевод. После проверки перейдем к следующему слову.";
}

function renderArchive() {
  const words = archivedWords();

  ui.archiveWordList.innerHTML = words.length
    ? words
        .map(
          (word) => `
            <article class="archive-item">
              <div>
                <strong>${word.polish}</strong>
                <small>${word.russian} · ${word.topic}</small>
              </div>
              <button class="link-button" type="button" data-progress-word="${word.id}" data-progress-status="learning">
                Вернуть в изучение
              </button>
            </article>
          `,
        )
        .join("")
    : '<p class="support-copy">Пока архив пуст. Нажми "ЗНАЮ" на карточке, чтобы отправить слово сюда.</p>';

  ui.archiveCards.innerHTML = words.length
    ? words.map((word) => stickerMarkup(word, "archive")).join("")
    : "";

  const showCards = state.archiveMode === "cards";
  ui.archiveCards.hidden = !showCards;
  ui.quizPanel.hidden = showCards;
  ui.archiveModeButtons.forEach((button) => {
    button.classList.toggle(
      "is-active",
      button.dataset.archiveMode === state.archiveMode,
    );
  });

  if (!showCards) {
    renderQuiz(words);
  }
}

function renderQuiz(words = archivedWords()) {
  state.quiz = buildQuizQuestion(words) ?? null;

  if (!state.quiz) {
    ui.quizQuestion.textContent =
      "Для мини-теста нужно хотя бы два слова в архиве.";
    ui.quizOptions.innerHTML = "";
    ui.quizFeedback.textContent =
      "Добавь больше изученных слов, чтобы запустить тест.";
    return;
  }

  ui.quizQuestion.textContent = state.quiz.prompt;
  ui.quizOptions.innerHTML = state.quiz.options
    .map(
      (option) => `
        <button class="quiz-option" type="button" data-quiz-answer="${option}">
          ${option}
        </button>
      `,
    )
    .join("");
  ui.quizFeedback.textContent = "Выбери перевод и закрепи слово.";
}

function renderChatExercise() {
  const exercise = state.tutorService.getExercise(state.chatMode);
  const isDialogue = state.chatMode === "dialogue";
  const [promptLead, promptFocus] = splitExercisePrompt(exercise.prompt, isDialogue);

  ui.chatModeButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.chatMode === state.chatMode);
  });

  if (ui.tutorPanelTitle) {
    ui.tutorPanelTitle.textContent = "";
    setHidden(ui.tutorPanelTitle, true);
  }

  if (ui.chatPanelTitle) {
    ui.chatPanelTitle.textContent = isDialogue
      ? "Разговор с учителем"
      : "Проверка перевода";
  }

  if (ui.chatPanelHint) {
    ui.chatPanelHint.textContent = isDialogue
      ? "Пиши по-польски. Учитель поправит ответ и продолжит разговор новым вопросом."
      : "Пиши перевод на польский. Тренер покажет ошибку, объяснение и естественный вариант.";
  }

  if (ui.chatInput) {
    ui.chatInput.placeholder = isDialogue
      ? "Напиши ответ по-польски"
      : "Напиши перевод на польский";
  }

  if (ui.nextExerciseButton) {
    ui.nextExerciseButton.textContent = isDialogue
      ? "Сменить тему"
      : "Следующее задание";
  }

  ui.exerciseCard.innerHTML = `
    ${promptLead ? `<p class="exercise-card__lead">${promptLead}</p>` : ""}
    <div class="exercise-card__focus">
      <strong>${promptFocus}</strong>
    </div>
    <details class="help-popover help-popover--card">
      <summary aria-label="Показать подсказку к заданию">?</summary>
      <div class="help-popover__content">${exercise.helpText}</div>
    </details>
  `;
}

function splitExercisePrompt(prompt, isDialogue) {
  if (isDialogue) {
    return ["", prompt];
  }

  const parts = prompt.split(":");
  if (parts.length < 2) {
    return ["Переведи на польский:", prompt];
  }

  const lead = `${parts.shift()}:`;
  const focus = parts.join(":").trim();
  return [lead, focus];
}

function renderChatLog() {
  const dialogueOpeningPrompt =
    state.chatMode === "dialogue"
      ? state.tutorService.getExercise("dialogue").prompt
      : null;

  ui.chatLog.innerHTML = state.chatMessages.length
    ? state.chatMessages
        .map(
          (message) => `
            <article class="chat-bubble chat-bubble--${message.role}">
              <div class="chat-bubble__title">${message.title}</div>
              <div>${message.body.replaceAll("\n", "<br />")}</div>
            </article>
          `,
        )
        .join("")
    : `
      <article class="chat-bubble chat-bubble--assistant">
        <div class="chat-bubble__title">Тренер польского</div>
        <div>${
          state.chatMode === "dialogue"
            ? `${dialogueOpeningPrompt}<br /><br />Napisz odpowiedź po polsku, a ja odpowiem jak nauczyciel i pociągnę rozmowę dalej.`
            : "Выбери задание, напиши перевод на польском и получи исправление с объяснением."
        }</div>
      </article>
    `;
}

function renderTabs() {
  ui.tabButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.tab === state.activeTab);
  });

  ui.tabPanels.forEach((panel) => {
    setHidden(panel, panel.dataset.tabPanel !== state.activeTab);
  });
}

function render() {
  updateAuthVisibility();

  if (!state.user) {
    renderAuthPanel();
    return;
  }

  renderProfile();
  renderStats();
  renderTopicFilter();
  renderLevelFilter();
  renderWords();
  renderGame();
  renderArchive();
  renderChatExercise();
  renderChatLog();
  renderTabs();
}

async function saveProgress() {
  await state.services.progressRepository.save(state.user.id, state.progress);
}

async function addReviewSession(type, score, metadata = {}) {
  const review = {
    id: crypto.randomUUID(),
    type,
    score,
    metadata,
    created_at: new Date().toISOString(),
  };

  state.reviewSessions = await state.services.reviewService.add(state.user.id, review);
}

async function saveChat() {
  await state.services.chatRepository.save(state.user.id, state.chatMessages);
}

async function setProgress(wordId, nextStatus) {
  const wasGameWord =
    state.activeTab === "game" &&
    activeLearningWords().some((word) => word.id === wordId);
  state.progress = upsertWordProgress(state.progress, wordId, nextStatus);
  await saveProgress();

  if (nextStatus === "archived") {
    await addReviewSession("mark-known", 1, { wordId });
  }

  if (wasGameWord && nextStatus === "archived") {
    const nextCards = activeLearningWords();
    clampGameIndex(nextCards);
  }

  render();
}

function normalizeAnswer(value) {
  return value
    .toLowerCase()
    .replace(/[.!?,]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function getCurrentGameWord() {
  const cards = activeLearningWords();
  if (!cards.length) {
    return null;
  }

  clampGameIndex(cards);
  return cards[state.currentGameIndex];
}

function advanceGameWord() {
  const cards = activeLearningWords();
  clampGameIndex(cards);

  if (state.currentGameIndex < cards.length - 1) {
    state.currentGameIndex += 1;
  }

  state.currentTranslateDirection =
    state.currentTranslateDirection === "pl-ru" ? "ru-pl" : "pl-ru";
  renderGame();
}

async function handleTranslateSubmit(event) {
  event.preventDefault();
  const word = getCurrentGameWord();
  const answer = ui.translateInput.value.trim();

  if (!word || !answer) {
    ui.translateFeedback.textContent = "Сначала введи перевод.";
    return;
  }

  const expected =
    state.currentTranslateDirection === "pl-ru" ? word.russian : word.polish;
  const isCorrect = normalizeAnswer(answer) === normalizeAnswer(expected);

  state.progress = updateTranslationStreak(state.progress, word.id, isCorrect);
  const streak = state.progress[word.id]?.translationStreak ?? 0;

  if (isCorrect) {
    ui.translateFeedback.textContent =
      streak >= 5
        ? `Правильно. Слово "${word.polish}" выучено и отправлено в архив.`
        : `Правильно. Текущая серия для слова: ${streak} из 5.`;
  } else {
    ui.translateFeedback.textContent = `Неправильно. Верный ответ: ${expected}`;
  }

  if (isCorrect && streak >= 5) {
    state.progress = upsertWordProgress(state.progress, word.id, "archived");
    await addReviewSession("translation-mastered", 1, {
      wordId: word.id,
      direction: state.currentTranslateDirection,
    });
  }

  await saveProgress();
  renderStats();

  window.setTimeout(() => {
    advanceGameWord();
  }, isCorrect ? 700 : 1200);
}

async function handleAuth(action) {
  if (state.authPending) {
    return;
  }

  const name = ui.nameInput.value.trim();
  const email = ui.emailInput.value.trim();
  const password = ui.passwordInput.value.trim();

  if (action === "register" && !name) {
    ui.authStatus.textContent = "Для регистрации укажи имя.";
    ui.authStatus.dataset.locked = "true";
    return;
  }

  if (!email || !password) {
    ui.authStatus.textContent =
      action === "register"
        ? "Заполни имя, email и пароль."
        : "Заполни email и пароль.";
    ui.authStatus.dataset.locked = "true";
    return;
  }

  state.authPending = true;
  updateAuthControls();

  try {
    if (action === "register") {
      state.user = await state.services.authService.register(name, email, password);
      ui.authStatus.textContent = "Регистрация выполнена успешно.";
    } else {
      state.user = await state.services.authService.login(email, password);
      ui.authStatus.textContent = "Вход выполнен успешно.";
    }
    ui.authStatus.dataset.locked = "";
    await bootstrapUserState();
    state.activeTab = DEFAULT_TAB;
    render();
  } catch (error) {
    ui.authStatus.textContent =
      error.message ??
      (action === "register"
        ? "Не удалось зарегистрироваться."
        : "Не удалось выполнить вход.");
    ui.authStatus.dataset.locked = "true";
  } finally {
    state.authPending = false;
    updateAuthControls();
  }
}

async function bootstrapUserState() {
  state.progress = {
    ...createDefaultProgress(state.words),
    ...(await state.services.progressRepository.load(state.user.id)),
  };
  state.reviewSessions = await state.services.reviewService.list(state.user.id);
  state.chatMessages = await state.services.chatRepository.list(state.user.id);
}

function appendChatMessage(message) {
  state.chatMessages.push({
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    ...message,
  });
}

async function handleChatSubmit(event) {
  event.preventDefault();
  const value = ui.chatInput.value.trim();

  if (!value) {
    return;
  }

  appendChatMessage({
    role: "user",
    title: "Ты",
    body: value,
  });

  const feedback = state.tutorService.respond(state.chatMode, value);
  appendChatMessage({
    role: "assistant",
    title: feedback.mode === "dialogue" ? "Диалоговый тренер" : "Тренер перевода",
    body: [
      feedback.replyText,
      `Исправления: ${feedback.corrections.join(" ")}`,
      `Объяснение: ${feedback.explanationRu}`,
      `Рекомендуемый вариант: ${feedback.suggestedPolish}`,
    ].join("\n\n"),
  });

  ui.chatInput.value = "";
  await saveChat();
  render();
}

async function handleQuizAnswer(answer, button) {
  if (!state.quiz) {
    return;
  }

  const isCorrect = answer === state.quiz.correctAnswer;
  button.classList.add(isCorrect ? "is-correct" : "is-wrong");
  ui.quizFeedback.textContent = isCorrect
    ? "Верно. Отличное повторение."
    : `Пока мимо. Правильный ответ: ${state.quiz.correctAnswer}`;
  await addReviewSession("quiz", isCorrect ? 1 : 0, { wordId: state.quiz.wordId });
  renderStats();

  window.setTimeout(() => {
    renderQuiz();
  }, 650);
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    return;
  }

  navigator.serviceWorker
    .getRegistrations()
    .then((registrations) =>
      Promise.all(registrations.map((registration) => registration.unregister())),
    )
    .then(() => globalThis.caches?.keys?.())
    .then((keys) => {
      if (!keys) {
        return;
      }

      return Promise.all(keys.map((key) => globalThis.caches.delete(key)));
    })
    .catch(() => {
      // Ignore cache cleanup failures in restricted environments.
    });
}

function setupInstallPrompt() {
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    state.deferredInstallPrompt = event;
    setHidden(ui.installButton, false);
  });

  ui.installButton?.addEventListener("click", async () => {
    if (!state.deferredInstallPrompt) {
      return;
    }

    state.deferredInstallPrompt.prompt();
    await state.deferredInstallPrompt.userChoice;
    state.deferredInstallPrompt = null;
    setHidden(ui.installButton, true);
  });
}

function setupEvents() {
  ui.authForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    if (state.authMode === "register") {
      handleAuth("register");
      return;
    }

    handleAuth("login");
  });

  ui.authChoiceLogin?.addEventListener("click", () => {
    state.authMode = "login";
    ui.authStatus.dataset.locked = "";
    renderAuthPanel();
  });

  ui.authChoiceRegister?.addEventListener("click", () => {
    state.authMode = "register";
    ui.authStatus.dataset.locked = "";
    renderAuthPanel();
  });

  ui.authSwitchButton?.addEventListener("click", () => {
    state.authMode = state.authMode === "register" ? "login" : "register";
    ui.authStatus.dataset.locked = "";
    renderAuthPanel();
  });

  ui.authBackButton?.addEventListener("click", () => {
    state.authMode = "chooser";
    ui.authForm.reset();
    ui.authStatus.dataset.locked = "";
    renderAuthPanel();
  });

  ui.logoutButton?.addEventListener("click", async () => {
    await handleLogout();
  });

  ui.topicFilter?.addEventListener("change", (event) => {
    state.topicFilter = event.target.value;
    renderWords();
    renderGame();
  });

  ui.levelFilter?.addEventListener("change", (event) => {
    state.levelFilter = event.target.value;
    renderWords();
    renderGame();
  });

  ui.nameInput?.addEventListener("input", resetAuthStatus);
  ui.emailInput?.addEventListener("input", resetAuthStatus);
  ui.passwordInput?.addEventListener("input", resetAuthStatus);

  ui.bottomNav?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-tab]");
    if (!button) {
      return;
    }

    state.activeTab = button.dataset.tab;
    renderTabs();
  });

  ui.wordList?.addEventListener("click", async (event) => {
    const progressButton = event.target.closest("[data-progress-word]");
    const jumpButton = event.target.closest("[data-jump-tab]");

    if (jumpButton) {
      state.activeTab = jumpButton.dataset.jumpTab;
      state.currentGameIndex = 0;
      renderTabs();
      return;
    }

    if (progressButton) {
      await setProgress(
        progressButton.dataset.progressWord,
        progressButton.dataset.progressStatus,
      );
    }
  });

  document.addEventListener("click", async (event) => {
    const flipButton = event.target.closest("[data-flip-word]");
    const progressButton = event.target.closest("[data-progress-word]");
    const archiveModeButton = event.target.closest("[data-archive-mode]");
    const gameModeButton = event.target.closest("[data-game-mode]");
    const chatModeButton = event.target.closest("[data-chat-mode]");
    const quizButton = event.target.closest("[data-quiz-answer]");

    if (flipButton) {
      const card = document.querySelector(
        `.sticker-card[data-word-id="${flipButton.dataset.flipWord}"]`,
      );
      card?.classList.toggle("is-flipped");
    }

    if (
      progressButton &&
      (progressButton.closest("#sticker-grid") ||
        progressButton.closest("#archive-word-list") ||
        progressButton.closest("#archive-cards"))
    ) {
      await setProgress(
        progressButton.dataset.progressWord,
        progressButton.dataset.progressStatus,
      );
    }

    if (archiveModeButton) {
      state.archiveMode = archiveModeButton.dataset.archiveMode;
      renderArchive();
    }

    if (gameModeButton) {
      state.gameMode = gameModeButton.dataset.gameMode;
      renderGame();
    }

    if (chatModeButton) {
      state.chatMode = chatModeButton.dataset.chatMode;
      renderChatExercise();
      renderChatLog();
    }

    if (quizButton) {
      await handleQuizAnswer(quizButton.dataset.quizAnswer, quizButton);
    }
  });

  ui.nextExerciseButton?.addEventListener("click", () => {
    state.tutorService.advance(state.chatMode);
    renderChatExercise();
  });

  ui.prevWordButton?.addEventListener("click", () => {
    state.currentGameIndex -= 1;
    renderGame();
  });

  ui.nextWordButton?.addEventListener("click", () => {
    state.currentGameIndex += 1;
    renderGame();
  });

  ui.translateForm?.addEventListener("submit", handleTranslateSubmit);
  ui.chatForm?.addEventListener("submit", handleChatSubmit);
}

async function handleLogout() {
  await state.services.authService.logout();
  state.user = null;
  state.progress = createDefaultProgress(state.words);
  state.reviewSessions = [];
  state.chatMessages = [];
  state.authMode = "chooser";
  ui.authForm.reset();
  ui.authStatus.dataset.locked = "true";
  ui.authStatus.textContent =
    "Вы вышли из аккаунта. Можно войти снова или зарегистрировать новый профиль.";
  render();
}

function updateAuthControls() {
  const isPending = state.authPending;
  if (ui.nameInput) ui.nameInput.disabled = isPending;
  if (ui.emailInput) ui.emailInput.disabled = isPending;
  if (ui.passwordInput) ui.passwordInput.disabled = isPending;
  if (ui.authChoiceLogin) ui.authChoiceLogin.disabled = isPending;
  if (ui.authChoiceRegister) ui.authChoiceRegister.disabled = isPending;
  if (ui.authSubmitButton) ui.authSubmitButton.disabled = isPending;
  if (ui.authSwitchButton) ui.authSwitchButton.disabled = isPending;
  if (ui.authBackButton) ui.authBackButton.disabled = isPending;
  renderAuthPanel();
}

function resetAuthStatus() {
  if (!ui.authStatus || state.user) {
    return;
  }

  ui.authStatus.dataset.locked = "";
  ui.authStatus.textContent = authModeCopy().status;
}

async function init() {
  cacheDom();
  registerServiceWorker();
  setupInstallPrompt();
  state.services = await createServices();
  state.words = await loadWords();
  state.progress = createDefaultProgress(state.words);
  setupEvents();
  state.user = await state.services.authService.getCurrentUser();

  if (state.user) {
    await bootstrapUserState();
  } else {
    state.authMode = "chooser";
  }

  render();
}

async function loadWords() {
  try {
    const words = await state.services.wordsRepository.list();
    return words.length ? words : WORDS;
  } catch {
    return WORDS;
  }
}

init();
