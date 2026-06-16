import { isApiEnabled } from '@/constants'
import { applyProfileCache, saveProfileCache } from '@/lib/profileCache'
import {
  clearAuthSession,
  COOKIE_SESSION_TOKEN,
  decodeJwtUserId,
  setAccessTokenCookie,
  setAuthSession,
  getStoredUser,
  setStoredUser,
} from '@/lib/authStorage'
import { requireApi } from '@/lib/requireApi'
import { apiRequest } from '../core/api'
import { ApiError } from '../core/apiErrors'
import { ENDPOINTS } from '../core/endpoints'

/** @type {Array<{ user_type_id: number, user_type_name: string }> | null} */
let userTypesCache = null

function roleFromUserTypeName(name) {
  const roleRaw = String(name ?? 'student').toLowerCase()
  return roleRaw === 'teacher' ? 'mentor' : roleRaw
}

function normalizeUser(raw) {
  if (!raw || typeof raw !== 'object') return null
  const role = roleFromUserTypeName(raw.role ?? raw.user_type_name ?? 'student')
  const id = String(raw.id ?? raw.user_id ?? '')
  if (!id) return null
  return {
    id,
    email: raw.email,
    role,
    name: raw.name ?? raw.email?.split('@')[0] ?? 'User',
  }
}

async function roleFromUserTypeId(userTypeId) {
  if (userTypeId == null) return 'student'
  await resolveUserTypeId('student')
  const match = userTypesCache.find(
    (type) => Number(type.user_type_id) === Number(userTypeId)
  )
  return roleFromUserTypeName(match?.user_type_name)
}

async function userFromAuthPayload(payload, { email, roleHint, accessToken } = {}) {
  const role =
    payload?.role != null || payload?.user_type_name != null
      ? roleFromUserTypeName(payload.role ?? payload.user_type_name)
      : payload?.user_type != null || payload?.user_type_id != null
        ? await roleFromUserTypeId(payload.user_type ?? payload.user_type_id)
        : roleHint ?? 'student'

  return normalizeUser({
    id: payload?.id ?? payload?.user_id ?? decodeJwtUserId(accessToken),
    email: payload?.email ?? email,
    role,
    name: payload?.name,
  })
}

function persistSession(user, token = COOKIE_SESSION_TOKEN) {
  if (token && token !== COOKIE_SESSION_TOKEN) {
    setAccessTokenCookie(token)
    setAuthSession({ token, user })
  } else {
    setAuthSession({ token: COOKIE_SESSION_TOKEN, user })
  }
  return user
}

async function fetchUserTypes() {
  const path = `${ENDPOINTS.userTypes.list}?_=${Date.now()}`
  const raw = await apiRequest(path, {
    auth: false,
    cache: 'no-store',
    headers: {
      'Cache-Control': 'no-cache',
      Pragma: 'no-cache',
    },
  })
  return Array.isArray(raw) ? raw : raw?.data ?? []
}

function findUserTypeId(types, role) {
  const wanted = role.toLowerCase()
  const match = types.find((type) => {
    const name = String(type.user_type_name ?? '').toLowerCase()
    if (wanted === 'mentor') return name === 'teacher' || name === 'mentor'
    return name === wanted
  })
  return match?.user_type_id ?? null
}

async function resolveUserTypeId(role = 'student') {
  userTypesCache = await fetchUserTypes()

  let userTypeId = findUserTypeId(userTypesCache, role)
  if (userTypeId != null) return userTypeId

  // Retry once — backend may have just seeded types on startup
  userTypesCache = await fetchUserTypes()
  userTypeId = findUserTypeId(userTypesCache, role)
  if (userTypeId != null) return userTypeId

  throw new Error(`Account type "${role}" is not configured on the server`)
}

/**
 * Step 1 of backend login — sends OTP to email.
 * @param {{ email?: string, password?: string }} credentials
 */
export async function requestLoginOtp(credentials = {}) {
  requireApi('Login')
  return apiRequest(ENDPOINTS.auth.login, {
    method: 'POST',
    auth: false,
    body: JSON.stringify({
      email: credentials.email,
      password: credentials.password,
    }),
  })
}

/**
 * Step 2 of backend login — verifies OTP and opens cookie session.
 * @param {{ email: string, otp: string }} data
 */
export async function verifyLoginOtp({ email, otp }) {
  requireApi('Login')
  const json = await apiRequest(ENDPOINTS.auth.verifyLoginOtp, {
    method: 'POST',
    auth: false,
    body: JSON.stringify({ email, otp }),
  })

  const accessToken = json?.accessToken ?? json?.access_token ?? null
  const payload = json?.user ?? json?.data?.user
  if (!accessToken) {
    throw new ApiError('Login succeeded but no access token was returned', 500)
  }

  const user = await userFromAuthPayload(payload, { email, accessToken })
  if (!user) {
    throw new ApiError('Login succeeded but user profile is incomplete', 500)
  }

  persistSession(user, accessToken)

  try {
    const fresh = await fetchCurrentUser()
    return fresh ?? user
  } catch {
    return user
  }
}

/** Starts OTP login; completes via verifyLoginOtp. */
export async function login(credentials = {}) {
  requireApi('Login')
  await requestLoginOtp(credentials)
  throw new Error('OTP_REQUIRED')
}

/**
 * @param {{ email: string, password: string, role?: string, name?: string }} data
 */
export async function register(data) {
  requireApi('Registration')
  const role = data.role || 'student'
  const user_type = await resolveUserTypeId(role)
  const json = await apiRequest(ENDPOINTS.auth.register, {
    method: 'POST',
    auth: false,
    body: JSON.stringify({
      email: data.email,
      password: data.password,
      user_type,
    }),
  })

  const accessToken = json?.accessToken ?? json?.access_token ?? null
  if (!accessToken) {
    throw new ApiError('Registration succeeded but no access token was returned', 500)
  }

  const user = normalizeUser({
    id: decodeJwtUserId(accessToken),
    email: data.email,
    role,
    name: data.name,
  })
  if (!user) {
    throw new ApiError('Registration succeeded but user profile is incomplete', 500)
  }

  persistSession(user, accessToken)

  try {
    const fresh = await fetchCurrentUser()
    return fresh ?? user
  } catch {
    return user
  }
}

function mergeStoredProfile(user, stored) {
  if (!user || !stored) return user

  const fields = [
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
  const merged = { ...user }
  let hasProfile = false

  for (const key of fields) {
    if (stored[key] != null && stored[key] !== '') {
      merged[key] = stored[key]
      hasProfile = true
    }
  }

  if (!hasProfile) return user
  if (!merged.name && merged.firstName) {
    merged.name = `${merged.firstName} ${merged.lastName ?? ''}`.trim()
  }
  return merged
}

export async function fetchCurrentUser() {
  if (!isApiEnabled()) return getStoredUser()
  const json = await apiRequest(ENDPOINTS.auth.me, { skipAuthRedirect: true })
  const stored = getStoredUser()
  let user = mergeStoredProfile(
    normalizeUser(json.user ?? json.data ?? json),
    stored
  )
  if (user) {
    user = applyProfileCache(user)
    setStoredUser(user)
    saveProfileCache(user.id, user)
  }
  return user
}

export async function logout() {
  if (isApiEnabled()) {
    try {
      await apiRequest(ENDPOINTS.auth.logout, { method: 'POST' })
    } catch {
      /* ignore */
    }
  }
  clearAuthSession()
}

/**
 * Delete current account after password confirmation.
 * Backend expects body: { user_id, password }.
 * @param {{ userId: string | number, password: string }} payload
 */
export async function deleteAccountWithPassword({ userId, password }) {
  const user_id = String(userId ?? '').trim()
  const cleanedPassword = String(password ?? '').trim()

  if (!user_id) {
    throw new Error('DELETE_ACCOUNT_USER_NOT_FOUND')
  }
  if (!cleanedPassword) {
    throw new Error('DELETE_ACCOUNT_PASSWORD_REQUIRED')
  }

  if (!isApiEnabled()) {
    clearAuthSession()
    return { ok: true }
  }

  try {
    return await apiRequest(ENDPOINTS.auth.deleteAccount, {
      method: 'DELETE',
      body: JSON.stringify({ user_id, password: cleanedPassword }),
    })
  } catch (err) {
    if (err?.status === 404) {
      throw new Error('DELETE_ACCOUNT_ENDPOINT_UNAVAILABLE')
    }
    if (err?.status === 400 || err?.status === 401) {
      throw new Error('DELETE_ACCOUNT_PASSWORD_INCORRECT')
    }
    throw err
  }
}

export async function sendPasswordResetOtp(email) {
  requireApi('Password reset')
  return apiRequest(ENDPOINTS.auth.forgotPassword, {
    method: 'POST',
    auth: false,
    body: JSON.stringify({ email }),
  })
}

export async function verifyPasswordResetOtp(email, otp) {
  requireApi('Password reset')
  return apiRequest(ENDPOINTS.auth.verifyResetOtp, {
    method: 'POST',
    auth: false,
    body: JSON.stringify({ email, otp }),
  })
}

/**
 * Logged-in password change — POST /api/auth/reset-password (cookie session).
 * @param {{ oldPassword: string, newPassword: string }} payload
 */
export async function changePassword({ oldPassword, newPassword }) {
  const current = String(oldPassword ?? '').trim()
  const next = String(newPassword ?? '')

  if (!current || !next) {
    throw new Error('CHANGE_PASSWORD_VALIDATION')
  }

  if (!isApiEnabled()) {
    throw new Error('CHANGE_PASSWORD_API_DISABLED')
  }

  try {
    return await apiRequest(ENDPOINTS.auth.resetPassword, {
      method: 'POST',
      skipAuthRedirect: true,
      body: JSON.stringify({
        oldPassword: current,
        newPassword: next,
      }),
    })
  } catch (err) {
    const status = err instanceof ApiError ? err.status : err?.status
    const msg = String(err?.message || '').toLowerCase()

    if (status === 401) {
      throw new Error('CHANGE_PASSWORD_UNAUTHORIZED')
    }
    if (status === 400 && msg.includes('old password')) {
      throw new Error('CHANGE_PASSWORD_OLD_INCORRECT')
    }
    throw new Error('CHANGE_PASSWORD_FAILED')
  }
}

export async function resetPasswordWithOtp({ email, otp, password }) {
  requireApi('Password reset')
  return apiRequest(ENDPOINTS.auth.setNewPassword, {
    method: 'POST',
    auth: false,
    body: JSON.stringify({ email, newPassword: password }),
  })
}
