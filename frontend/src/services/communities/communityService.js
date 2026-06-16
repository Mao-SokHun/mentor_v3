import { apiRequest, isApiEnabled } from '../core/api'
import { filterCommunities } from '@/constants'

const ENDPOINTS = {
  list: '/communities',
  byId: (id) => `/communities/${id}`,
}

export async function fetchCommunities(params = {}) {
  if (isApiEnabled()) {
    const qs = new URLSearchParams()
    if (params.type) qs.set('type', params.type)
    if (params.q) qs.set('q', params.q)
    const query = qs.toString()
    const json = await apiRequest(`${ENDPOINTS.list}${query ? `?${query}` : ''}`)
    return Array.isArray(json) ? json : (json.data ?? [])
  }

  return []
}

export async function fetchCommunityById(id) {
  if (isApiEnabled()) {
    return apiRequest(ENDPOINTS.byId(id))
  }
  return null
}

export async function createCommunity(data) {
  if (isApiEnabled()) {
    return apiRequest(ENDPOINTS.list, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }
  return null
}
