import { FILTER_ALL } from '@/constants'

function parseFilterNumericId(value) {
  const n = parseInt(String(value ?? ''), 10)
  return !Number.isNaN(n) && n > 0 ? n : null
}

function mentorHasSkillId(mentor, skillId) {
  if (!skillId) return true
  if (Number(mentor.skillId) === skillId) return true
  return (mentor.skillItems ?? []).some((item) => Number(item.skillId) === skillId)
}

function mentorHasSubSkillId(mentor, subSkillId) {
  if (!subSkillId) return true
  if (Number(mentor.subSkillId) === subSkillId) return true
  return (mentor.skillItems ?? []).some((item) => Number(item.subSkillId) === subSkillId)
}

/** Match subject filter against teacher subject tags (partial / word / composite match) */
export function mentorMatchesSubject(mentorSubjects, subject, mentor = null) {
  if (!subject || subject === FILTER_ALL.subject) return true

  const subjectId = parseFilterNumericId(subject)
  if (subjectId != null && mentor) {
    return mentorHasSubSkillId(mentor, subjectId)
  }

  const needle = subject.toLowerCase().replace(/\./g, '').trim()
  const words = needle.split(/\s+/).filter((w) => w.length > 1)

  if (mentor?.major && mentor?.subject) {
    const composite = `${mentor.major} · ${mentor.subject}`.toLowerCase().replace(/\./g, '')
    if (composite === needle || composite.includes(needle) || needle.includes(composite)) {
      return true
    }
  }

  return mentorSubjects.some((raw) => {
    const hay = raw.toLowerCase().replace(/\./g, '')
    if (hay.includes(needle) || needle.includes(hay)) return true
    return words.some((w) => hay.includes(w))
  })
}

export function filterMentors(mentors, { major, subject, location, sort }) {
  const majorId = parseFilterNumericId(major)
  const subjectId = parseFilterNumericId(subject)

  let list = mentors.filter((t) => {
    if (major && major !== FILTER_ALL.major) {
      if (majorId != null) {
        if (!mentorHasSkillId(t, majorId)) return false
      } else if (t.major && t.major !== major) {
        return false
      }
    }
    if (subject && subject !== FILTER_ALL.subject) {
      if (subjectId != null) {
        if (!mentorHasSubSkillId(t, subjectId)) return false
      } else if (!mentorMatchesSubject(t.subjects ?? [], subject, t)) {
        return false
      }
    }
    if (location && location !== FILTER_ALL.location) {
      const mentorLoc = String(t.location || t.province || '').trim()
      if (
        mentorLoc &&
        mentorLoc.toLowerCase() !== String(location).trim().toLowerCase()
      ) {
        return false
      }
    }
    return true
  })

  switch (sort) {
    case 'Highest Rated':
      list = [...list].sort((a, b) => b.rating - a.rating)
      break
    case 'Most Popular':
    case 'Most Students':
      list = [...list].sort((a, b) => (b.students ?? 0) - (a.students ?? 0))
      break
    case 'Price: Low to High':
      list = [...list].sort((a, b) => (a.price ?? 0) - (b.price ?? 0))
      break
    case 'Price: High to Low':
      list = [...list].sort((a, b) => (b.price ?? 0) - (a.price ?? 0))
      break
    case 'Most Reviewed':
      list = [...list].sort((a, b) => (b.reviewCount ?? 0) - (a.reviewCount ?? 0))
      break
    default:
      break
  }

  return list
}
