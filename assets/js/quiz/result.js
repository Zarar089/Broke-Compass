/**
 * Shows the result the reader earned on a quiz (result.html?quiz=N) and turns
 * it into a postcard to download or share. The result comes from the reader's
 * own play-through (earned-result.js), not the URL, so the page shows nothing
 * until the quiz has been played. Shared links point at the quiz instead.
 */
import { getQuiz, getResult, NotFoundError, resultImageUrl } from './api.js';
import { readEarnedResult } from './earned-result.js';
import { idParam, load } from './page.js';
import { renderPostcard } from './postcard.js';

const quizId = idParam('quiz');
const quizUrl = new URL(`play.html?quiz=${quizId}`, location.href).href;

const article = document.querySelector('[data-result]');
const kicker = article.querySelector('[data-result-kicker]');
const title = article.querySelector('[data-result-title]');
const description = article.querySelector('[data-result-description]');
const image = article.querySelector('[data-result-image]');
const retake = article.querySelector('[data-retake]');

const postcard = document.querySelector('[data-postcard]');
const preview = postcard.querySelector('[data-postcard-preview]');
const download = postcard.querySelector('[data-postcard-download]');
const shareButton = postcard.querySelector('[data-postcard-share]');
const copyButton = postcard.querySelector('[data-copy-link]');
const actionStatus = postcard.querySelector('[data-action-status]');

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function announce(message) {
  actionStatus.textContent = message;
}

async function preparePostcard(quiz, result) {
  const blob = await renderPostcard({
    kicker: quiz.title,
    title: result.title,
    description: result.description,
    imageUrl: resultImageUrl(result),
  });
  const fileName = `broke-compass-${slugify(result.title)}.jpg`;
  const blobUrl = URL.createObjectURL(blob);

  preview.src = blobUrl;
  preview.alt = `Postcard of your result, ${result.title}: the illustration, with the description written beneath it.`;
  download.href = blobUrl;
  download.download = fileName;

  // The share sheet (Instagram, WhatsApp, …) where the device supports files.
  const file = new File([blob], fileName, { type: blob.type });
  if (navigator.canShare?.({ files: [file] })) {
    shareButton.hidden = false;
    shareButton.addEventListener('click', () => {
      navigator
        .share({ files: [file], title: result.title, text: `${quiz.title} I'm ${result.title}. ${quizUrl}` })
        .catch((error) => {
          if (error.name === 'AbortError') return;
          announce('Sharing got stuck at the trailhead. Download the postcard instead; it travels light.');
        });
    });
  }

  postcard.hidden = false;
}

copyButton.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(quizUrl);
    announce('Quiz link copied.');
  } catch {
    announce(`The link slipped through our fingers. Here it is to copy by hand: ${quizUrl}`);
  }
});

async function start() {
  if (!quizId) {
    throw new NotFoundError("There's no result here, just an empty campsite. Take a quiz to pitch one.");
  }

  const resultId = readEarnedResult(quizId);
  if (!resultId) {
    throw new NotFoundError(
      "No peeking at the summit before the climb. Results are earned on the trail, " +
        'so take the quiz to find yours.',
    );
  }

  const [result, quiz] = await Promise.all([getResult(resultId), getQuiz(quizId)]);

  kicker.textContent = quiz.title;
  title.textContent = result.title;
  description.textContent = result.description;
  image.src = resultImageUrl(result);
  image.alt = `Illustration for ${result.title}.`;
  retake.href = quizUrl;
  document.title = `${result.title} — ${quiz.title} — Broke Compass`;

  article.hidden = false;

  // The result is up; the postcard draws in the background.
  preparePostcard(quiz, result).catch((error) => {
    console.error(error);
    preview.hidden = true;
    download.hidden = true;
    announce(
      'The postcard got caught in the rain before we could finish it. ' +
        'Refresh the page to try again.',
    );
    postcard.hidden = false;
  });
}

load(start);
