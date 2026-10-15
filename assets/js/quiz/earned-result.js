/**
 * The result a reader earned by finishing a quiz, one per quiz, kept in
 * localStorage. The result page shows only a result saved here, never one
 * named in the URL, so it can't be reached without playing. Finishing the
 * quiz again replaces it.
 *
 * This keeps casual visitors out; it isn't a lock. The quiz data is public,
 * and anyone determined can write to their own localStorage.
 */

const key = (quizId) => `broke-compass:quiz-${quizId}-result`;

export function saveEarnedResult(quizId, resultId) {
  try {
    localStorage.setItem(key(quizId), String(resultId));
  } catch {
    throw new Error(
      "Your browser wouldn't let us jot down your result. " +
        'Allow this site to store data, then try again.',
    );
  }
}

/** The result id earned for this quiz, or null if it hasn't been played here. */
export function readEarnedResult(quizId) {
  try {
    const value = Number(localStorage.getItem(key(quizId)));
    return Number.isInteger(value) && value > 0 ? value : null;
  } catch {
    return null; // storage blocked: nothing earned
  }
}
