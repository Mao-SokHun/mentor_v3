/** @returns {boolean} True when frontend should call the real backend */
export function isApiEnabled() {
  const url = import.meta.env.VITE_API_URL
  return typeof url === 'string' && url.trim().length > 0
}

export function getApiBaseUrl() {
  const configured = (import.meta.env.VITE_API_URL ?? '').trim()
  if (configured) return configured.replace(/\/$/, '')
  if (import.meta.env.DEV) return '/api'
  return ''
}