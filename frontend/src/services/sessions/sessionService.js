import { apiRequest, isApiEnabled } from '../core/api'

const ENDPOINTS = {
  list: '/sessions',
  byId: (id) => `/sessions/${id}`,
}

export async function fetchSessions() {
  if (!isApiEnabled()) return []
  const json = await apiRequest(ENDPOINTS.list)
  return Array.isArray(json) ? json : (json.data ?? [])
}

export async function createSession(payload) {
  if (!isApiEnabled()) return null
  return apiRequest(ENDPOINTS.list, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function updateSession(id, payload) {
  if (!isApiEnabled()) return null
  return apiRequest(ENDPOINTS.byId(id), {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export async function deleteSession(id) {
  if (!isApiEnabled()) return null
  return apiRequest(ENDPOINTS.byId(id), { method: 'DELETE' })
}
