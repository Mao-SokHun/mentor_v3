import { getApiBaseUrl as getBaseUrl, isApiEnabled } from '@/constants'
import { getToken, setAccessTokenCookie } from '@/lib/authStorage'
import { ApiError } from './apiErrors'

/** @type {(() => void) | null} */
let onUnauthorized = null

/** Called on 401 — wire in AuthProvider to clear session */
export function registerUnauthorizedHandler(handler) {
  onUnauthorized = handler
}

async function parseErrorBody(res) {
  try {
    return await res.json()
  } catch {
    return {}
  }
}

/**
 * @param {string} path — e.g. `/v1/mentors`
 * @param {RequestInit & { auth?: boolean }} [init] — set auth:false to skip JWT header
 */
export async function apiRequest(path, init = {}) {
  const { auth = true, skipAuthRedirect = false, ...fetchInit } = init
  const base = getBaseUrl()
  const url = `${base}${path.startsWith('/') ? path : `/${path}`}`

  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...(fetchInit.headers &&
    typeof fetchInit.headers === 'object' &&
    !(fetchInit.headers instanceof Headers)
      ? fetchInit.headers
      : {}),
  }

  if (auth) {
    const token = getToken()
    if (token && token !== 'cookie-session') {
      setAccessTokenCookie(token)
      headers.Authorization = `Bearer ${token}`
    }
  }

  const res = await fetch(url, {
    ...fetchInit,
    headers,
    credentials: isApiEnabled() ? 'include' : 'same-origin',
  })

  if (!res.ok) {
    const body = await parseErrorBody(res)
    const message = body.message ?? body.error ?? res.statusText

    if (res.status === 401 && onUnauthorized && !skipAuthRedirect) {
      onUnauthorized()
    }

    throw new ApiError(message, res.status, body)
  }

  if (res.status === 204) return null
  return res.json()
}

/** Multipart upload — do not set Content-Type (browser sets boundary). */
export async function apiFormRequest(path, formData, init = {}) {
  const { auth = true, skipAuthRedirect = false, method = 'POST', ...fetchInit } = init
  const base = getBaseUrl()
  const url = `${base}${path.startsWith('/') ? path : `/${path}`}`

  const headers = {
    Accept: 'application/json',
    ...(fetchInit.headers &&
    typeof fetchInit.headers === 'object' &&
    !(fetchInit.headers instanceof Headers)
      ? fetchInit.headers
      : {}),
  }

  if (auth) {
    const token = getToken()
    if (token && token !== 'cookie-session') {
      setAccessTokenCookie(token)
      headers.Authorization = `Bearer ${token}`
    }
  }

  const res = await fetch(url, {
    ...fetchInit,
    method,
    headers,
    body: formData,
    credentials: isApiEnabled() ? 'include' : 'same-origin',
  })

  if (!res.ok) {
    const body = await parseErrorBody(res)
    const message = body.message ?? body.error ?? res.statusText
    if (res.status === 401 && onUnauthorized && !skipAuthRedirect) {
      onUnauthorized()
    }
    throw new ApiError(message, res.status, body)
  }

  if (res.status === 204) return null
  return res.json()
}

export { isApiEnabled, getBaseUrl as getApiBaseUrl, ApiError }
