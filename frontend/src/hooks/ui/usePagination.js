import { useState, useMemo } from 'react'

export const usePagination = (totalItems, pageSize = 10) => {
  const [page, setPage] = useState(1)

  const totalPages = useMemo(() => Math.ceil(totalItems / pageSize), [totalItems, pageSize])
  const next = () => setPage((p) => Math.min(p + 1, totalPages))
  const prev = () => setPage((p) => Math.max(p - 1, 1))
  const goTo = (p) => setPage(Math.max(1, Math.min(p, totalPages)))

  return { page, totalPages, next, prev, goTo, setPage, pageSize }
}

export default usePagination
