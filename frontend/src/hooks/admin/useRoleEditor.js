import { useState } from 'react'

export const useRoleEditor = () => {
  const [roles, setRoles] = useState([])
  const [editing, setEditing] = useState(null)

  const startEdit = (role) => setEditing(role)
  const cancelEdit = () => setEditing(null)
  const saveEdit = (updated) => {
    setRoles((prev) => prev.map((r) => (r.id === updated.id ? updated : r)))
    setEditing(null)
  }

  return { roles, editing, startEdit, cancelEdit, saveEdit, setRoles }
}

export default useRoleEditor
