import { useEffect, useState } from 'react'
import { fetchAdminPlans } from '@/services/admin/adminApi'

export function useAdminPlans() {
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetchAdminPlans()
      .then((rows) => {
        if (!cancelled) setPlans(Array.isArray(rows) ? rows : [])
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err)
          setPlans([])
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return { plans, loading, error }
}

export default useAdminPlans
