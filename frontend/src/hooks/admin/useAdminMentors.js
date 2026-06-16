import { useCallback, useEffect, useState } from 'react'
import { fetchAdminMentors } from '@/services/admin/adminApi'

export function useAdminMentors(initialFilters = {}) {
  const [filters, setFilters] = useState(initialFilters)
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetchAdminMentors(filters)
      setItems(result.items ?? [])
      setTotal(result.apiTotal ?? result.total ?? 0)
    } catch (err) {
      setError(err)
      setItems([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    load()
  }, [load])

  return { items, total, loading, error, filters, setFilters, reload: load }
}

export default useAdminMentors
