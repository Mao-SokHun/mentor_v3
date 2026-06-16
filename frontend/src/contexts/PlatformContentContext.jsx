import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import {
  hydratePlatformContent,
  loadPlatformContent,
  savePlatformContent,
} from '@/services/platform/platformContentService'

const PlatformContentContext = createContext(null)

export function PlatformContentProvider({ children }) {
  const [content, setContent] = useState(loadPlatformContent)
  const [saving, setSaving] = useState(null)
  const [savedAt, setSavedAt] = useState(null)

  useEffect(() => {
    let cancelled = false
    hydratePlatformContent().then((data) => {
      if (!cancelled) setContent(data)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const persist = useCallback(async (type, payload) => {
    setSaving(type)
    try {
      const next = await savePlatformContent(type, payload)
      setContent(next)
      setSavedAt(Date.now())
      return true
    } finally {
      setSaving(null)
    }
  }, [])

  const value = useMemo(
    () => ({
      content,
      saving,
      savedAt,
      saveHelp: (payload) => persist('help', payload),
      saveTerms: (payload) => persist('terms', payload),
      savePrivacy: (payload) => persist('privacy', payload),
    }),
    [content, saving, savedAt, persist]
  )

  return (
    <PlatformContentContext.Provider value={value}>
      {children}
    </PlatformContentContext.Provider>
  )
}

export function usePlatformContent() {
  const ctx = useContext(PlatformContentContext)
  if (!ctx) {
    throw new Error('usePlatformContent must be used within PlatformContentProvider')
  }

  return {
    helpFaqs: ctx.content.help.faqs,
    helpCategories: ctx.content.help.categories,
    termsSections: ctx.content.terms.sections,
    privacySections: ctx.content.privacy.sections,
    updatedAt: ctx.content.updatedAt,
    saving: ctx.saving,
    savedAt: ctx.savedAt,
    saveHelp: ctx.saveHelp,
    saveTerms: ctx.saveTerms,
    savePrivacy: ctx.savePrivacy,
  }
}
