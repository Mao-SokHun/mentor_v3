import { useState, useEffect, useRef } from 'react'
import { fetchMentors } from '@/services/mentors/mentorService'

/**
 * Fetches all registered mentors for Home (paginates API until complete).
 * Pass { page, pageSize } together to load a single page (e.g. Landing preview).
 */
export function useMentors(filters = {}) {
  const [mentors, setMentors] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const abortRef = useRef(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    fetchMentors(filters)
      .then((result) => {
        if (cancelled) return
        setMentors(result.items)
        setTotal(result.total)
      })
      .catch((err) => {
        if (cancelled) return
        setError(err)
        setMentors([])
        setTotal(0)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [
    filters.q,
    filters.skillId,
    filters.subSkillId,
    filters.minExperience,
    filters.major,
    filters.subject,
    filters.location,
    filters.sort,
    filters.type,
    filters.time,
    filters.page,
    filters.pageSize,
    filters.sort,
  ])

  return { mentors, total, loading, error }
}

export default useMentors
