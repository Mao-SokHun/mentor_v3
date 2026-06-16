import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

/** Redirect helper — opens teacher onboarding modal on dashboard */
const CompleteMentorProfile = () => {
  const navigate = useNavigate()

  useEffect(() => {
    navigate('/mentor/home', { replace: true, state: { showCompleteMentorProfile: true } })
  }, [navigate])

  return null
}

export default CompleteMentorProfile
