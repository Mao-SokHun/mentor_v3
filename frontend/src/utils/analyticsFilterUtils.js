import { skillRowLabel } from '@/services/mentors/mentorService'
import { parsePostScheduleMeta } from '@/utils/mentorPostMapper'
import { parseScheduleDate } from '@/utils/mentorDetailUtils'

export const DATE_RANGE_ALL = 'all'
export const DATE_RANGE_LAST_7 = 'last7'
export const DATE_RANGE_LAST_30 = 'last30'
export const DATE_RANGE_LAST_3M = 'last3m'
export const DATE_RANGE_LAST_YEAR = 'lastYear'

export const SUBJECT_ALL = '__all__'
export const STATUS_ALL = '__all__'

export const DEFAULT_ANALYTICS_FILTERS = {
  dateRange: DATE_RANGE_LAST_7,
  subject: SUBJECT_ALL,
  status: STATUS_ALL,
}

/** Session date from post description, else created_at */
export function getPostSessionDate(post) {
  const meta = parsePostScheduleMeta(post?.description)
  const fromSchedule = parseScheduleDate(meta.date)
  if (fromSchedule) return fromSchedule

  const created = post?.created_at ?? post?.createdAt
  if (!created) return null
  const d = new Date(created)
  if (Number.isNaN(d.getTime())) return null
  d.setHours(0, 0, 0, 0)
  return d
}

export function getPostSubjectLabel(post, lang = 'en') {
  const title = post?.title?.trim()
  if (title) return title
  return skillRowLabel(post?.SubSkill ?? post?.sub_skill ?? {}, lang)
}

/** Major · subject from post skill rows (DB), then title fallback — for subject breakdown charts */
export function getPostSkillSubjectLine(post, lang = 'en') {
  const subSkillRow = post?.SubSkill ?? post?.sub_skill ?? {}
  const skillRow = subSkillRow.Skill ?? subSkillRow.skill ?? {}
  const subName = skillRowLabel(subSkillRow, lang)
  const skillParent = skillRowLabel(skillRow, lang)

  if (skillParent && subName) return `${skillParent} · ${subName}`
  if (subName) return subName
  if (skillParent) return skillParent

  return post?.title?.trim() || ''
}

export function getPostSubjectGroupKey(post) {
  const subSkillId = post?.sub_skill_id ?? post?.SubSkill?.sub_skill_id
  if (subSkillId != null) return `sub:${subSkillId}`
  const line = getPostSkillSubjectLine(post, 'en')
  return line ? `label:${line.toLowerCase()}` : 'other'
}

/** Active | Pending | Cancelled */
export function getPostStatusLabel(post) {
  const raw = String(post?.status ?? 'published').toLowerCase()
  if (raw === 'draft') return 'Pending'
  if (raw === 'cancelled' || raw === 'canceled' || raw === 'archived') return 'Cancelled'
  return 'Active'
}

function startOfDateRange(rangeKey) {
  if (!rangeKey || rangeKey === DATE_RANGE_ALL) return null

  const start = new Date()
  start.setHours(0, 0, 0, 0)

  switch (rangeKey) {
    case DATE_RANGE_LAST_7:
      start.setDate(start.getDate() - 6)
      return start
    case DATE_RANGE_LAST_30:
      start.setDate(start.getDate() - 29)
      return start
    case DATE_RANGE_LAST_3M:
      start.setMonth(start.getMonth() - 3)
      return start
    case DATE_RANGE_LAST_YEAR:
      start.setFullYear(start.getFullYear() - 1)
      return start
    default:
      return null
  }
}

export function postMatchesDateRange(post, rangeKey) {
  const start = startOfDateRange(rangeKey)
  if (!start) return true

  const sessionDate = getPostSessionDate(post)
  if (!sessionDate) return false

  const end = new Date()
  end.setHours(23, 59, 59, 999)
  return sessionDate >= start && sessionDate <= end
}

export function postMatchesSubject(post, subjectFilter, lang = 'en') {
  if (!subjectFilter || subjectFilter === SUBJECT_ALL) return true
  const label = getPostSubjectLabel(post, lang)
  return label.toLowerCase() === String(subjectFilter).toLowerCase()
}

export function postMatchesStatus(post, statusFilter) {
  if (!statusFilter || statusFilter === STATUS_ALL) return true
  return getPostStatusLabel(post) === statusFilter
}

export function filterAnalyticsPosts(posts = [], filters = DEFAULT_ANALYTICS_FILTERS, lang = 'en') {
  return posts.filter(
    (post) =>
      postMatchesDateRange(post, filters.dateRange) &&
      postMatchesSubject(post, filters.subject, lang) &&
      postMatchesStatus(post, filters.status)
  )
}

export function buildSubjectFilterOptions(posts = [], allLabel, lang = 'en') {
  const labels = new Set()
  for (const post of posts) {
    const label = getPostSubjectLabel(post, lang)
    if (label) labels.add(label)
  }
  return [
    { value: SUBJECT_ALL, label: allLabel },
    ...[...labels].sort((a, b) => a.localeCompare(b)).map((label) => ({ value: label, label })),
  ]
}

export function buildStatusFilterOptions(posts = [], { allLabel, activeLabel, pendingLabel, cancelledLabel }) {
  const seen = new Set()
  for (const post of posts) {
    seen.add(getPostStatusLabel(post))
  }

  const order = ['Active', 'Pending', 'Cancelled']
  const labelMap = {
    Active: activeLabel,
    Pending: pendingLabel,
    Cancelled: cancelledLabel,
  }

  return [
    { value: STATUS_ALL, label: allLabel },
    ...order
      .filter((key) => seen.has(key))
      .map((key) => ({ value: key, label: labelMap[key] ?? key })),
  ]
}

export function computeFilteredPostStats(posts = []) {
  const active = posts.filter((p) => getPostStatusLabel(p) === 'Active').length
  const weeks = new Set()
  for (const post of posts) {
    const d = getPostSessionDate(post)
    if (!d) continue
    const mon = new Date(d)
    const day = mon.getDay()
    const diff = day === 0 ? -6 : 1 - day
    mon.setDate(mon.getDate() + diff)
    weeks.add(`${mon.getFullYear()}-${mon.getMonth()}-${mon.getDate()}`)
  }
  const weekCount = weeks.size || 1
  return {
    totalPosts: posts.length,
    activeSessions: active,
    avgPerWeek: posts.length ? Math.round((posts.length / weekCount) * 10) / 10 : 0,
  }
}
