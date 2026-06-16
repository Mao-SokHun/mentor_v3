import { useEffect, useState } from 'react'
import { fetchCommunities } from '@/services/communities/communityService'

export function useCommunities(params = {}) {
  const [communities, setCommunities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const type = params.type
  const q = params.q

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    fetchCommunities({ type, q })
      .then((items) => {
        if (!cancelled) setCommunities(Array.isArray(items) ? items : [])
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err)
          setCommunities([])
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [type, q])

  return { communities, loading, error }
}

export default useCommunities
