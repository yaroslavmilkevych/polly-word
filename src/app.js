import { WORDS } from "./words-data.js";
import {
  buildQuizQuestion,
  createDefaultProgress,
  mergeWordsWithProgress,
  selectStudyWords,
  summarizeProgress,
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
  chatMode: "translation",
  quiz: null,
  currentGameIndex: 0,
  deferredInstallPrompt: null,
  authPending: false,
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
  ui.authForm = document.querySelector("#auth-form");
  ui.authStatus = document.querySelector("#auth-status");
  ui.emailInput = document.querySelector("#email-input");
  ui.passwordInput = document.querySelector("#password-input");
  ui.registerButton = document.querySelector("#register-button");
  ui.loginButton = document.querySelector("#login-button");
  ui.logoutButton = document.querySelector("#logout-button");
  ui.installButton = document.querySelector("#install-button");
  ui.profileName = document.querySelector("#profile-name");
  ui.profileSubtitle = document.querySelector("#profile-subtitle");
  ui.syncMode = document.querySelector("#sync-mode");
  ui.newCount = document.querySelector("#new-count");
  ui.archivedCount = document.querySelector("#archived-count");
  ui.reviewCount = document.querySelector("#review-count");
  ui.topicFilter = document.querySelector("#topic-filter");
  ui.levelFilter = document.querySelector("#level-filter");
  ui.wordList = document.querySelector("#word-list");
  ui.stickerGrid = document.querySelector("#sticker-grid");
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
  ui.chatModeSelect = document.querySelector("#chat-mode-select");
  ui.exerciseCard = document.querySelector("#exercise-card");
  ui.nextExerciseButton = document.querySelector("#next-exercise-button");
  ui.chatLog = document.querySelector("#chat-log");
  ui.chatForm = document.querySelector("#chat-form");
  ui.chatInput = document.querySelector("#chat-input");
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
}

function renderProfile() {
  if (!state.user) {
    return;
  }

  ui.profileName.textContent = state.user.email;
  ui.profileSubtitle.textContent = `Аккаунт создан ${new Date(
    state.user.createdAt,
  ).toLocaleDateString("ru-RU")}`;
  ui.syncMode.textContent = state.services.authService.getModeLabel();
}

function renderStats() {
  const summary = summarizeProgress(state.words, state.progress);
  ui.newCount.textContent = String(summary.newWords);
  ui.archivedCount.textContent = String(summary.archived);
  ui.reviewCount.textContent = String(state.reviewSessions.length);
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
          <p class="word-card__topic">${word.topic} · ${word.example}</p>
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
              ${word.progress.status === "archived" ? "Вернуть в обучение" : "Отметить как знаю"}
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
    ui.gamePositionLabel.textContent = "Слово 0 из 0";
    ui.prevWordButton.disabled = true;
    ui.nextWordButton.disabled = true;
    return;
  }

  const currentWord = cards[state.currentGameIndex];
  ui.stickerGrid.innerHTML = stickerMarkup(currentWord, "game");
  ui.gamePositionLabel.textContent = `Слово ${state.currentGameIndex + 1} из ${cards.length}`;
  ui.prevWordButton.disabled = state.currentGameIndex === 0;
  ui.nextWordButton.disabled = state.currentGameIndex === cards.length - 1;
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
  ui.exerciseCard.innerHTML = `
    <div class="exercise-card__header">
      <strong>${exercise.title}</strong>
      <span class="tag">${exercise.mode === "dialogue" ? "Диалог" : "Перевод"}</span>
    </div>
    <p class="exercise-card__prompt">${exercise.prompt}</p>
    <p class="exercise-card__meta">${exercise.helpText}</p>
  `;
}

function renderChatLog() {
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
        <div class="chat-bubble__title">Учебный ассистент</div>
        <div>Выбери режим и напиши ответ. Я помогу с польской фразой и исправлю типовые ошибки.</div>
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

async function handleAuth(action) {
  if (state.authPending) {
    return;
  }

  const email = ui.emailInput.value.trim();
  const password = ui.passwordInput.value.trim();

  if (!email || !password) {
    ui.authStatus.textContent = "Заполни email и пароль.";
    return;
  }

  state.authPending = true;
  updateAuthControls();

  try {
    if (action === "register") {
      state.user = await state.services.authService.register(email, password);
      ui.authStatus.textContent = "Регистрация выполнена успешно.";
    } else {
      state.user = await state.services.authService.login(email, password);
      ui.authStatus.textContent = "Вход выполнен успешно.";
    }
    await bootstrapUserState();
    state.activeTab = DEFAULT_TAB;
    render();
  } catch (error) {
    const canUseLocalFallback = state.services.syncMode === "local";

    if (canUseLocalFallback && action === "login" && error.code === "USER_NOT_FOUND") {
      try {
        state.user = await state.services.authService.register(email, password);
        await bootstrapUserState();
        ui.authStatus.textContent =
          "Аккаунт не был найден, поэтому мы создали его и сразу выполнили вход.";
        state.activeTab = DEFAULT_TAB;
        render();
        return;
      } catch (registerError) {
        ui.authStatus.textContent =
          registerError.message ?? "Не удалось создать аккаунт.";
        return;
      }
    }

    if (canUseLocalFallback && action === "register" && error.code === "USER_EXISTS") {
      try {
        state.user = await state.services.authService.login(email, password);
        await bootstrapUserState();
        ui.authStatus.textContent =
          "Такой аккаунт уже существовал, поэтому мы просто выполнили вход.";
        state.activeTab = DEFAULT_TAB;
        render();
        return;
      } catch (loginError) {
        ui.authStatus.textContent =
          loginError.message ??
          "Такой аккаунт уже существует, но пароль не подошел.";
        return;
      }
    }

    ui.authStatus.textContent = error.message ?? "Не удалось выполнить вход.";
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
    handleAuth("login");
  });

  ui.registerButton?.addEventListener("click", () => {
    handleAuth("register");
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

    if (quizButton) {
      await handleQuizAnswer(quizButton.dataset.quizAnswer, quizButton);
    }
  });

  ui.chatModeSelect?.addEventListener("change", (event) => {
    state.chatMode = event.target.value;
    renderChatExercise();
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

  ui.chatForm?.addEventListener("submit", handleChatSubmit);
}

async function handleLogout() {
  await state.services.authService.logout();
  state.user = null;
  state.progress = createDefaultProgress(state.words);
  state.reviewSessions = [];
  state.chatMessages = [];
  ui.authForm.reset();
  ui.authStatus.textContent =
    "Вы вышли из аккаунта. Можно войти снова или зарегистрировать новый профиль.";
  render();
}

function updateAuthControls() {
  const isPending = state.authPending;
  if (ui.emailInput) ui.emailInput.disabled = isPending;
  if (ui.passwordInput) ui.passwordInput.disabled = isPending;
  if (ui.loginButton) ui.loginButton.disabled = isPending;
  if (ui.registerButton) ui.registerButton.disabled = isPending;
  if (ui.loginButton) ui.loginButton.textContent = isPending ? "Подождите..." : "Войти";
  if (ui.registerButton) {
    ui.registerButton.textContent = isPending
      ? "Подождите..."
      : "Зарегистрироваться";
  }
}

function resetAuthStatus() {
  if (!ui.authStatus || state.user) {
    return;
  }

  ui.authStatus.textContent =
    "Демо-режим включен: можно зарегистрироваться и сохранить прогресс локально.";
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
