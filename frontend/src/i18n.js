/**
 * Single i18n entry point for the app.
 * Import hooks and helpers from here — not from lib/LanguageProvider or lib/i18n.
 *
 * @example
 * import { useTranslation, LanguageProvider, localizeOptionList } from '@/i18n'
 */
export { LanguageProvider, useLanguage, useTranslation, locales } from './lib/LanguageProvider.jsx'
export { useLocalizedFilterOptions, localizeOptionSet, localizeOptionList } from './lib/localizeOptions.js'
export { useMentorDisplay, useLocalizedMentor } from './lib/useMentorDisplay.js'
