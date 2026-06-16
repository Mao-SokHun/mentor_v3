import { mapMentorToListItem } from '@/utils/mentorMapper'
import { skillRowLabel } from '@/services/mentors/mentorService'
import { parsePostScheduleMeta } from '@/utils/mentorPostMapper'
import { formatTimeRange } from '@/utils/timeRangeUtils'
import { provinceRowLabel } from '@/utils/provinceOptions'

/** Published mentor post → schedule detail page model */
export function mapPostToScheduleDetail(
  post,
  { t, mentor: mentorFromApi, lang = 'en' } = {}
) {
  if (!post) return null

  const meta = parsePostScheduleMeta(post.description)
  const mentorRow = post.Mentor ?? post.mentor
  const mentor =
    mentorFromApi ?? (mentorRow ? mapMentorToListItem(mentorRow, lang) : null)
  const userId = post.user_id ?? post.userId ?? mentor?.id

  const subSkillRow = post.SubSkill ?? post.sub_skill ?? {}
  const skillRow = subSkillRow.Skill ?? subSkillRow.skill ?? {}
  const skillName = skillRowLabel(skillRow, lang) || mentor?.major || ''
  const subSkillName = skillRowLabel(subSkillRow, lang) || mentor?.subject || ''
  const provinceRow = post.Province ?? post.province ?? null
  const provinceName = provinceRow?.province_name
    ? provinceRowLabel(provinceRow, lang)
    : String(mentor?.province ?? mentor?.location ?? '').trim()

  const timeDisplay =
    meta.time ||
    formatTimeRange(meta.timeStart, meta.timeEnd) ||
    ''

  const notes = meta.notes?.trim() || ''
  const defaultBio = t?.('mentorCard.defaultBio') ?? ''
  const sessionNotes =
    notes && notes !== defaultBio && !/^online\s*class$/i.test(notes) ? notes : ''

  return {
    postId: post.post_id ?? post.id,
    title: post.title?.trim() || subSkillName || skillName || t?.('student.schedulePostsTitle') || 'Session',
    sessionDate: meta.date || '',
    timeDisplay,
    timeLabel: meta.timeLabel || [meta.date, timeDisplay].filter(Boolean).join(' · '),
    skillName,
    subSkillName,
    provinceName,
    sessionNotes,
    mentor: mentor ? { ...mentor, id: userId ?? mentor.id } : null,
    status: post.status ?? 'published',
  }
}
