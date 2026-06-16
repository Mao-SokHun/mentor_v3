import { skillRowLabel } from '@/services/mentors/mentorService'
import { parsePostScheduleMeta } from '@/utils/mentorPostMapper'
import { compareTimeSortKeys, formatTimeRange } from '@/utils/timeRangeUtils'

/** mentor_post rows → sidebar cards on My Profile */
export function mapPublishedPostsToProfileSlots(posts = [], lang = 'en') {
  if (!Array.isArray(posts)) return []

  return posts
    .map((post) => {
      const meta = parsePostScheduleMeta(post.description)
      const time =
        meta.time || formatTimeRange(meta.timeStart, meta.timeEnd) || ''
      const subSkillRow = post.SubSkill ?? post.sub_skill ?? {}
      const skillRow = subSkillRow.Skill ?? subSkillRow.skill ?? {}
      const subName = skillRowLabel(subSkillRow, lang)
      const skillParent = skillRowLabel(skillRow, lang)
      const subjectLabel =
        skillParent && subName ? `${skillParent} · ${subName}` : subName || skillParent || ''
      const title = String(post.title ?? '').trim()
      return {
        id: post.post_id ?? post.id,
        day: meta.date,
        time,
        subject: title || subjectLabel,
        skill: subjectLabel,
        notes: meta.notes?.trim() || '',
        sessionDate: meta.date || '',
        timeSortKey: meta.sortKey || '99:99',
      }
    })
    .sort((a, b) => {
      const dateCmp = String(a.sessionDate).localeCompare(String(b.sessionDate))
      if (dateCmp !== 0) return dateCmp
      return compareTimeSortKeys(a.timeSortKey, b.timeSortKey)
    })
}
