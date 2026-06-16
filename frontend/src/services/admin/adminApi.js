import { apiRequest } from '../core/client'
import { ENDPOINTS } from '../core/endpoints'
import { isApiEnabled } from '@/constants'
import {
  fetchMentors,
  fetchPublishedSchedules,
  fetchAllSkills,
  fetchProvinces,
} from '../mentors/mentorService'
import { fetchPlans } from '../platform/subscriptionService'
import { fetchUsers } from './usersApi'

export async function fetchAdminReports() {
  if (isApiEnabled()) {
    try {
      return await apiRequest(ENDPOINTS.admin.reports)
    } catch {
      /* fall through to composed overview */
    }
  }
  return fetchAdminOverview()
}

export async function fetchAdminUserTypes() {
  if (!isApiEnabled()) return []
  const json = await apiRequest(ENDPOINTS.userTypes.list, { auth: false })
  if (Array.isArray(json)) return json
  return json?.data ?? json?.item ?? json?.items ?? []
}

/** Compose platform stats from APIs available today (no dedicated admin module yet). */
export async function fetchAdminOverview() {
  const empty = {
    teachers: null,
    sessions: null,
    skills: null,
    provinces: null,
    plans: null,
    users: null,
    revenue: null,
    students: null,
  }

  if (!isApiEnabled()) return empty

  const [mentorsRes, sessions, skills, provinces, plans, users] = await Promise.allSettled([
    fetchMentors({ page: 1, pageSize: 1 }),
    fetchPublishedSchedules({ status: 'published' }),
    fetchAllSkills(),
    fetchProvinces(),
    fetchPlans(),
    fetchUsers(),
  ])

  return {
    teachers:
      mentorsRes.status === 'fulfilled'
        ? (mentorsRes.value.apiTotal ?? mentorsRes.value.total ?? 0)
        : null,
    sessions:
      sessions.status === 'fulfilled' && Array.isArray(sessions.value)
        ? sessions.value.length
        : null,
    skills:
      skills.status === 'fulfilled' && Array.isArray(skills.value)
        ? skills.value.length
        : null,
    provinces:
      provinces.status === 'fulfilled' && Array.isArray(provinces.value)
        ? provinces.value.length
        : null,
    plans:
      plans.status === 'fulfilled' && Array.isArray(plans.value)
        ? plans.value.length
        : null,
    users:
      users.status === 'fulfilled' && Array.isArray(users.value)
        ? users.value.length
        : null,
    revenue: null,
    students: null,
  }
}

export async function fetchAdminMentors(filters = {}) {
  if (!isApiEnabled()) {
    return { items: [], total: 0, page: filters.page ?? 1, pageSize: filters.pageSize ?? 0 }
  }
  return fetchMentors(filters)
}

export async function fetchAdminSessions(options = {}) {
  if (!isApiEnabled()) return []
  return fetchPublishedSchedules(options)
}

export async function fetchAdminCatalog() {
  if (!isApiEnabled()) {
    return { skills: [], provinces: [] }
  }
  const [skills, provinces] = await Promise.all([fetchAllSkills(), fetchProvinces()])
  return { skills: skills ?? [], provinces: provinces ?? [] }
}

export async function fetchAdminPlans() {
  if (!isApiEnabled()) return []
  return fetchPlans()
}
