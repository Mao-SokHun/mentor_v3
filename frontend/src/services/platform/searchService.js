import { apiRequest, isApiEnabled } from '../core/api'

const ENDPOINTS = {
  search: '/search',
}

export async function search(query, params = {}) {
  if (isApiEnabled()) {
    const qs = new URLSearchParams({ q: query, ...params })
    return apiRequest(`${ENDPOINTS.search}?${qs.toString()}`)
  }
  return { results: [], total: 0 }
}
