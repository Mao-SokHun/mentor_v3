import { apiRequest } from '../core/client'
import { ENDPOINTS } from '../core/endpoints'
import { isApiEnabled } from '@/constants'

export async function fetchUsers() {
  if (!isApiEnabled()) return []
  const json = await apiRequest(ENDPOINTS.users.list)
  return Array.isArray(json) ? json : (json.data ?? [])
}
