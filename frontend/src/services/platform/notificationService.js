import { apiRequest, isApiEnabled } from '../core/api'

const ENDPOINTS = {
  list: '/notifications',
  byId: (id) => `/notifications/${id}`,
  markRead: (id) => `/notifications/${id}/read`,
}

export async function fetchNotifications() {
  if (isApiEnabled()) {
    const json = await apiRequest(ENDPOINTS.list)
    return Array.isArray(json) ? json : (json.data ?? [])
  }
  return []
}

export async function markNotificationRead(id) {
  if (isApiEnabled()) {
    return apiRequest(ENDPOINTS.markRead(id), { method: 'PUT' })
  }
  return { id, read: true }
}

export async function markAllNotificationsRead() {
  if (isApiEnabled()) {
    return apiRequest('/notifications/read-all', { method: 'PUT' })
  }
  return { success: true }
}
