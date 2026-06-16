/** Profile fields persisted per user id — survives logout/login until backend stores them. */

const CACHE_KEY = 'rokkru_profile_by_user'

const PROFILE_FIELDS = [
  'firstName',
  'lastName',
  'name',
  'title',
  'phone',
  'gender',
  'experienceYears',
  'workOrganization',
  'workPosition',
  'experience',
  'major',
  'subject',
  'province',
  'bio',
  'location',
  'learningFocus',
  'interests',
  'goals',
  'schedule',
  'profileComplete',
]

function readAll() {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function writeAll(data) {
  if (typeof window === 'undefined') return
  localStorage.setItem(CACHE_KEY, JSON.stringify(data))
}

/** @param {string|number} userId */
export function loadProfileCache(userId) {
  if (!userId) return null
  const entry = readAll()[String(userId)]
  return entry && typeof entry === 'object' ? entry : null
}

/** @param {string|number} userId @param {Record<string, unknown>} patch */
export function saveProfileCache(userId, patch = {}) {
  if (!userId || !patch || typeof patch !== 'object') return
  const id = String(userId)
  const all = readAll()
  const prev = all[id] ?? {}
  const next = { ...prev }

  for (const key of PROFILE_FIELDS) {
    const value = patch[key]
    if (Array.isArray(value)) {
      next[key] = value
      continue
    }
    if (value != null && value !== '') {
      next[key] = value
    }
  }
  if (patch.profileComplete === true) {
    next.profileComplete = true
  }

  all[id] = next
  writeAll(all)
}

/** Merge cached profile into session user (after login / bootstrap). */
export function applyProfileCache(user) {
  if (!user?.id) return user
  const cached = loadProfileCache(user.id)
  if (!cached) return user

  const merged = { ...user, ...cached }
  if (!merged.name && merged.firstName) {
    merged.name = `${merged.firstName} ${merged.lastName ?? ''}`.trim()
  }
  return merged
}
