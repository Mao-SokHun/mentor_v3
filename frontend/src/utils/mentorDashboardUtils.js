import { parsePostScheduleMeta } from '@/utils/mentorPostMapper'
import { mondayOfWeek, parseScheduleDate } from '@/utils/mentorDetailUtils'
import { getLocalDetailViewCount } from '@/utils/mentorViewTracking'
import {
  getPostSkillSubjectLine,
  getPostSubjectGroupKey,
} from '@/utils/analyticsFilterUtils'

const SUBJECT_BAR_COLORS = [
  'bg-primary-300',
  'bg-emerald-400',
  'bg-amber-400',
  'bg-sky-400',
  'bg-violet-400',
  'bg-rose-400',
]

export const PERIOD_TODAY = 'today'
export const PERIOD_WEEK = 'week'

function addDays(date, days) {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  d.setHours(0, 0, 0, 0)
  return d
}

function formatHourLabel(hour) {
  if (hour === 0) return '12am'
  if (hour < 12) return `${hour}am`
  if (hour === 12) return '12pm'
  return `${hour - 12}pm`
}

export function buildDetailViewsChart(analytics, period, locale = 'en') {
  const loc = locale === 'km' ? 'km-KH' : 'en-US'

  if (period === PERIOD_TODAY) {
    const hourly = analytics?.detail_views_hourly_today ?? []
    if (hourly.length) {
      return hourly.map((row) => ({
        t: formatHourLabel(Number(row.hour)),
        v: Number(row.count) || 0,
      }))
    }
    return [6, 9, 12, 15, 18, 21].map((hour) => ({
      t: formatHourLabel(hour),
      v: 0,
    }))
  }

  const daily = analytics?.detail_views_daily ?? []
  if (daily.length) {
    return daily.map((row) => {
      const d = parseScheduleDate(row.date) ?? new Date()
      const weekday = new Intl.DateTimeFormat(loc, { weekday: 'short' }).format(d)
      return { t: weekday, v: Number(row.count) || 0 }
    })
  }

  return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((t) => ({ t, v: 0 }))
}

export function countPostsThisWeek(posts = []) {
  const monday = mondayOfWeek(new Date())
  const sunday = addDays(monday, 6)
  sunday.setHours(23, 59, 59, 999)

  return posts.filter((post) => {
    const meta = parsePostScheduleMeta(post.description)
    const d = parseScheduleDate(meta.date)
    if (!d) return false
    return d >= monday && d <= sunday
  }).length
}

/** Share of mentor posts per skill/subject (from post sub_skill_id + skill rows). */
export function buildSubjectActivityBreakdown(
  posts = [],
  lang = 'en',
  { maxItems = 6, otherLabel = 'Other' } = {}
) {
  if (!Array.isArray(posts) || posts.length === 0) return []

  const groups = new Map()

  for (const post of posts) {
    const key = getPostSubjectGroupKey(post)
    const label = getPostSkillSubjectLine(post, lang) || otherLabel
    const prev = groups.get(key)
    if (prev) {
      prev.count += 1
    } else {
      groups.set(key, { key, label, count: 1 })
    }
  }

  const total = posts.length
  const sorted = [...groups.values()].sort((a, b) => b.count - a.count)

  let rows = sorted.slice(0, maxItems).map((row, index) => ({
    key: row.key,
    label: row.label,
    count: row.count,
    pct: Math.round((row.count / total) * 100),
    color: SUBJECT_BAR_COLORS[index % SUBJECT_BAR_COLORS.length],
  }))

  if (sorted.length > maxItems) {
    const rest = sorted.slice(maxItems)
    const restCount = rest.reduce((sum, row) => sum + row.count, 0)
    rows.push({
      key: 'other',
      label: otherLabel,
      count: restCount,
      pct: Math.round((restCount / total) * 100),
      color: SUBJECT_BAR_COLORS[maxItems % SUBJECT_BAR_COLORS.length],
    })
  }

  const pctSum = rows.reduce((sum, row) => sum + row.pct, 0)
  if (pctSum !== 100 && rows.length > 0) {
    const diff = 100 - pctSum
    rows[0] = { ...rows[0], pct: rows[0].pct + diff }
  }

  return rows
}

export function buildLocalDetailViewsChart(period, mentorId) {
  const total = getLocalDetailViewCount(mentorId)
  if (period === PERIOD_TODAY) {
    return [6, 9, 12, 15, 18, 21].map((hour) => ({
      t: formatHourLabel(hour),
      v: hour === 12 ? total : 0,
    }))
  }
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  return days.map((t, idx) => ({
    t,
    v: idx === days.length - 1 ? total : 0,
  }))
}
