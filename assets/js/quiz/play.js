/**
 * Plays one quiz (play.html?quiz=N), one question per screen.
 *
 * Each question is a fieldset of native radio buttons, so keyboard and
 * screen-reader behaviour comes from the browser. Answers are saved to
 * sessionStorage as they're picked, so a refresh resumes where the reader
 * left off. The last answer adds up the scores, saves the result as earned,
 * and opens the result page.
 *
 * Options are shuffled, so the order never gives the scoring away. Moving
 * between questions slides the old one out and the new one in, in the
 * direction of travel, unless the reader prefers reduced motion.
 */
import { getQuestions, getQuiz, getResultIdForScore, NotFoundError } from './api.js';
import { saveEarnedResult } from './earned-result.js';
import { idParam, load, showEmpty, showLoader } from './page.js';

const quizId = idParam('quiz');
const storageKey = `broke-compass:quiz-${quizId}`;

const quizTitle = document.querySelector('[data-quiz-title]');
const form = document.querySelector('[data-quiz-form]');
const progressLabel = form.querySelector('[data-progress-label]');
const progress = form.querySelector('[data-progress]');
const question = form.querySelector('[data-question]');
const options = form.querySelector('[data-options]');
const fieldset = form.querySelector('fieldset');
const answerError = form.querySelector('[data-answer-error]');
const backButton = form.querySelector('[data-back]');
const nextButton = form.querySelector('[data-next]');

let questions = [];
let state = { step: 0, answers: {} }; // answers: question_id → option id
let moving = false; // true while one question is sliding out for the next

/* ---- Saved progress ---------------------------------------------------- */

function loadState() {
  try {
    const saved = JSON.parse(sessionStorage.getItem(storageKey));
    if (saved && saved.step >= 0 && saved.step < questions.length) return saved;
  } catch { /* storage blocked or corrupt: start fresh */ }
  return { step: 0, answers: {} };
}

function saveState() {
  try { sessionStorage.setItem(storageKey, JSON.stringify(state)); } catch { /* not essential */ }
}

function clearState() {
  try { sessionStorage.removeItem(storageKey); } catch { /* not essential */ }
}

/* ---- Rendering --------------------------------------------------------- */

function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function renderOption(option, checked) {
  const label = document.createElement('label');
  label.className = 'quiz-option';

  const input = document.createElement('input');
  input.type = 'radio';
  input.name = 'answer';
  input.value = option.id;
  input.checked = checked;

  const text = document.createElement('span');
  text.textContent = option.text;

  label.append(input, text);
  return label;
}

/** Draws the current step. Focus moves to the question on every step but the first load. */
function render({ moveFocus = true } = {}) {
  const current = questions[state.step];
  const number = state.step + 1;
  const isLast = number === questions.length;

  progressLabel.textContent = `Question ${number} of ${questions.length}`;
  progress.max = questions.length;
  progress.value = number;
  question.textContent = current.title;

  const chosen = state.answers[current.question_id];
  options.replaceChildren(...current.options.map((o) => renderOption(o, o.id === chosen)));

  answerError.hidden = true;
  backButton.hidden = state.step === 0;
  nextButton.textContent = isLast ? 'See my result' : 'Next question';

  if (moveFocus) question.focus();
}

function showAnswerError() {
  answerError.textContent = 'Pick an answer to continue. Even a broke compass points somewhere.';
  answerError.hidden = false;
  options.querySelector('input').focus();
}

/* ---- Moving between questions ----------------------------------------- */

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const SLIDE = 32; // px
const EASE = 'cubic-bezier(0.4, 0, 0.2, 1)';

/** Slides the question, then each option a beat after the last, in from the side it's coming from. */
function enterStep(direction) {
  const from = { opacity: 0, transform: `translateX(${direction * SLIDE}px)` };
  const to = { opacity: 1, transform: 'none' };
  const timing = { duration: 320, easing: EASE, fill: 'backwards' };

  question.animate([from, to], timing);
  [...options.children].forEach((option, i) => {
    option.animate([from, to], { ...timing, delay: 60 + i * 50 });
  });
}

async function goTo(step) {
  if (moving) return;

  if (!reduceMotion.matches) {
    moving = true;
    const direction = Math.sign(step - state.step);
    const exit = fieldset.animate(
      [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: `translateX(${-direction * SLIDE}px)` }],
      { duration: 160, easing: EASE, fill: 'forwards' },
    );
    await exit.finished;
    state.step = step;
    saveState();
    render();
    enterStep(direction);
    exit.cancel(); // hand the fieldset back; the entrance now holds its children
    moving = false;
    return;
  }

  state.step = step;
  saveState();
  render();
}

/* ---- Finishing --------------------------------------------------------- */

function chosenOption(q) {
  return q.options.find((o) => o.id === state.answers[q.question_id]);
}

async function finish() {
  // Only reachable with a stale save (the quiz changed mid-way).
  const unanswered = questions.findIndex((q) => !chosenOption(q));
  if (unanswered !== -1) {
    state.step = unanswered;
    render();
    showAnswerError();
    return;
  }

  // The loader stays up until the result page replaces this one.
  form.hidden = true;
  showLoader('Working out your result…');
  try {
    const score = questions.reduce((total, q) => total + chosenOption(q).score, 0);
    const resultId = await getResultIdForScore(quizId, score);
    saveEarnedResult(quizId, resultId);
    clearState();
    location.assign(`result.html?quiz=${quizId}`);
  } catch (error) {
    showEmpty(error, finish);
  }
}

/* ---- Events ------------------------------------------------------------ */

options.addEventListener('change', (event) => {
  state.answers[questions[state.step].question_id] = event.target.value;
  answerError.hidden = true;
  saveState();
});

backButton.addEventListener('click', () => goTo(state.step - 1));

form.addEventListener('submit', (event) => {
  event.preventDefault();
  if (moving) return;

  if (!chosenOption(questions[state.step])) {
    showAnswerError();
    return;
  }

  if (state.step < questions.length - 1) {
    goTo(state.step + 1);
    return;
  }

  finish();
});

/* ---- Start ------------------------------------------------------------- */

async function start() {
  if (!quizId) {
    throw new NotFoundError(
      "You've set off without a quiz, which is bold, even for us. " +
        'Pick one from the list of quizzes before it gets dark.',
    );
  }

  const [quiz, loaded] = await Promise.all([getQuiz(quizId), getQuestions(quizId)]);
  if (!loaded.length) {
    throw new NotFoundError(
      'This quiz packed its bags but left the questions at base camp. ' +
        'Pick another from the list of quizzes while we go back for them.',
    );
  }

  quizTitle.textContent = quiz.title;
  document.title = `${quiz.title} — Broke Compass`;

  questions = loaded.map((q) => ({ ...q, options: shuffle(q.options) }));
  state = loadState();

  form.hidden = false;
  render({ moveFocus: false });
}

load(start);
