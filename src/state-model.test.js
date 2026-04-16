import test from "node:test";
import assert from "node:assert/strict";

import {
  buildQuizQuestion,
  createDefaultProgress,
  selectStudyWords,
  summarizeProgress,
  updateTranslationStreak,
  upsertWordProgress,
} from "./state-model.js";

const sampleWords = [
  { id: "one", polish: "cześć", russian: "привет" },
  { id: "two", polish: "kawa", russian: "кофе" },
  { id: "three", polish: "sklep", russian: "магазин" },
];

test("default progress marks every word as new", () => {
  const progress = createDefaultProgress(sampleWords);

  assert.equal(progress.one.status, "new");
  assert.equal(progress.two.correctAnswers, 0);
  assert.equal(progress.one.translationStreak, 0);
});

test("archiving a word increments review counters", () => {
  const next = upsertWordProgress({}, "one", "archived");

  assert.equal(next.one.status, "archived");
  assert.equal(next.one.correctAnswers, 1);
  assert.ok(next.one.lastReviewedAt);
});

test("summary counts new and archived words", () => {
  const progress = {
    one: { wordId: "one", status: "archived" },
    two: { wordId: "two", status: "learning" },
    three: { wordId: "three", status: "new" },
  };

  const summary = summarizeProgress(sampleWords, progress);

  assert.deepEqual(summary, { newWords: 2, archived: 1 });
});

test("quiz question uses archived word translations as options", () => {
  const question = buildQuizQuestion(sampleWords, () => 0);

  assert.equal(question.prompt, 'Как переводится слово "cześć"?');
  assert.equal(question.correctAnswer, "привет");
  assert.equal(question.options.length, 3);
});

test("study words selection skips archived items and limits the batch", () => {
  const words = [
    { id: "one", polish: "a", russian: "a", topic: "A" },
    { id: "two", polish: "b", russian: "b", topic: "A" },
    { id: "three", polish: "c", russian: "c", topic: "A" },
  ];
  const progress = {
    one: { wordId: "one", status: "archived" },
    two: { wordId: "two", status: "new" },
    three: { wordId: "three", status: "learning" },
  };

  const selected = selectStudyWords(words, progress, { topic: "A", limit: 1 });

  assert.deepEqual(selected.map((word) => word.id), ["two"]);
});

test("translation streak increases on correct answer and resets on wrong answer", () => {
  const correct = updateTranslationStreak({}, "one", true);
  const wrong = updateTranslationStreak(correct, "one", false);

  assert.equal(correct.one.translationStreak, 1);
  assert.equal(wrong.one.translationStreak, 0);
});
