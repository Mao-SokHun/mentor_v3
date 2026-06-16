import { useEffect, useState } from 'react'
import { fetchAdminSessions } from '@/services/admin/adminApi'

export function useAdminSessions(options = { status: 'published' }) {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetchAdminSessions(options)
      .then((rows) => {
        if (!cancelled) setSessions(Array.isArray(rows) ? rows : [])
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err)
          setSessions([])
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [options.status])

  return { sessions, loading, error }
}

export default useAdminSessions
