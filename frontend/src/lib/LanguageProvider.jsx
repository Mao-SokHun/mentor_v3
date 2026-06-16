import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import en from './localeEn'
import km from './localeKm'
import kmOptionLabels from './kmOptionLabels'

const STORAGE_KEY = 'rokkru_lang'

export const locales = { en, km }

const LanguageContext = createContext(null)

function getNested(obj, path) {
  return path.split('.').reduce((acc, key) => (acc != null ? acc[key] : undefined), obj)
}

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    if (typeof window === 'undefined') return 'km'
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved === 'km' || saved === 'en' ? saved : 'km'
  })

  const setLang = useCallback((next) => {
    setLangState(next === 'km' ? 'km' : 'en')
  }, [])

  useEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.dataset.lang = lang
    localStorage.setItem(STORAGE_KEY, lang)
  }, [lang])

  const t = useCallback(
    (key, varsOrFallback) => {
      let value = getNested(locales[lang], key)
      if (value == null) value = getNested(locales.en, key)
      if (value == null) {
        return typeof varsOrFallback === 'string' ? varsOrFallback : key
      }
      if (varsOrFallback && typeof varsOrFallback === 'object' && !Array.isArray(varsOrFallback)) {
        if (typeof value === 'string') {
          return Object.entries(varsOrFallback).reduce(
            (s, [k, v]) => s.replaceAll(`{{${k}}}`, String(v)),
            value
          )
        }
      }
      return value
    },
    [lang]
  )

  const labelFor = useCallback(
    (value) => {
      if (lang === 'km' && kmOptionLabels[value]) return kmOptionLabels[value]
      return value
    },
    [lang]
  )

  const value = useMemo(
    () => ({ lang, setLang, t, labelFor, isKhmer: lang === 'km' }),
    [lang, setLang, t, labelFor]
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used inside LanguageProvider')
  return ctx
}

export function useTranslation() {
  const { t, lang, setLang, labelFor, isKhmer } = useLanguage()
  return { t, lang, setLang, labelFor, isKhmer }
}
