import { useState, useMemo } from 'react'

export const useSearchFilter = (items, keys = ['name']) => {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    if (!query.trim()) return items
    const lower = query.toLowerCase()
    return items.filter((item) =>
      keys.some((key) => String(item[key] || '').toLowerCase().includes(lower))
    )
  }, [items, query, keys])

  return { query, setQuery, filtered }
}

export default useSearchFilter
