import { useEffect, useState } from 'react'
import { fetchUsers } from '@/services/admin/usersApi'

export function useAdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetchUsers()
      .then((rows) => {
        if (!cancelled) setUsers(Array.isArray(rows) ? rows : [])
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err)
          setUsers([])
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return { users, loading, error, setUsers }
}

export default useAdminUsers
