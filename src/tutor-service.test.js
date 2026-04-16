import test from "node:test";
import assert from "node:assert/strict";

import { TutorService } from "./tutor-service.js";

test("translation mode returns suggested polish and explanation", () => {
  const tutor = new TutorService();
  const response = tutor.respond("translation", "ja chce kawa");

  assert.equal(response.mode, "translation");
  assert.match(response.suggestedPolish, /Chcę kawę/);
  assert.ok(response.corrections.some((item) => item.includes("chcę")));
});

test("dialogue mode keeps conversation moving", () => {
  const tutor = new TutorService();
  const response = tutor.respond("dialogue", "Chcę kawę.");

  assert.equal(response.mode, "dialogue");
  assert.match(response.replyText, /dlaczego|napój|powiedz/i);
  assert.ok(response.explanationRu.length > 0);
});

test("dialogue mode rotates to the next scenario after finishing prompts", () => {
  const tutor = new TutorService();

  tutor.respond("dialogue", "Chcę kawę.");
  tutor.respond("dialogue", "Duży napój.");
  const lastResponse = tutor.respond("dialogue", "Na miejscu.");
  const nextExercise = tutor.getExercise("dialogue");

  assert.match(lastResponse.replyText, /zakończyliśmy|następnego tematu/i);
  assert.equal(nextExercise.title, "Диалог: О жизни");
});

test("advance moves translation exercise forward", () => {
  const tutor = new TutorService();
  const current = tutor.getExercise("translation");
  const next = tutor.advance("translation");

  assert.notEqual(current.prompt, next.prompt);
});
