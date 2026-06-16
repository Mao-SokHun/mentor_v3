import { Award } from 'lucide-react'
import {
  detectPortfolioLinkKind,
  portfolioKindMeta,
  portfolioDisplayTitle,
  portfolioDisplaySubtitle,
} from '@/utils/portfolioUtils'
import { formatMentorDisplayName, mentorNamesDbToUi } from '@/lib/mentorApiMap'
import { skillRowLabel } from '@/services/mentors/mentorService'
import { parsePostScheduleMeta } from '@/utils/mentorPostMapper'
import { compareTimeSortKeys } from '@/utils/timeRangeUtils'
import { provinceRowLabel } from '@/utils/provinceOptions'

function parseIsoDateKey(str) {
  const match = String(str ?? '').match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (!match) return null
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
}

export function parseScheduleDate(str) {
  const iso = parseIsoDateKey(str)
  if (iso) return iso
  const parsed = new Date(String(str ?? '').trim())
  if (Number.isNaN(parsed.getTime())) return null
  parsed.setHours(0, 0, 0, 0)
  return parsed
}

function toIsoDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function addDays(date, days) {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  d.setHours(0, 0, 0, 0)
  return d
}

export function mondayOfWeek(date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function sundayOfWeek(date) {
  return addDays(mondayOfWeek(date), 6)
}

function formatDayTab(date, locale = 'en') {
  const loc = locale === 'km' ? 'km-KH' : 'en-US'
  const weekday = new Intl.DateTimeFormat(loc, { weekday: 'short' })
    .format(date)
    .replace(/\./g, '')
    .toUpperCase()
  return `${weekday} ${date.getDate()}`
}

export function formatReportWeekRange(startDate, endDate, locale = 'en') {
  const loc = locale === 'km' ? 'km-KH' : 'en-US'
  const startPart = startDate.toLocaleDateString(loc, { month: 'long', day: 'numeric' })
  const endPart = endDate.toLocaleDateString(loc, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
  return `${startPart} – ${endPart}`
}

export function formatReportMonthLabel(date, locale = 'en') {
  const loc = locale === 'km' ? 'km-KH' : 'en-US'
  return date.toLocaleDateString(loc, { month: 'long', year: 'numeric' })
}

export function formatReportYearLabel(date, locale = 'en') {
  const loc = locale === 'km' ? 'km-KH' : 'en-US'
  return date.toLocaleDateString(loc, { year: 'numeric' })
}

function weekdayHeaders(locale = 'en') {
  const loc = locale === 'km' ? 'km-KH' : 'en-US'
  const monday = new Date(2024, 0, 1) // Monday
  return Array.from({ length: 7 }, (_, i) => {
    const d = addDays(monday, i)
    return new Intl.DateTimeFormat(loc, { weekday: 'short' })
      .format(d)
      .replace(/\./g, '')
      .toUpperCase()
  })
}

/** Posts grouped by ISO date key, slots sorted by time */
export function indexPostsByDate(posts = []) {
  const byDate = new Map()

  for (const post of posts) {
    const meta = parsePostScheduleMeta(post.description)
    const parsed = parseScheduleDate(meta.date)
    if (!parsed) continue
    const dateKey = toIsoDateKey(parsed)

    if (!byDate.has(dateKey)) byDate.set(dateKey, [])
    byDate.get(dateKey).push({
      time: meta.time || '—',
      timeSortKey: meta.sortKey,
      subject: post.title ?? '—',
      students: 0,
    })
  }

  for (const cells of byDate.values()) {
    cells.sort((a, b) => compareTimeSortKeys(a.timeSortKey, b.timeSortKey))
  }

  return byDate
}

function findEarliestPostDate(posts = []) {
  let earliest = null
  for (const post of posts) {
    const parsed = parseScheduleDate(parsePostScheduleMeta(post.description).date)
    if (parsed && (!earliest || parsed < earliest)) earliest = parsed
  }
  return earliest
}

function dayModel(date, locale, byDate, inMonth = true) {
  const iso = toIsoDateKey(date)
  return {
    key: iso.replace(/-/g, '_'),
    dateKey: iso,
    dayNum: date.getDate(),
    inMonth,
    shortLabel: formatDayTab(date, locale),
    label: date.toLocaleDateString(locale === 'km' ? 'km-KH' : 'en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }),
    slots: byDate.get(iso) ?? [],
  }
}

/** 7-day week grid anchored on Monday */
export function buildWeekGridFromPosts(posts = [], weekAnchor = new Date(), locale = 'en') {
  const byDate = indexPostsByDate(posts)
  const monday = mondayOfWeek(weekAnchor)
  const sunday = addDays(monday, 6)

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = addDays(monday, i)
    return dayModel(d, locale, byDate, true)
  })

  const scheduleData = Object.fromEntries(days.map((day) => [day.key, day.slots]))
  const maxRows = Math.max(1, ...Object.values(scheduleData).map((c) => c.length))

  return {
    days,
    scheduleData,
    weekRange: formatReportWeekRange(monday, sunday, locale),
    maxRows,
  }
}

/** Full calendar month (Mon-start weeks including leading/trailing days) */
export function buildMonthGridFromPosts(posts = [], monthAnchor = new Date(), locale = 'en') {
  const byDate = indexPostsByDate(posts)
  const year = monthAnchor.getFullYear()
  const month = monthAnchor.getMonth()
  const firstOfMonth = new Date(year, month, 1)
  const lastOfMonth = new Date(year, month + 1, 0)
  const gridStart = mondayOfWeek(firstOfMonth)
  const gridEnd = sundayOfWeek(lastOfMonth)

  const days = []
  for (let d = new Date(gridStart); d <= gridEnd; d = addDays(d, 1)) {
    days.push(dayModel(d, locale, byDate, d.getMonth() === month))
  }

  const weeks = []
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7))
  }

  return {
    days,
    weeks,
    monthLabel: formatReportMonthLabel(firstOfMonth, locale),
    weekdayLabels: weekdayHeaders(locale),
  }
}

/** Twelve-month session counts for yearly report calendar */
export function buildYearGridFromPosts(posts = [], yearAnchor = new Date(), locale = 'en') {
  const year = yearAnchor.getFullYear()
  const loc = locale === 'km' ? 'km-KH' : 'en-US'

  const months = Array.from({ length: 12 }, (_, month) => {
    const monthStart = new Date(year, month, 1)
    const monthEnd = new Date(year, month + 1, 0)
    monthEnd.setHours(23, 59, 59, 999)

    const count = posts.filter((post) => {
      const parsed = parseScheduleDate(parsePostScheduleMeta(post.description).date)
      if (!parsed) return false
      return parsed >= monthStart && parsed <= monthEnd
    }).length

    return {
      month,
      key: `${year}-${month}`,
      shortLabel: monthStart.toLocaleDateString(loc, { month: 'short' }).replace(/\./g, ''),
      fullLabel: formatReportMonthLabel(monthStart, locale),
      count,
    }
  })

  const total = months.reduce((sum, row) => sum + row.count, 0)

  return {
    year,
    yearLabel: formatReportYearLabel(yearAnchor, locale),
    months,
    total,
  }
}

/** @deprecated use buildWeekGridFromPosts with weekAnchor */
export function buildWeeklyGridFromPosts(posts = [], locale = 'en', weekAnchor = null) {
  const anchor = weekAnchor ?? findEarliestPostDate(posts) ?? new Date()
  return buildWeekGridFromPosts(posts, anchor, locale)
}

/** Portfolio rows → credentials tab items */
export function mapPortfolioToCredentials(portfolio = []) {
  return (portfolio ?? [])
    .filter(
      (item) =>
        item.link?.trim() ||
        item.title?.trim() ||
        item.description?.trim() ||
        (item.files?.length ?? 0) > 0
    )
    .map((item) => {
      const link = String(item.link ?? '').trim()
      const fileUrl = item.files?.[0]?.url ?? null
      const kind = detectPortfolioLinkKind(link)
      const { Icon } = portfolioKindMeta(kind)
      const title = portfolioDisplayTitle(item)
      const desc = String(item.description ?? '').trim()
      const sub =
        (desc && desc !== title ? desc.slice(0, 120) : null) ||
        (portfolioDisplaySubtitle(item) !== title ? portfolioDisplaySubtitle(item) : null)
      return {
        icon: link ? Icon : Award,
        text: title,
        sub,
        href: link || fileUrl || null,
      }
    })
}

/** Published mentor posts → profile availability cards (date/time + teaching topic). */
export function mapPostsToAvailabilitySlots(posts = [], lang = 'en') {
  if (!Array.isArray(posts)) return []

  return posts
    .map((post) => {
      const meta = parsePostScheduleMeta(post.description)
      const label = meta.timeLabel || [meta.date, meta.time].filter(Boolean).join(' · ')
      if (!label) return null

      const subSkillRow = post.SubSkill ?? post.sub_skill ?? {}
      const skillRow = subSkillRow.Skill ?? subSkillRow.skill ?? {}
      const subName = skillRowLabel(subSkillRow, lang)
      const skillParent = skillRowLabel(skillRow, lang)
      const subject =
        skillParent && subName ? `${skillParent} · ${subName}` : subName || skillParent || ''
      const title = String(post.title ?? '').trim()
      const topic = title || subject

      return {
        id: post.post_id ?? post.id,
        label,
        date: meta.date,
        time: meta.time,
        title,
        subject,
        topic,
        notes: meta.notes?.trim() || '',
        postId: post.post_id ?? post.id,
      }
    })
    .filter(Boolean)
}

/** Mentor posts → search results "Posts" tab rows */
export function mapPostsToSearchResults(posts = [], lang = 'en') {
  if (!Array.isArray(posts)) return []

  return posts.map((post) => {
    const meta = parsePostScheduleMeta(post.description)
    const mentor = post.Mentor ?? post.mentor
    const { firstName, lastName } = mentorNamesDbToUi(mentor ?? {})
    const author = formatMentorDisplayName({ firstName, lastName }) || 'Teacher'
    const subName = skillRowLabel(post.SubSkill ?? post.sub_skill ?? {}, lang)
    const preview =
      meta.notes ||
      meta.timeLabel ||
      [subName, post.Province?.province_name].filter(Boolean).join(' · ') ||
      String(post.description ?? '').slice(0, 120)

    return {
      id: post.post_id ?? post.id,
      title: post.title ?? 'Session',
      preview,
      author,
      mentorId: post.user_id ?? mentor?.user_id,
    }
  })
}

/** Mentor posts → teacher dashboard session rows (no booking — location instead of student count) */
export function mapPostsToSessionRows(
  posts = [],
  { lang = 'en', onlineLabel = 'Online' } = {}
) {
  if (!Array.isArray(posts)) return []

  return posts.map((post, idx) => {
    const meta = parsePostScheduleMeta(post.description)
    const date = meta.date || '—'
    const time = meta.time || '—'
    const status =
      post.status === 'draft'
        ? 'Pending'
        : post.status === 'cancelled' || post.status === 'canceled'
          ? 'Cancelled'
          : 'Active'

    const provinceRow = post.Province ?? post.province ?? null
    const location = provinceRow?.province_name
      ? provinceRowLabel(provinceRow, lang)
      : onlineLabel

    return {
      id: post.post_id ?? post.id ?? idx,
      postId: post.post_id ?? post.id,
      date,
      time,
      subject: post.title ?? '—',
      location,
      status,
    }
  })
}

/** Group posts by week (Mon–Sun) for analytics / report grid — see buildWeekGridFromPosts */
