/**
 * Small helpers shared by the quiz pages, including the two states every
 * page passes through while it talks to the database:
 *
 *  - the loader ([data-quiz-loader]): the compass spinner, with a
 *    role="status" line saying what's loading;
 *  - the empty state ([data-quiz-empty]): "Lost the trail", shown when
 *    loading fails for any reason, with a Try again button for failures
 *    worth retrying.
 */
import { NotFoundError } from './api.js';

const loader = document.querySelector('[data-quiz-loader]');
const loaderLabel = loader.querySelector('[data-quiz-loader-label]');
const defaultLabel = loaderLabel.textContent;

const empty = document.querySelector('[data-quiz-empty]');
const emptyMessage = empty.querySelector('[data-quiz-empty-message]');
const retryButton = empty.querySelector('[data-quiz-retry]');

let retry = null;
retryButton.addEventListener('click', () => retry?.());

/** A positive integer from the query string, or null. */
export function idParam(name) {
  const value = Number(new URLSearchParams(location.search).get(name));
  return Number.isInteger(value) && value > 0 ? value : null;
}

export function showLoader(label = defaultLabel) {
  loaderLabel.textContent = label;
  empty.hidden = true;
  loader.hidden = false;
}

export function hideLoader() {
  loader.hidden = true;
}

/**
 * Swaps the loader for the empty state. Missing data (NotFoundError) won't
 * come back by retrying, so only other failures get a Try again button.
 */
export function showEmpty(error, retryWith) {
  console.error(error);
  retry = retryWith;
  retryButton.hidden = error instanceof NotFoundError || !retryWith;

  loader.hidden = true;
  empty.hidden = false;
  // Set after unhiding, so the role="alert" message is announced.
  emptyMessage.textContent = error.message;
}

/** Runs a page's loading step behind the loader, falling back to the empty state. */
export async function load(task) {
  showLoader();
  try {
    await task();
    hideLoader();
  } catch (error) {
    showEmpty(error, () => load(task));
  }
}
