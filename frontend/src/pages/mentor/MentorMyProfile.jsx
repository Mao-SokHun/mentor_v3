import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { PageAmbient, MentorOwnProfileView } from '@/components'
import { useTranslation } from '@/i18n'
import { useAuth } from '@/hooks'
import { isApiEnabled } from '@/constants'
import { resolveMentorProfile } from '@/lib/mentorProfile'
import { mapPublishedPostsToProfileSlots } from '@/utils/mentorProfileScheduleUtils'
import {
  fetchMyMentorProfileForUi,
  fetchMentorExperience,
  fetchMyMentorPosts,
  fetchMentorPortfolio,
  fetchProvinces,
} from '@/services/mentors/mentorService'
import { resolveProvinceCanonicalName } from '@/utils/provinceOptions'

const MentorMyProfile = () => {
  const { t, lang } = useTranslation()
  const { user } = useAuth()
  const location = useLocation()
  const [profile, setProfile] = useState(() => resolveMentorProfile(user))
  const [experience, setExperience] = useState([])
  const [publishedPosts, setPublishedPosts] = useState([])
  const [portfolio, setPortfolio] = useState([])
  const [loading, setLoading] = useState(isApiEnabled())

  useEffect(() => {
    if (!isApiEnabled() || !user?.id) {
      setProfile(resolveMentorProfile(user))
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)

    Promise.allSettled([
      fetchMyMentorProfileForUi(user),
      fetchMentorExperience(user.id),
      fetchMyMentorPosts({ status: 'published' }),
      fetchMentorPortfolio(user.id),
      fetchProvinces(),
    ])
      .then(([mentorResult, experienceResult, postsResult, portfolioResult, provincesResult]) => {
        if (cancelled) return
        const provinces =
          provincesResult.status === 'fulfilled' ? provincesResult.value : []
        const baseProfile =
          mentorResult.status === 'fulfilled' ? mentorResult.value : resolveMentorProfile(user)
        const canonicalProvince = resolveProvinceCanonicalName(baseProfile.province, provinces)
        const profileData = {
          ...baseProfile,
          province: canonicalProvince || baseProfile.province,
        }
        const experienceRows =
          experienceResult.status === 'fulfilled' ? experienceResult.value : []
        const posts = postsResult.status === 'fulfilled' ? postsResult.value : []
        const portfolioRows =
          portfolioResult.status === 'fulfilled' ? portfolioResult.value : []
        setProfile(profileData)
        setExperience(experienceRows)
        setPublishedPosts(posts)
        setPortfolio(portfolioRows)
      })
      .catch(() => {
        if (!cancelled) {
          setProfile(resolveMentorProfile(user))
          setExperience([])
          setPublishedPosts([])
          setPortfolio([])
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [user?.id, location.key])

  const publishedSlots = useMemo(
    () => mapPublishedPostsToProfileSlots(publishedPosts, lang),
    [publishedPosts, lang]
  )

  if (loading) {
    return (
      <PageAmbient variant="mentor">
        <div className="py-16 text-center text-slate-500">{t('student.loadingMentors')}</div>
      </PageAmbient>
    )
  }

  return (
    <PageAmbient variant="mentor">
      <MentorOwnProfileView
        profile={profile}
        experience={experience}
        publishedSlots={publishedSlots}
        portfolio={portfolio}
      />
    </PageAmbient>
  )
}

export default MentorMyProfile
