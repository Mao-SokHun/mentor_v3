import { apiRequest, apiFormRequest, isApiEnabled } from '../core/api'
import { ENDPOINTS } from '../core/endpoints'

/** GET /v1/users/me — shared profile (student or mentor) */
export async function fetchUserProfile() {
  if (!isApiEnabled()) return null
  const json = await apiRequest(ENDPOINTS.users.me)
  return json?.user ?? null
}

/** PUT /v1/users/me — shared profile fields */
export async function updateUserProfile(body) {
  if (!isApiEnabled()) return null
  return apiRequest(ENDPOINTS.users.me, {
    method: 'PUT',
    body: JSON.stringify(body),
  })
}

/** PUT /v1/users/me/profile-picture — Cloudinary avatar */
export async function uploadUserProfilePicture(file) {
  if (!isApiEnabled() || !file) return null
  const form = new FormData()
  form.append('profile_picture', file)
  const json = await apiFormRequest(ENDPOINTS.users.profilePicture, form, { method: 'PUT' })
  return json?.data ?? json
}
