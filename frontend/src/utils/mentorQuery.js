import { FILTER_ALL } from '@/constants'

/** Map UI filters → mentor controller query params (buildListQuery) */
export function toMentorQueryParams(filters = {}) {
  const params = {}

  // Backend supports: page, limit, q, skillId, subSkillId, minExperience
  if (filters.page) params.page = String(filters.page)
  if (filters.pageSize) params.limit = String(filters.pageSize)
  if (filters.q?.trim()) params.q = filters.q.trim()
  if (filters.skillId != null) params.skillId = String(filters.skillId)
  if (filters.subSkillId != null) params.subSkillId = String(filters.subSkillId)
  if (filters.minExperience != null) params.minExperience = String(filters.minExperience)
  const location = filters.location?.trim()
  if (location && location !== FILTER_ALL.location) {
    params.location = location
  }

  // major/subject/sort — applied client-side after mapMentorToListItem
  return params
}

export function buildQueryString(params) {
  const q = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') q.set(k, String(v))
  })
  const s = q.toString()
  return s ? `?${s}` : ''
}
