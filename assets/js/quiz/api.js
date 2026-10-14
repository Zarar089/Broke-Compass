/**
 * Read-only access to the quiz data in Firebase Realtime Database, through
 * its REST API: no SDK, no keys, nothing to build.
 *
 * The database holds five collections, each keyed by id: quizzes, questions,
 * options, results and score_mappings. Every row carries a quiz_id, and each
 * collection is indexed on it (".indexOn" in the database rules), so one
 * quiz's rows come back from a single filtered request.
 *
 * Everything is cached in localStorage. Each quiz row carries last_updated
 * (ms since the epoch), so a page makes one request for the quiz list and
 * re-downloads only the quizzes whose cached copy is behind. If that request
 * fails, the cached copy is used as is.
 */

const DB_URL = 'https://broke-compass-default-rtdb.asia-southeast1.firebasedatabase.app';

/* Result images live in assets/images/; image_url is relative to that. */
const IMAGES_URL = new URL('../../images/', import.meta.url);

/** Data that isn't there (a bad id, an empty quiz). Retrying won't bring it back. */
export class NotFoundError extends Error {
  name = 'NotFoundError';
}

async function get(path, params = {}) {
  const url = new URL(`${DB_URL}/${path}.json`);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, JSON.stringify(value));
  }

  const response = await fetch(url).catch(() => {
    throw new Error(
      "We couldn't reach the quiz. Looks like you've hiked out of signal range. " +
        'Check your connection and try again.',
    );
  });
  if (!response.ok) {
    throw new Error(
      'The quiz tripped over a rock on its way here. ' +
        'Give it a moment to dust itself off, then try again.',
      // Kept for the console, not the reader.
      { cause: `HTTP ${response.status}` },
    );
  }
  return response.json();
}

/**
 * A collection comes back as an object keyed by id, or as an array with
 * holes when the ids are small integers. Either way, keep the rows and
 * give each one its id.
 */
function toRows(data) {
  return Object.entries(data ?? {})
    .filter(([, row]) => row)
    .map(([id, row]) => ({ id, ...row }));
}

async function getQuizRows(collection, quizId) {
  return toRows(await get(collection, { orderBy: 'quiz_id', equalTo: quizId }));
}

/* ---- Cache --------------------------------------------------------------- */

/* Bump the version when the cached shape changes, so old copies are ignored. */
const CACHE_KEY = 'broke-compass:quiz-library:v1';
const QUIZ_COLLECTIONS = ['questions', 'options', 'results', 'score_mappings'];

function readCache() {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY)) ?? {};
  } catch {
    return {}; // storage blocked or corrupt: start empty
  }
}

function writeCache(library) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(library));
  } catch {
    /* storage blocked or full: the next visit downloads again */
  }
}

/** One quiz's rows from every collection, as { questions, options, … }. */
async function fetchQuizRows(quizId) {
  const rows = await Promise.all(QUIZ_COLLECTIONS.map((collection) => getQuizRows(collection, quizId)));
  return Object.fromEntries(QUIZ_COLLECTIONS.map((collection, i) => [collection, rows[i]]));
}

/**
 * Every quiz with all of its rows, keyed by quiz_id. Quizzes the database no
 * longer lists drop out; the rest are re-downloaded only when the cached
 * copy is missing or older than the database's last_updated.
 */
async function syncLibrary() {
  const cached = readCache();

  let quizzes;
  try {
    quizzes = toRows(await get('quizzes'));
  } catch (error) {
    if (Object.keys(cached).length) return cached; // offline: carry on with what we have
    throw error;
  }

  const entries = await Promise.all(
    quizzes.map(async (quiz) => {
      const stored = cached[quiz.quiz_id];
      const upToDate = stored?.quiz.last_updated >= quiz.last_updated;
      const rows = upToDate ? stored : await fetchQuizRows(quiz.quiz_id);
      return [quiz.quiz_id, { ...rows, quiz }];
    }),
  );

  const library = Object.fromEntries(entries);
  writeCache(library);
  return library;
}

/* Synced once per page. A failed sync is forgotten, so Try again retries it. */
let libraryPromise = null;

function getLibrary() {
  libraryPromise ??= syncLibrary().catch((error) => {
    libraryPromise = null;
    throw error;
  });
  return libraryPromise;
}

async function getQuizEntry(quizId) {
  const entry = (await getLibrary())[quizId];
  if (!entry) {
    throw new NotFoundError(
      'This quiz got too invested in the trail and wandered off. Grab your flashlight and ' +
        'pick another from the list of quizzes before a bear finds it first.',
    );
  }
  return entry;
}

/* ---- Queries ------------------------------------------------------------- */

export async function listQuizzes() {
  const entries = Object.values(await getLibrary());
  return entries.map((entry) => entry.quiz).sort((a, b) => a.quiz_id - b.quiz_id);
}

export async function getQuiz(quizId) {
  return (await getQuizEntry(quizId)).quiz;
}

export async function getResult(resultId) {
  const entries = Object.values(await getLibrary());
  const result = entries
    .flatMap((entry) => entry.results)
    .find((row) => row.result_id === resultId);
  if (!result) {
    throw new NotFoundError(
      'This result went off to find itself and never came back. Probably got stuck working ' +
        'a 9 to 5. Take a quiz to find a new one.',
    );
  }
  return result;
}

/** The quiz's questions in order, each carrying its own options. */
export async function getQuestions(quizId) {
  const { questions, options } = await getQuizEntry(quizId);

  return [...questions]
    .sort((a, b) => a.question_id - b.question_id)
    .map((question) => ({
      ...question,
      options: options.filter((option) => option.question_id === question.question_id),
    }));
}

/** The result whose score band contains the given total. */
export async function getResultIdForScore(quizId, score) {
  const { score_mappings: bands } = await getQuizEntry(quizId);
  const band = bands.find((b) => score >= b.min_score && score <= b.max_score);
  if (!band) {
    throw new NotFoundError(
      "Your answers took a route even our map doesn't cover. " +
        'Take the quiz again and see where the trail leads this time.',
      // Kept for the console, not the reader.
      { cause: `No score band covers ${score}` },
    );
  }
  return band.result_id;
}

export function resultImageUrl(result) {
  return new URL(result.image_url, IMAGES_URL).href;
}
