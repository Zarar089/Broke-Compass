/**
 * Read-only access to the quiz data in Firebase Realtime Database, through
 * its REST API: no SDK, no keys, nothing to build.
 *
 * The database holds five collections, each keyed by id: quizzes, questions,
 * options, results and score_mappings. Every row carries a quiz_id, and each
 * collection is indexed on it (".indexOn" in the database rules), so one
 * quiz's rows come back from a single filtered request.
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

async function getRecord(path, notFoundMessage) {
  const record = await get(path);
  if (!record) throw new NotFoundError(notFoundMessage);
  return record;
}

export async function listQuizzes() {
  const quizzes = toRows(await get('quizzes'));
  return quizzes.sort((a, b) => a.quiz_id - b.quiz_id);
}

export function getQuiz(quizId) {
  return getRecord(
    `quizzes/${quizId}`,
    'This quiz got too invested in the trail and wandered off. Grab your flashlight and ' +
      'pick another from the list of quizzes before a bear finds it first.',
  );
}

export function getResult(resultId) {
  return getRecord(
    `results/${resultId}`,
    'This result went off to find itself and never came back. Probably got stuck working ' +
      'a 9 to 5. Take a quiz to find a new one.',
  );
}

/** The quiz's questions in order, each carrying its own options. */
export async function getQuestions(quizId) {
  const [questions, options] = await Promise.all([
    getQuizRows('questions', quizId),
    getQuizRows('options', quizId),
  ]);

  return questions
    .sort((a, b) => a.question_id - b.question_id)
    .map((question) => ({
      ...question,
      options: options.filter((option) => option.question_id === question.question_id),
    }));
}

/** The result whose score band contains the given total. */
export async function getResultIdForScore(quizId, score) {
  const bands = await getQuizRows('score_mappings', quizId);
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
