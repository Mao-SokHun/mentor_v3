import {
  formatMentorDisplayName,
  mentorNamesDbToUi,
  parseMentorDescription as parseMentorDescriptionFromApi,
} from '@/lib/mentorApiMap'
import { skillRowLabel } from '@/services/mentors/mentorService'
import { provinceRowLabel } from '@/utils/provinceOptions'
import { resolveProfilePictureUrl } from '@/utils/profilePictureUtils'

/** @deprecated Import from @/lib/mentorApiMap — re-exported for existing imports */
export function parseMentorDescription(description = '') {
  return parseMentorDescriptionFromApi(description)
}

/** MentorSkill API row → localized names + raw rows for language switching */
function namesFromMentorSkillRow(row, lang = 'en') {
  const sub = row?.SubSkill ?? row?.subSkill ?? {}
  const skill = row?.Skill ?? sub?.Skill ?? sub?.skill ?? {}
  return {
    skillId: row?.skill_id ?? skill?.skill_id ?? sub?.skill_id ?? null,
    subSkillId: row?.sub_skill_id ?? sub?.sub_skill_id ?? null,
    skillRow: skill,
    subSkillRow: sub,
    skillName: skillRowLabel(skill, lang),
    subSkillName: skillRowLabel(sub, lang),
  }
}

function mentorSkillRowsFromApi(mentor) {
  return mentor?.MentorSkills ?? mentor?.mentorSkills ?? mentor?.mentor_skills ?? []
}

function resolveMentorLocation(mentor, lang = 'en') {
  const provinceRow = mentor?.provinceRow ?? mentor?.Province ?? mentor?.province ?? null
  if (provinceRow?.province_name || provinceRow?.name) {
    return provinceRowLabel(provinceRow, lang)
  }
  return String(mentor?.location ?? mentor?.province ?? mentor?.address ?? '').trim()
}

/** Re-apply skill/sub-skill labels for the active UI language */
export function localizeMentor(mentor, lang = 'en') {
  if (!mentor) return mentor

  const skillItems = (mentor.skillItems ?? []).map((item) => ({
    ...item,
    skillName: item.skillRow
      ? skillRowLabel(item.skillRow, lang)
      : String(item.skillName ?? '').trim(),
    subSkillName: item.subSkillRow
      ? skillRowLabel(item.subSkillRow, lang)
      : String(item.subSkillName ?? '').trim(),
  }))

  const location = resolveMentorLocation(mentor, lang)
  const next = {
    ...mentor,
    location: location || mentor.location || mentor.province || '',
    province: location || mentor.province || mentor.location || '',
  }

  if (!skillItems.length) return next

  const primary = skillItems[0]
  const subjects = skillItems.map((item) => item.subSkillName).filter(Boolean)

  return {
    ...next,
    major: primary.skillName || mentor.major,
    subject: primary.subSkillName || mentor.subject,
    subjects: subjects.length ? subjects : mentor.subjects,
    skillItems,
  }
}

/** Merge GET /mentors/:id/skills rows onto a mapped mentor profile (DB source of truth). */
export function applyMentorSkillRows(profile, mentorSkillRows = [], lang = 'en') {
  if (!profile || !Array.isArray(mentorSkillRows) || mentorSkillRows.length === 0) {
    return profile
  }

  const items = mentorSkillRows.map((row) => namesFromMentorSkillRow(row, lang)).filter(
    (item) => item.skillName || item.subSkillName
  )
  if (!items.length) return profile

  const primary = items[0]
  const subjects = items.map((item) => item.subSkillName).filter(Boolean)

  return {
    ...profile,
    major: primary.skillName || profile.major,
    subject: primary.subSkillName || profile.subject,
    skillId: primary.skillId ?? profile.skillId,
    subSkillId: primary.subSkillId ?? profile.subSkillId,
    subjects: subjects.length ? subjects : profile.subjects,
    skillItems: items,
  }
}

/** Backend mentor row → MentorCard / MentorList shape */
export function mapMentorToListItem(mentor, lang = 'en') {
  if (!mentor) return null

  const id = String(mentor.user_id ?? mentor.id ?? '')
  const { firstName, lastName } = mentorNamesDbToUi(mentor)
  const name = formatMentorDisplayName({ firstName, lastName }) || 'Teacher'
  const parsed = parseMentorDescription(mentor.description ?? '')
  const skillRows = mentorSkillRowsFromApi(mentor)
  const provinceRow = mentor?.Province ?? mentor?.province ?? null
  const location = resolveMentorLocation(
    { ...mentor, provinceRow, location: mentor?.location, province: mentor?.province },
    lang
  )

  const base = {
    id,
    userId: mentor.user_id ?? mentor.id,
    name,
    firstName,
    lastName,
    title: '',
    major: parsed.major || '',
    subject: parsed.subject || '',
    subjects: parsed.subject ? [parsed.subject] : parsed.subjects ?? [],
    bio: parsed.bio,
    workOrganization: parsed.workOrganization,
    workPosition: parsed.workPosition,
    location,
    province: location,
    provinceId: mentor.province_id ?? provinceRow?.province_id ?? null,
    provinceRow,
    experience: mentor.experience_years ?? 0,
    experienceYears: mentor.experience_years ?? 0,
    rating: mentor.rating ?? 0,
    reviewCount: mentor.review_count ?? mentor.reviewCount ?? 0,
    students: mentor.students ?? 0,
    verified: Boolean(mentor.verified),
    online: false,
    avatarUrl: resolveProfilePictureUrl(mentor.profile_picture),
    gender: mentor.gender ?? '',
    phone: mentor.phone_number ?? '',
    description: mentor.description ?? '',
  }

  if (skillRows.length) {
    return applyMentorSkillRows(base, skillRows, lang)
  }

  return base
}

export function mapMentorsToList(rows, lang = 'en') {
  if (!Array.isArray(rows)) return []
  return rows.map((row) => mapMentorToListItem(row, lang)).filter(Boolean)
}
