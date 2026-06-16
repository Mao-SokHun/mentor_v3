import { getApiBaseUrl } from '@/constants'

/** Resolve mentor profile_picture (full URL, path, or data URL) for <img src>. */
export function resolveProfilePictureUrl(url) {
  const raw = String(url ?? '').trim()
  if (!raw) return null
  if (/^(https?:|data:|blob:)/i.test(raw)) return raw
  if (raw.startsWith('/')) {
    const apiBase = getApiBaseUrl().replace(/\/api\/?$/, '')
    return `${apiBase}${raw}`
  }
  return raw
}
