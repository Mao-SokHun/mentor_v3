import { useEffect, useState } from 'react'
import { fetchMentorById } from '@/services/mentors/mentorService'

export function useMentor(id) {
  const [mentor, setMentor] = useState(null)
  const [loading, setLoading] = useState(Boolean(id))
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!id) {
      setMentor(null)
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    fetchMentorById(id)
      .then((row) => {
        if (!cancelled) setMentor(row)
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err)
          setMentor(null)
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [id])

  return { mentor, loading, error }
}

export default useMentor
