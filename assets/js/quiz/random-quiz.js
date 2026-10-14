/**
 * The "Take a quiz" card in a post's sidebar. In the HTML it links to the
 * quiz hub; this swaps in a quiz picked at random. If the database can't be
 * reached, the card simply keeps pointing at the hub.
 */
import { listQuizzes } from './api.js';

const card = document.querySelector('[data-random-quiz]');

async function pickRandomQuiz() {
  const quizzes = await listQuizzes();
  if (!quizzes.length) return;

  const quiz = quizzes[Math.floor(Math.random() * quizzes.length)];
  // The hub link already points at quiz/, wherever this page sits.
  card.href = new URL(`play.html?quiz=${quiz.quiz_id}`, card.href).href;
  card.querySelector('[data-random-quiz-title]').textContent = quiz.title;
}

if (card) pickRandomQuiz().catch((error) => console.error(error));
