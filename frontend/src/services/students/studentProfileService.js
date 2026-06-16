import { apiRequest, isApiEnabled } from '../core/api'
import { ENDPOINTS } from '../core/endpoints'
import { getStoredUser, setStoredUser } from '@/lib/authStorage'
import { studentApiRowToProfile, studentProfileToApiPayload } from '@/lib/studentApiMap'

function unwrapApiData(json) {
  return json?.data ?? json
}

function mergeStudentIntoStored(patch) {
  const stored = getStoredUser()
  if (!stored) return patch
  const next = { ...stored, ...patch }
  if (!next.name && next.firstName) {
    next.name = `${next.firstName} ${next.lastName ?? ''}`.trim()
  }
  setStoredUser(next)
  return next
}

/**
 * Save student profile. Calls PUT /v1/students/me when your backend exposes it;
 * otherwise merges into the auth session only.
 */
export async function saveStudentProfile(profile) {
  const patch = {
    firstName: profile.firstName,
    lastName: profile.lastName,
    name: profile.name,
    phone: profile.phone,
    bio: profile.bio,
    location: profile.location,
    province: profile.province ?? profile.location,
    learningFocus: profile.learningFocus,
    interests: profile.interests,
    goals: profile.goals,
  }

  if (!isApiEnabled()) {
    return mergeStudentIntoStored(patch)
  }

  const body = studentProfileToApiPayload(profile)

  try {
    const json = await apiRequest(ENDPOINTS.students.me, {
      method: 'PUT',
      body: JSON.stringify(body),
    })
    const row = unwrapApiData(json)
    return mergeStudentIntoStored({ ...patch, ...studentApiRowToProfile(row) })
  } catch (err) {
    if (err?.status === 404 || err?.status === 405) {
      return mergeStudentIntoStored(patch)
    }
    throw err
  }
}

/** Student onboarding modal → persist profile */
export async function saveStudentProfileFromOnboarding(profile) {
  return saveStudentProfile(profile)
}

/** GET /v1/students/me when available */
export async function fetchMyStudentProfile() {
  if (!isApiEnabled()) return null
  try {
    const json = await apiRequest(ENDPOINTS.students.me)
    return studentApiRowToProfile(unwrapApiData(json))
  } catch (err) {
    if (err?.status === 404) return null
    throw err
  }
}
