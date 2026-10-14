/**
 * The quiz hub (quiz/index.html): one card per quiz in the database, each
 * linking to its play page. Cards are built from the <template> in the page,
 * so the markup stays in the HTML.
 */
import { listQuizzes, NotFoundError } from './api.js';
import { load } from './page.js';

const list = document.querySelector('[data-quiz-list]');
const template = document.querySelector('[data-quiz-card]');

function renderCard(quiz) {
  const card = template.content.cloneNode(true);
  card.querySelector('a').href = `play.html?quiz=${quiz.quiz_id}`;
  card.querySelector('[data-card-title]').textContent = quiz.title;
  return card;
}

async function start() {
  const quizzes = await listQuizzes();
  if (!quizzes.length) {
    throw new NotFoundError(
      'Every quiz is out on the trail right now, probably taking selfies at a viewpoint. ' +
        'Check back soon.',
    );
  }

  list.replaceChildren(...quizzes.map(renderCard));
  list.hidden = false;
}

load(start);
