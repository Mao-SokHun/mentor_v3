import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks'
import ProtectedRoute from '../layout/ProtectedRoute'
import AdminLayout from '../layout/AdminLayout'

/**
 * /admin/help and /admin/contact: admin panel for admins,
 * everyone else → public /help or /contact (avoids login redirect).
 */
export const AdminOrPublicHelp = ({ AdminPage }) => {
  const { user } = useAuth()
  if (user?.role === 'admin') {
    return (
      <ProtectedRoute role="admin">
        <AdminLayout>
          <AdminPage />
        </AdminLayout>
      </ProtectedRoute>
    )
  }
  return <Navigate to="/help" replace />
}

export const AdminOrPublicContact = ({ AdminPage }) => {
  const { user } = useAuth()
  if (user?.role === 'admin') {
    return (
      <ProtectedRoute role="admin">
        <AdminLayout>
          <AdminPage />
        </AdminLayout>
      </ProtectedRoute>
    )
  }
  return <Navigate to="/contact" replace />
}
