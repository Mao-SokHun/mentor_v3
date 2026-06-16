import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

/** Deep link: redirect to feed and open create-post bottom sheet. */
const CommunityCreatePost = () => {
  const navigate = useNavigate()

  useEffect(() => {
    navigate('/community', { replace: true, state: { openCreatePost: true } })
  }, [navigate])

  return null
}

export default CommunityCreatePost
