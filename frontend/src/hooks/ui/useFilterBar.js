import { useState, useCallback } from 'react'

export const useFilterBar = (defaults = {}) => {
  const [filters, setFilters] = useState(defaults)

  const setFilter = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }, [])

  const reset = useCallback(() => setFilters(defaults), [defaults])

  return { filters, setFilter, reset, setFilters }
}

export default useFilterBar
