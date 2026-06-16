/** JWT + user session keys — keep in sync with backend auth responses */
export const AUTH_TOKEN_KEY = 'rokkru_token'
export const AUTH_USER_KEY = 'rokkru_user'
/** Placeholder when session lives in httpOnly cookie (backend auth) */
export const COOKIE_SESSION_TOKEN = 'cookie-session'

/** Backend `protect` middleware reads this cookie name (not refreshToken / Bearer alone). */
export const ACCESS_TOKEN_COOKIE = 'token'
const ACCESS_TOKEN_MAX_AGE_SEC = 2 * 60 * 60

/** @param {string} token */
export function setAccessTokenCookie(token) {
  if (typeof document === 'undefined' || !token) return
  const secure = window.location.protocol === 'https:'
  document.cookie = `${ACCESS_TOKEN_COOKIE}=${token}; path=/; max-age=${ACCESS_TOKEN_MAX_AGE_SEC}; SameSite=Strict${secure ? '; Secure' : ''}`
}

export function clearAccessTokenCookie() {
  if (typeof document === 'undefined') return
  document.cookie = `${ACCESS_TOKEN_COOKIE}=; path=/; max-age=0; SameSite=Strict`
}

/** Read `user_id` from JWT payload (client-side decode only). */
export function decodeJwtUserId(token) {
  if (!token || typeof token !== 'string') return null
  try {
    const payload = token.split('.')[1]
    if (!payload) return null
    const json = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
    const id = json?.user_id ?? json?.id
    return id != null ? String(id) : null
  } catch {
    return null
  }
}

export function getToken() {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(AUTH_TOKEN_KEY)
}

export function setToken(token) {
  if (typeof window === 'undefined' || !token) return
  localStorage.setItem(AUTH_TOKEN_KEY, token)
}

export function getStoredUser() {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function setStoredUser(user) {
  if (typeof window === 'undefined') return
  if (user) localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user))
  else localStorage.removeItem(AUTH_USER_KEY)
}

/** @param {{ token?: string, user?: object }} session */
export function setAuthSession({ token, user }) {
  if (token) setToken(token)
  if (user) setStoredUser(user)
}

export function clearAuthSession() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(AUTH_TOKEN_KEY)
  localStorage.removeItem(AUTH_USER_KEY)
  clearAccessTokenCookie()
}

export function isAuthenticated() {
  const token = getToken()
  const user = getStoredUser()
  if (token === COOKIE_SESSION_TOKEN) return Boolean(user)
  return Boolean(token && user)
}
