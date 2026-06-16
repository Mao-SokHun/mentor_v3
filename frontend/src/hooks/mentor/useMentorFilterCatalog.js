import { useEffect, useMemo, useState } from 'react'
import { DEFAULT_FILTER_OPTION_SET } from '@/constants'
import { isApiEnabled } from '@/constants'
import { useTranslation } from '@/i18n'
import { localizeOptionSet } from '@/lib/localizeOptions'
import { fetchMentorCatalog } from '@/services/mentors/mentorService'
import { buildMentorFilterOptionSet } from '@/utils/mentorFilterOptions'

/**
 * Loads mentor browse filter options (provinces + skill/sub_skill catalog) from the API.
 * Falls back to static lists when API is disabled or fetch fails.
 */
export function useMentorFilterCatalog() {
  const { labelFor, lang } = useTranslation()
  const [skillsCatalog, setSkillsCatalog] = useState([])
  const [provinces, setProvinces] = useState([])
  const [loading, setLoading] = useState(isApiEnabled())

  useEffect(() => {
    if (!isApiEnabled()) {
      setSkillsCatalog([])
      setProvinces([])
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)

    fetchMentorCatalog()
      .then(({ skills, provinces }) => {
        if (cancelled) return
        setSkillsCatalog(Array.isArray(skills) ? skills : [])
        setProvinces(Array.isArray(provinces) ? provinces : [])
      })
      .catch(() => {
        if (!cancelled) {
          setSkillsCatalog([])
          setProvinces([])
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const optionSet = useMemo(
    () =>
      skillsCatalog.length || provinces.length
        ? buildMentorFilterOptionSet(skillsCatalog, provinces, lang)
        : DEFAULT_FILTER_OPTION_SET,
    [skillsCatalog, provinces, lang]
  )

  const options = useMemo(() => localizeOptionSet(optionSet, labelFor), [optionSet, labelFor])

  const fromDatabase = skillsCatalog.length > 0 || provinces.length > 0

  return {
    options,
    optionSet,
    skillsCatalog,
    provinces,
    loading,
    fromDatabase,
  }
}

export default useMentorFilterCatalog
