import { createSession } from '../sessions/sessionService'
import { isApiEnabled } from '../core/api'

const BOOKINGS_KEY = 'rokkru_student_bookings'

function readLocalBookings() {
  try {
    const raw = localStorage.getItem(BOOKINGS_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeLocalBookings(list) {
  try {
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(list))
  } catch {
    /* ignore quota errors */
  }
}

function buildBookingRecord(payload) {
  const id = `local-${Date.now()}`
  return {
    id,
    mentorId: payload.mentorId,
    mentorName: payload.mentorName ?? '',
    topic: payload.topic ?? '',
    topicLabel: payload.topicLabel ?? '',
    sessionDate: payload.sessionDate ?? '',
    sessionTime: payload.sessionTime ?? '',
    durationMinutes: payload.durationMinutes ?? 60,
    totalPaid: payload.totalPaid ?? 0,
    notes: payload.notes ?? '',
    status: 'confirmed',
    createdAt: new Date().toISOString(),
  }
}

/**
 * Book a session. Calls POST /sessions when backend exists;
 * otherwise persists to localStorage for demo / until student API ships.
 */
export async function bookSession(payload) {
  const booking = buildBookingRecord(payload)

  if (!isApiEnabled()) {
    const list = readLocalBookings()
    writeLocalBookings([booking, ...list])
    return booking
  }

  try {
    const json = await createSession({
      mentor_id: payload.mentorId,
      topic: payload.topicLabel ?? payload.topic,
      session_date: payload.sessionDate,
      session_time: payload.sessionTime,
      duration_minutes: payload.durationMinutes,
      notes: payload.notes,
      total_paid: payload.totalPaid,
    })
    const row = json?.data ?? json
    if (row?.id) {
      return { ...booking, id: String(row.id), source: 'api' }
    }
    const list = readLocalBookings()
    writeLocalBookings([booking, ...list])
    return booking
  } catch (err) {
    if (err?.status === 404 || err?.status === 405 || err?.status === 501) {
      const list = readLocalBookings()
      writeLocalBookings([booking, ...list])
      return booking
    }
    throw err
  }
}

export function fetchMyBookings() {
  return readLocalBookings()
}

export function getBookingById(sessionId) {
  if (!sessionId) return null
  return readLocalBookings().find((b) => String(b.id) === String(sessionId)) ?? null
}
