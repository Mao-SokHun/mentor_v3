import { useEffect, useState } from 'react'
import { fetchAdminUserTypes } from '@/services/admin/adminApi'

export function useAdminUserTypes() {
  const [userTypes, setUserTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetchAdminUserTypes()
      .then((rows) => {
        if (!cancelled) setUserTypes(Array.isArray(rows) ? rows : [])
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err)
          setUserTypes([])
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return { userTypes, loading, error }
}

export default useAdminUserTypes
