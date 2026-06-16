import { useMemo, useState, useEffect, useCallback } from 'react'
import { isApiEnabled } from '@/constants'
import { useAuth } from '@/hooks/auth'
import { useTranslation } from '@/i18n'
import { fetchMyMentorDashboard } from '@/services/mentors/mentorService'
import { mapMentorToListItem } from '@/utils/mentorMapper'
import { mapPostsToSessionRows } from '@/utils/mentorDetailUtils'
import {
  buildDetailViewsChart,
  buildLocalDetailViewsChart,
  buildSubjectActivityBreakdown,
  countPostsThisWeek,
  PERIOD_TODAY,
  PERIOD_WEEK,
} from '@/utils/mentorDashboardUtils'
import {
  computeProfileCompletion,
  findNextUpcomingSession,
} from '@/utils/mentorDashboardInsights'

export function useMentorDashboard() {
  const { user } = useAuth()
  const { lang, labelFor, t } = useTranslation()
  const [analytics, setAnalytics] = useState(null)
  const [posts, setPosts] = useState([])
  const [rating, setRating] = useState(0)
  const [reviewCount, setReviewCount] = useState(0)
  const [mentorRow, setMentorRow] = useState(null)
  const [loading, setLoading] = useState(isApiEnabled())
  const [loadError, setLoadError] = useState('')
  const [period, setPeriod] = useState(PERIOD_WEEK)

  const loadDashboard = useCallback(() => {
    if (!isApiEnabled() || !user?.id) {
      setLoading(false)
      return () => {}
    }

    let cancelled = false
    setLoading(true)
    setLoadError('')

    fetchMyMentorDashboard()
      .then(({ analytics: analyticsRow, posts: postRows, mentor: mentorRow }) => {
        if (cancelled) return
        setAnalytics(analyticsRow)
        setPosts(postRows ?? [])
        setMentorRow(mentorRow ?? null)

        const mentor = mentorRow ? mapMentorToListItem(mentorRow) : null
        setRating(Number(mentor?.rating) || 0)
        setReviewCount(Number(mentor?.reviewCount) || 0)
      })
      .catch((err) => {
        if (!cancelled) {
          setAnalytics(null)
          setPosts([])
          setRating(0)
          setReviewCount(0)
          setMentorRow(null)
          setLoadError(err?.message || t('mentorDash.loadFailed'))
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [user?.id, t])

  useEffect(() => {
    return loadDashboard()
  }, [loadDashboard])

  const stats = useMemo(
    () => ({
      sessions: analytics?.published_posts_count ?? analytics?.posts_count ?? 0,
      detailViews: analytics?.profile_views ?? 0,
      rating,
      reviewCount,
      thisWeek: countPostsThisWeek(posts),
      skills: analytics?.skills_count ?? 0,
    }),
    [analytics, posts, rating, reviewCount]
  )

  const activityChart = useMemo(() => {
    if (isApiEnabled()) {
      return buildDetailViewsChart(analytics, period, lang)
    }
    return buildLocalDetailViewsChart(period, user?.id)
  }, [analytics, period, user?.id, lang])

  const subjectBreakdown = useMemo(
    () =>
      buildSubjectActivityBreakdown(posts, lang, {
        otherLabel: t('mentorDash.subjectOther'),
      }),
    [posts, lang, t]
  )

  const upcomingSessions = useMemo(
    () =>
      mapPostsToSessionRows(posts, {
        lang,
        onlineLabel: t('mentorCard.onlineClass'),
      }),
    [posts, lang, t]
  )

  const nextSession = useMemo(() => findNextUpcomingSession(posts, lang), [posts, lang])

  const profileCompletion = useMemo(
    () => computeProfileCompletion({ user, mentorRow, analytics }),
    [user, mentorRow, analytics]
  )

  return {
    stats,
    activityChart,
    subjectBreakdown,
    upcomingSessions,
    nextSession,
    profileCompletion,
    posts,
    loading,
    loadError,
    period,
    setPeriod,
    periods: [PERIOD_TODAY, PERIOD_WEEK],
    refetch: loadDashboard,
    userId: user?.id,
  }
}

export default useMentorDashboard
