import { apiRequest, isApiEnabled } from '../core/api'

const REVIEWS_KEY = 'rokkru_student_reviews'

function readLocalReviews() {
  try {
    const raw = localStorage.getItem(REVIEWS_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeLocalReviews(list) {
  try {
    localStorage.setItem(REVIEWS_KEY, JSON.stringify(list))
  } catch {
    /* ignore */
  }
}

/**
 * Submit session review. Calls POST /sessions/:id/review when backend exists;
 * otherwise stores locally until student API ships.
 */
export async function submitSessionReview(sessionId, payload) {
  const record = {
    sessionId,
    overall: payload.overall,
    aspectRatings: payload.aspectRatings ?? {},
    tags: payload.tags ?? [],
    reviewText: payload.reviewText ?? '',
    wouldBookAgain: payload.wouldBookAgain ?? null,
    submittedAt: new Date().toISOString(),
  }

  if (!isApiEnabled()) {
    writeLocalReviews([record, ...readLocalReviews()])
    return record
  }

  try {
    const json = await apiRequest(`/sessions/${encodeURIComponent(sessionId)}/review`, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    return json?.data ?? json ?? record
  } catch (err) {
    if (err?.status === 404 || err?.status === 405 || err?.status === 501) {
      writeLocalReviews([record, ...readLocalReviews()])
      return record
    }
    throw err
  }
}
