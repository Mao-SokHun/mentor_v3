import { isApiEnabled } from '@/constants'

export function requireApi(feature = 'This feature') {
  if (!isApiEnabled()) {
    throw new Error(`${feature} requires VITE_API_URL to be set and the backend to be running.`)
  }
}
