import { useMemo } from 'react'
import { useTranslation } from './LanguageProvider.jsx'
import { localizeMentor } from '@/utils/mentorMapper'

export function useLocalizedMentor(mentor) {
  const { lang } = useTranslation()
  return useMemo(() => localizeMentor(mentor, lang), [mentor, lang])
}

export function useMentorDisplay(mentor) {
  const { labelFor, t, lang } = useTranslation()
  const localized = useLocalizedMentor(mentor)

  return useMemo(() => {
    if (!localized) return null

    return {
      title: localized.title ?? '',
      bio: localized.bio ?? '',
      major: localized.major ?? '',
      location: localized.location ?? '',
      subjects: localized.subjects ?? [],
      experienceLabel: t('mentorCard.yearsExp', { count: localized.experience ?? 0 }),
    }
  }, [localized, labelFor, t, lang])
}
