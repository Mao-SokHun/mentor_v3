import { useEffect, useState } from 'react'
import { fetchAdminOverview } from '@/services/admin/adminApi'

export function useDashboardStats() {
  const [stats, setStats] = useState({
    students: null,
    mentors: null,
    sessions: null,
    rating: null,
    revenue: null,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetchAdminOverview()
      .then((data) => {
        if (!cancelled) {
          setStats({
            students: data.students,
            mentors: data.teachers,
            sessions: data.sessions,
            rating: null,
            revenue: data.revenue,
          })
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return { stats, loading }
}

export default useDashboardStats
