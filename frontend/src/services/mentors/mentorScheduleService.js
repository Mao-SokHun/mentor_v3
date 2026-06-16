import { getStoredUser, setStoredUser } from '@/lib/authStorage'
import { isApiEnabled } from '@/constants'
import { createSession, fetchSessions } from '../sessions/sessionService'
import { normalizeScheduleSlots } from '@/utils/timeRangeUtils'

/**
 * Weekly availability slots (UI shape).
 * @typedef {{ id: number|string, day: string, time: string, subject: string }} ScheduleSlot
 */

function mergeScheduleIntoSession(slots) {
  const stored = getStoredUser()
  if (!stored) return slots
  const next = { ...stored, schedule: slots }
  setStoredUser(next)
  return next
}

/** Read weekly slots from auth session (until mentor availability API exists). */
export function getTeacherWeeklySchedule(user) {
  return Array.isArray(user?.schedule) ? user.schedule : []
}

/**
 * Persist weekly availability. Uses session storage now; POST /sessions for one-off slots separately.
 */
export async function saveTeacherWeeklySchedule(slots) {
  const normalized = normalizeScheduleSlots(slots)
  mergeScheduleIntoSession(normalized)
  return normalized
}

/**
 * One-off “post schedule” for a specific date (teacher create-post flow).
 * Backend table may be `sessions` or `mentor_post` — payload uses mentor_id for API compatibility.
 */
export async function publishTeacherSessionSlot({ userId, subject, date, time, notes }) {
  const payload = {
    mentor_id: userId,
    user_id: userId,
    subject: subject?.trim(),
    session_date: date,
    time_slot: time,
    notes: notes?.trim() || '',
  }

  if (!isApiEnabled()) {
    return { ok: true, local: true, ...payload }
  }

  try {
    const result = await createSession(payload)
    return result ?? { ok: true, ...payload }
  } catch (err) {
    if (err?.status === 404 || err?.status === 405) {
      return { ok: true, local: true, ...payload }
    }
    throw err
  }
}

/** Sessions posted by the logged-in teacher (when GET /sessions exists). */
export async function fetchMyTeacherSessions(userId) {
  if (!isApiEnabled() || !userId) return []
  try {
    const rows = await fetchSessions()
    const list = Array.isArray(rows) ? rows : []
    return list.filter(
      (s) =>
        String(s.mentor_id ?? s.mentorId ?? s.user_id ?? s.mentorId ?? '') === String(userId)
    )
  } catch {
    return []
  }
}
