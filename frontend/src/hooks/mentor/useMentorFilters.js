import { useState, useCallback } from 'react'
import { DEFAULT_TEACHER_FILTERS } from '@/constants'

/**
 * Manages teacher search/filter state.
 * Backend team: filters map 1-to-1 with query params sent to GET /teachers
 */
export function useMentorFilters(initialFilters = DEFAULT_TEACHER_FILTERS) {
  const [filters, setFilters] = useState(initialFilters)

  const setFilter = useCallback((key, value) => {
    setFilters((prev) => {
      if (key === 'major') {
        return {
          ...prev,
          major: value,
          subject: DEFAULT_TEACHER_FILTERS.subject,
        }
      }
      if (key === 'location' && value === DEFAULT_TEACHER_FILTERS.location) {
        return {
          ...prev,
          location: value,
          locationDistrict: '',
          locationCommune: '',
          locationVillage: '',
        }
      }
      return { ...prev, [key]: value }
    })
  }, [])

  const reset = useCallback(() => {
    setFilters(DEFAULT_TEACHER_FILTERS)
  }, [])

  return { filters, setFilter, setFilters, reset }
}

export default useMentorFilters
