import { useAuth, getStoredUser } from '@/hooks'
import MainLayout from '../layout/MainLayout'

const isAppUser = (u) => u?.role === 'student' || u?.role === 'mentor'

const LegalWrapper = ({ inApp: InAppPage, public: PublicPage, children }) => {
  const { user } = useAuth()
  const activeUser = user ?? getStoredUser()

  if (children) {
    if (isAppUser(activeUser)) {
      return <MainLayout>{children}</MainLayout>
    }
    return <>{children}</>
  }

  if (isAppUser(activeUser)) {
    return <MainLayout><InAppPage /></MainLayout>
  }
  return <PublicPage />
}

export default LegalWrapper
