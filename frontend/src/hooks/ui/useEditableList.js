import { useState } from 'react'

export const useEditableList = (initialItems = []) => {
  const [items, setItems] = useState(initialItems)

  const add = (item) => setItems((prev) => [...prev, item])
  const remove = (index) => setItems((prev) => prev.filter((_, i) => i !== index))
  const update = (index, value) => setItems((prev) => prev.map((item, i) => (i === index ? value : item)))

  return { items, add, remove, update, setItems }
}

export default useEditableList
