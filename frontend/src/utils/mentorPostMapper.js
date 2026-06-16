import { mapMentorToListItem } from '@/utils/mentorMapper'
import { skillRowLabel } from '@/services/mentors/mentorService'
import { FILTER_ALL } from '@/constants'
import { formatTimeRange, getTimeRangeSortKey, normalizeTimeValue } from '@/utils/timeRangeUtils'

/** Parse description written by MentorCreatePost (Date:/TimeStart:/TimeEnd: lines). */
export function parsePostScheduleMeta(description = '') {
  const text = String(description ?? '')
  let date = ''
  let timeStart = ''
  let timeEnd = ''
  let legacyTime = ''
  const noteParts = []

  for (const line of text.split('\n')) {
    const trimmed = line.trim()
    if (trimmed.startsWith('Date:')) date = trimmed.slice(5).trim()
    else if (trimmed.startsWith('TimeStart:')) timeStart = normalizeTimeValue(trimmed.slice(10).trim())
    else if (trimmed.startsWith('TimeEnd:')) timeEnd = normalizeTimeValue(trimmed.slice(8).trim())
    else if (trimmed.startsWith('Time:')) legacyTime = trimmed.slice(5).trim()
    else if (trimmed) noteParts.push(trimmed)
  }

  if (!timeStart && legacyTime) {
    const parts = legacyTime.split(/\s*[–—-]\s/).map(normalizeTimeValue).filter(Boolean)
    timeStart = parts[0] ?? ''
    timeEnd = parts[1] ?? timeEnd
  }

  const time = formatTimeRange(timeStart, timeEnd) || legacyTime
  const sortKey = getTimeRangeSortKey(timeStart, timeEnd, legacyTime)
  const timeLabel = [date, time].filter(Boolean).join(' · ') || null

  return {
    date,
    time,
    timeStart,
    timeEnd,
    sortKey,
    timeLabel,
    notes: noteParts.join('\n'),
  }
}

/** Post notes line for schedule cards — skip empty / default / "online class" placeholders */
export function resolveSessionNotes(notes, t) {
  const text = String(notes ?? '').trim()
  if (!text) return ''
  const defaultBio = t?.('mentorCard.defaultBio') ?? ''
  if (text === defaultBio || /^online\s*class$/i.test(text)) return ''
  return text
}

/** Load mentor post into create/edit schedule form fields */
export function postToScheduleFormValues(post) {
  if (!post) return null
  const meta = parsePostScheduleMeta(post.description)
  return {
    subject: post.title?.trim() ?? '',
    date: meta.date ?? '',
    startTime: meta.timeStart || '08:00',
    endTime: meta.timeEnd || '10:00',
    notes: meta.notes ?? '',
    provinceId: String(post.province_id ?? post.Province?.province_id ?? ''),
    subSkillId: String(post.sub_skill_id ?? post.SubSkill?.sub_skill_id ?? ''),
    status: post.status ?? 'published',
  }
}

/** mentor_post row (+ nested Mentor) → schedule grid card payload */
export function mapPostToScheduleItem(post, lang = 'en') {
  if (!post) return null

  const mentorRow = post.Mentor ?? post.mentor
  const mentor = mentorRow ? mapMentorToListItem(mentorRow) : null
  if (!mentor) return null

  const meta = parsePostScheduleMeta(post.description)
  const subSkillRow = post.SubSkill ?? post.sub_skill ?? {}
  const skillRow = subSkillRow.Skill ?? subSkillRow.skill ?? {}
  const subName = skillRowLabel(subSkillRow, lang)
  const skillParent = skillRowLabel(skillRow, lang)

  return {
    postId: post.post_id ?? post.id,
    mentor: {
      ...mentor,
      bio: meta.notes || post.description || mentor.bio,
      subject: subName || mentor.subject,
      major: skillParent || mentor.major,
      title: post.title || mentor.title,
    },
    timeSlot: meta.timeLabel || meta.time || FILTER_ALL.time,
    title: post.title ?? '',
    provinceName: post.Province?.province_name ?? '',
    sessionNotes: resolveSessionNotes(meta.notes),
  }
}

export function mapPostsToScheduleItems(posts = [], lang = 'en') {
  if (!Array.isArray(posts)) return []
  return posts.map((post) => mapPostToScheduleItem(post, lang)).filter(Boolean)
}
