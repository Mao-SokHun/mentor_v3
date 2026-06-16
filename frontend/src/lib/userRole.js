/** Normalize backend/session role strings for frontend routing. */
export function normalizeAppRole(role) {
  const value = String(role ?? '').toLowerCase()
  if (value === 'teacher') return 'mentor'
  return value
}

/** True for mentor UI role or legacy backend `teacher` role. */
export function isMentorRole(role) {
  const value = String(role ?? '').toLowerCase()
  return value === 'mentor' || value === 'teacher'
}
