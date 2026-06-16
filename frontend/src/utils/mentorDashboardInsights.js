import { resolveProfilePictureUrl } from '@/utils/profilePictureUtils'
import { parsePostScheduleMeta } from '@/utils/mentorPostMapper'
import { parseScheduleDate } from '@/utils/mentorDetailUtils'
import { getPostSessionDate, getPostSubjectLabel } from '@/utils/analyticsFilterUtils'

/** Earliest upcoming published session (today or later). */
export function findNextUpcomingSession(posts = [], lang = 'en') {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  let best = null
  let bestDate = null

  for (const post of posts) {
    const status = String(post.status ?? 'published').toLowerCase()
    if (status !== 'published') continue

    const meta = parsePostScheduleMeta(post.description)
    const sessionDate = parseScheduleDate(meta.date)
    if (!sessionDate || sessionDate < today) continue

    if (!bestDate || sessionDate < bestDate) {
      bestDate = sessionDate
      best = {
        postId: post.post_id ?? post.id,
        date: meta.date || '—',
        time: meta.time || meta.timeLabel || '—',
        subject: getPostSubjectLabel(post, lang),
      }
    }
  }

  return best
}

const COMPLETION_CHECKS = [
  {
    key: 'avatar',
    labelKey: 'mentorDash.completeAvatar',
    href: '/mentor/edit-profile',
    isDone: ({ user, mentorRow }) =>
      !!(resolveProfilePictureUrl(mentorRow?.profile_picture) || user?.avatarUrl || user?.profilePicture),
  },
  {
    key: 'bio',
    labelKey: 'mentorDash.completeBio',
    href: '/mentor/edit-profile',
    isDone: ({ user, mentorRow }) =>
      !!(String(mentorRow?.description ?? user?.bio ?? '').trim()),
  },
  {
    key: 'skills',
    labelKey: 'mentorDash.completeSkills',
    href: '/mentor/edit-profile',
    isDone: ({ analytics }) => (analytics?.skills_count ?? 0) > 0,
  },
  {
    key: 'portfolio',
    labelKey: 'mentorDash.completePortfolio',
    href: '/mentor/edit-profile',
    isDone: ({ analytics }) => (analytics?.portfolio_count ?? 0) > 0,
  },
]

export function computeProfileCompletion({ user, mentorRow, analytics }) {
  const checks = COMPLETION_CHECKS.map((def) => {
    const done = def.isDone({ user, mentorRow, analytics })
    return {
      key: def.key,
      labelKey: def.labelKey,
      href: def.href,
      done,
    }
  })

  const doneCount = checks.filter((c) => c.done).length
  const total = checks.length
  const percent = total ? Math.round((doneCount / total) * 100) : 0

  return { percent, checks, doneCount, total, missing: checks.filter((c) => !c.done) }
}

/** Group filtered posts by calendar week (Mon start) for bar chart. */
export function buildWeeklyPostsTrend(posts = [], locale = 'en') {
  const loc = locale === 'km' ? 'km-KH' : 'en-US'
  const weekMap = new Map()

  for (const post of posts) {
    const d = getPostSessionDate(post)
    if (!d) continue

    const mon = new Date(d)
    const day = mon.getDay()
    const diff = day === 0 ? -6 : 1 - day
    mon.setDate(mon.getDate() + diff)
    mon.setHours(0, 0, 0, 0)
    const key = mon.toISOString().slice(0, 10)
    weekMap.set(key, (weekMap.get(key) || 0) + 1)
  }

  return [...weekMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([weekStart, count]) => {
      const d = new Date(weekStart)
      const label = new Intl.DateTimeFormat(loc, { month: 'short', day: 'numeric' }).format(d)
      return { t: label, posts: count }
    })
}

/** Profile detail-view trend from analytics API (daily buckets). */
export function buildProfileViewsTrend(analytics, locale = 'en') {
  const loc = locale === 'km' ? 'km-KH' : 'en-US'
  const daily = analytics?.detail_views_daily ?? []

  if (!daily.length) {
    return []
  }

  return daily.map((row) => {
    const d = parseScheduleDate(row.date) ?? new Date()
    const label = new Intl.DateTimeFormat(loc, { month: 'short', day: 'numeric' }).format(d)
    return { t: label, views: Number(row.count) || 0 }
  })
}
