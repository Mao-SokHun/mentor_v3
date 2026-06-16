import { useAuth, getStoredUser } from '@/hooks'
import MainLayout from '../layout/MainLayout'

const isAppUser = (u) => u?.role === 'student' || u?.role === 'mentor'

/**
 * Logged-in students/teachers see legal pages inside MainLayout (student/teacher navbar).
 * Guests see the public standalone page (landing PublicNavbar).
 */
const LegalPageRoute = ({ inApp: InAppPage, public: PublicPage }) => {
  const { user } = useAuth()
  const activeUser = user ?? getStoredUser()

  if (isAppUser(activeUser)) {
    return (
      <MainLayout>
        <InAppPage />
      </MainLayout>
    )
  }

  return <PublicPage />
}

export default LegalPageRoute
