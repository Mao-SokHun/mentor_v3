import { apiRequest } from '../core/client'
import { ENDPOINTS } from '../core/endpoints'
import { isApiEnabled } from '@/constants'
import {
  helpFaqs as defaultHelpFaqs,
  helpCategories as defaultHelpCategories,
  termsSections as defaultTermsSections,
  privacySections as defaultPrivacySections,
} from '@/constants'

const STORAGE_KEY = 'rokkru_platform_content'

export const PLATFORM_CONTENT_DEFAULTS = {
  help: {
    faqs: defaultHelpFaqs,
    categories: defaultHelpCategories,
  },
  terms: {
    sections: defaultTermsSections,
  },
  privacy: {
    sections: defaultPrivacySections,
  },
}

function readStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function writeStorage(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    /* ignore */
  }
}

export function loadPlatformContent() {
  const stored = readStorage()
  return {
    help: {
      ...PLATFORM_CONTENT_DEFAULTS.help,
      ...(stored?.help ?? {}),
      faqs: stored?.help?.faqs ?? defaultHelpFaqs,
      categories: stored?.help?.categories ?? defaultHelpCategories,
    },
    terms: {
      ...PLATFORM_CONTENT_DEFAULTS.terms,
      ...(stored?.terms ?? {}),
      sections: stored?.terms?.sections ?? defaultTermsSections,
    },
    privacy: {
      ...PLATFORM_CONTENT_DEFAULTS.privacy,
      ...(stored?.privacy ?? {}),
      sections: stored?.privacy?.sections ?? defaultPrivacySections,
    },
    updatedAt: stored?.updatedAt ?? null,
  }
}

async function fetchFromApi(type) {
  const path = ENDPOINTS.platformContent?.[type]
  if (!path || !isApiEnabled()) return null
  try {
    const json = await apiRequest(path, { auth: false })
    return json?.data ?? json
  } catch {
    return null
  }
}

export async function hydratePlatformContent() {
  if (!isApiEnabled()) return loadPlatformContent()

  const [help, terms, privacy] = await Promise.all([
    fetchFromApi('help'),
    fetchFromApi('terms'),
    fetchFromApi('privacy'),
  ])

  const merged = loadPlatformContent()
  if (help?.faqs) merged.help = { ...merged.help, ...help }
  if (terms?.sections) merged.terms = { ...merged.terms, ...terms }
  if (privacy?.sections) merged.privacy = { ...merged.privacy, ...privacy }
  return merged
}

export async function savePlatformContent(type, payload) {
  const current = loadPlatformContent()
  const next = {
    ...current,
    [type]: { ...current[type], ...payload, updatedAt: new Date().toISOString() },
    updatedAt: new Date().toISOString(),
  }
  writeStorage(next)

  const path = ENDPOINTS.platformContent?.[type]
  if (path && isApiEnabled()) {
    try {
      await apiRequest(path, {
        method: 'PUT',
        body: JSON.stringify(payload),
      })
    } catch {
      /* UI saved locally until backend is ready */
    }
  }

  return next
}
