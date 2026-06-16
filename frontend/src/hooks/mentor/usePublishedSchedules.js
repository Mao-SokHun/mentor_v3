import { useState, useEffect } from 'react'
import { isApiEnabled } from '@/constants'
import {
  fetchAllSkills,
  fetchPublishedSchedules,
  mapPublishedPostsToScheduleItems,
  resolveProvinceId,
  resolveSubSkillIdFromMajorSubject,
} from '@/services/mentors/mentorService'
import { filterMentors } from '@/utils/filterMentors'
import { FILTER_ALL } from '@/constants'

/**
 * Schedule page — only mentors with published schedule posts (GET /v1/mentors/posts).
 */
export function usePublishedSchedules(filters = {}, provinces = []) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(isApiEnabled())
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!isApiEnabled()) {
      setItems([])
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    const provinceId =
      filters.location && filters.location !== FILTER_ALL.location
        ? resolveProvinceId(filters.location, provinces)
        : null

    const loadSchedules = async () => {
      let subSkillId = null
      if (filters.subject && filters.subject !== FILTER_ALL.subject) {
        const parsed = parseInt(String(filters.subject), 10)
        if (!Number.isNaN(parsed) && parsed > 0) {
          subSkillId = parsed
        } else {
          const catalog = await fetchAllSkills()
          subSkillId = resolveSubSkillIdFromMajorSubject(
            filters.major,
            filters.subject,
            catalog
          )
        }
      }

      const posts = await fetchPublishedSchedules({
        status: 'published',
        provinceId: provinceId ?? undefined,
        subSkillId: subSkillId ?? undefined,
        limit: 200,
      })

      return mapPublishedPostsToScheduleItems(posts)
    }

    loadSchedules()
      .then((mapped) => {
        if (cancelled) return
        let rows = mapped

        if (filters.subject && filters.subject !== FILTER_ALL.subject) {
          rows = rows.filter(
            (row) =>
              row.mentor?.subject === filters.subject ||
              row.title === filters.subject
          )
        }
        if (filters.major && filters.major !== FILTER_ALL.major) {
          rows = rows.filter((row) => row.mentor?.major === filters.major)
        }
        if (filters.time && filters.time !== FILTER_ALL.time) {
          rows = rows.filter((row) => row.timeSlot?.includes(filters.time))
        }

        const mentors = rows.map((row) => row.mentor)
        const filteredMentors = filterMentors(mentors, filters)
        const allowedIds = new Set(filteredMentors.map((t) => t.id))
        rows = rows.filter((row) => allowedIds.has(row.mentor.id))

        setItems(rows)
      })
      .catch((err) => {
        if (cancelled) return
        setError(err)
        setItems([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [
    filters.major,
    filters.subject,
    filters.location,
    filters.time,
    filters.q,
    provinces.length,
  ])

  return { items, total: items.length, loading, error }
}

export default usePublishedSchedules
