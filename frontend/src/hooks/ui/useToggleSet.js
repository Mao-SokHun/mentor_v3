import { useState, useCallback } from 'react'

export const useToggleSet = (initialSet = new Set()) => {
  const [selected, setSelected] = useState(initialSet)

  const toggle = useCallback((item) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(item)) next.delete(item)
      else next.add(item)
      return next
    })
  }, [])

  const has = useCallback((item) => selected.has(item), [selected])
  const clear = useCallback(() => setSelected(new Set()), [])

  return { selected, toggle, has, clear }
}

export default useToggleSet
