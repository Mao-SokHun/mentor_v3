import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks'
import { isMentorRole, normalizeAppRole } from '@/lib/userRole'

const AuthLoading = () => (
  <div className="min-h-[40vh] flex items-center justify-center">
    <div
      className="w-8 h-8 border-2 border-primary-200 border-t-primary-500 rounded-full animate-spin"
      aria-hidden
    />
  </div>
)

/**
 * Wraps routes that require authentication and/or a specific role.
 *
 * Props:
 *   role        'student' | 'mentor' | 'admin' | null
 *               null = any authenticated user may access
 *
 * Behaviour:
 *   - Not logged in                    → /login
 *   - Wrong role (non-admin route)     → redirect to own home
 *   - Admin trying student/teacher     → /admin
 *   - Correct role                     → render children
 */
const ProtectedRoute = ({ role, children }) => {
  const { user, loading } = useAuth()

  if (loading) return <AuthLoading />

  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Admin trying to access non-admin areas
  if (user.role === 'admin' && role !== 'admin' && role !== null) {
    return <Navigate to="/admin" replace />
  }

  // Student/teacher trying to access admin
  if (role === 'admin' && user.role !== 'admin') {
    return <Navigate to="/login" replace />
  }

  const userRole = normalizeAppRole(user.role)

  // Student trying to access teacher routes or vice-versa
  if (role && role !== 'admin' && userRole !== role) {
    if (isMentorRole(user.role)) return <Navigate to="/mentor/home" replace />
    if (user.role === 'admin')   return <Navigate to="/admin" replace />
    return <Navigate to="/home" replace />
  }

  return children
}

export default ProtectedRoute
