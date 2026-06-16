import { getPostSessionDate } from '@/utils/analyticsFilterUtils'
import { formatReportMonthLabel, mondayOfWeek } from '@/utils/mentorDetailUtils'

export const REPORT_PERIOD_WEEK = 'week'
export const REPORT_PERIOD_MONTH = 'month'
export const REPORT_PERIOD_YEAR = 'year'

function addDays(date, days) {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  d.setHours(0, 0, 0, 0)
  return d
}

/** Posts whose session date falls in the selected week / month / year (anchor). */
export function filterPostsByReportPeriod(posts = [], period = REPORT_PERIOD_WEEK, anchor = new Date()) {
  const anchorDate = new Date(anchor)
  if (Number.isNaN(anchorDate.getTime())) return []

  if (period === REPORT_PERIOD_YEAR) {
    const year = anchorDate.getFullYear()
    return posts.filter((post) => {
      const sessionDate = getPostSessionDate(post)
      return sessionDate && sessionDate.getFullYear() === year
    })
  }

  if (period === REPORT_PERIOD_MONTH) {
    const year = anchorDate.getFullYear()
    const month = anchorDate.getMonth()
    return posts.filter((post) => {
      const sessionDate = getPostSessionDate(post)
      return sessionDate && sessionDate.getFullYear() === year && sessionDate.getMonth() === month
    })
  }

  const monday = mondayOfWeek(anchorDate)
  const sunday = addDays(monday, 6)
  sunday.setHours(23, 59, 59, 999)

  return posts.filter((post) => {
    const sessionDate = getPostSessionDate(post)
    return sessionDate && sessionDate >= monday && sessionDate <= sunday
  })
}

export function formatReportPeriodLabel(period, anchor = new Date(), locale = 'en') {
  const d = new Date(anchor)
  if (Number.isNaN(d.getTime())) return ''

  if (period === REPORT_PERIOD_YEAR) {
    return String(d.getFullYear())
  }

  if (period === REPORT_PERIOD_MONTH) {
    return formatReportMonthLabel(d, locale)
  }

  const monday = mondayOfWeek(d)
  const sunday = addDays(monday, 6)
  const loc = locale === 'km' ? 'km-KH' : 'en-US'
  const startPart = monday.toLocaleDateString(loc, { month: 'long', day: 'numeric' })
  const endPart = sunday.toLocaleDateString(loc, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
  return `${startPart} – ${endPart}`
}

export function reportPeriodStamp(period, anchor = new Date()) {
  const d = new Date(anchor)
  const pad = (n) => String(n).padStart(2, '0')
  if (period === REPORT_PERIOD_YEAR) return String(d.getFullYear())
  if (period === REPORT_PERIOD_MONTH) return `${d.getFullYear()}${pad(d.getMonth() + 1)}`
  const monday = mondayOfWeek(d)
  return `${monday.getFullYear()}${pad(monday.getMonth() + 1)}${pad(monday.getDate())}`
}
