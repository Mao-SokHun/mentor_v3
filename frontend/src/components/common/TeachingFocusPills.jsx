import { BookOpen } from 'lucide-react'
import clsx from 'clsx'
import { skillRowLabel } from '@/services/mentors/mentorService'

function localizedSkillName(row, fallback = '', lang = 'en', labelFor) {
  if (
    row &&
    (row.skill_name != null ||
      row.skill_name_kh != null ||
      row.sub_skill_name != null ||
      row.sub_skill_name_kh != null)
  ) {
    return skillRowLabel(row, lang)
  }
  const text = String(fallback ?? '').trim()
  return text ? (labelFor ? labelFor(text) : text) : ''
}

/** Resolve skill (major) + subskill pairs from mentor row */
export function buildTeachingFocusRows({
  skillItems = [],
  major,
  subject,
  labelFor,
  lang = 'en',
}) {
  if (skillItems.length > 0) {
    return skillItems
      .map((item) => ({
        major: localizedSkillName(item.skillRow, item.skillName, lang, labelFor),
        subject: localizedSkillName(item.subSkillRow, item.subSkillName, lang, labelFor),
      }))
      .filter((row) => row.major || row.subject)
  }

  const majorLabel = labelFor ? labelFor(major) : major
  const subjectLabel = labelFor ? labelFor(subject) : subject
  if (majorLabel || subjectLabel) {
    return [{ major: majorLabel, subject: subjectLabel }]
  }
  return []
}

/** Flat subject/skill tags for home row cards (Figma style). */
export function buildHomeCardSubjectTags({
  skillItems = [],
  subjects = [],
  major,
  subject,
  labelFor,
  lang = 'en',
}) {
  const tags = []

  if (skillItems.length > 0) {
    skillItems.forEach((item) => {
      const sub = localizedSkillName(item.subSkillRow, item.subSkillName, lang, labelFor)
      if (sub) tags.push(sub)
      else {
        const skill = localizedSkillName(item.skillRow, item.skillName, lang, labelFor)
        if (skill) tags.push(skill)
      }
    })
  } else if (subjects?.length > 0) {
    subjects.forEach((s) => {
      const label = labelFor ? labelFor(s) : s
      if (label) tags.push(label)
    })
  } else {
    const sub = labelFor ? labelFor(subject) : subject
    const maj = labelFor ? labelFor(major) : major
    if (sub) tags.push(sub)
    if (maj && maj !== sub) tags.push(maj)
  }

  return [...new Set(tags)].slice(0, 3)
}

export default function TeachingFocusPills({
  rows = [],
  majorLabel,
  subjectLabel,
  size = 'sm',
  className,
}) {
  if (!rows.length) return null

  const isMd = size === 'md'

  return (
    <div className={clsx('flex flex-col gap-2', className)}>
      {rows.map((row, index) => (
        <div
          key={`${row.major}-${row.subject}-${index}`}
          className="flex flex-wrap items-center gap-2"
        >
          {row.major ? (
            <span
              className={clsx(
                'inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50/90 shadow-sm',
                isMd ? 'px-4 py-2' : 'px-3 py-1.5'
              )}
            >
              <BookOpen
                className={clsx('shrink-0 text-slate-500', isMd ? 'h-4 w-4' : 'h-3.5 w-3.5')}
                aria-hidden
              />
              <span
                className={clsx(
                  'font-bold uppercase tracking-wide text-slate-400',
                  isMd ? 'text-xs' : 'text-[10px]'
                )}
              >
                {majorLabel}
              </span>
              <span
                className={clsx('font-semibold text-slate-800', isMd ? 'text-sm' : 'text-xs')}
              >
                {row.major}
              </span>
            </span>
          ) : null}
          {row.subject ? (
            <span
              className={clsx(
                'inline-flex items-center gap-1.5 rounded-full border border-teal-100 bg-teal-50 shadow-sm',
                isMd ? 'px-4 py-2' : 'px-3 py-1.5'
              )}
            >
              <span
                className={clsx(
                  'font-bold uppercase tracking-wide text-teal-600',
                  isMd ? 'text-xs' : 'text-[10px]'
                )}
              >
                {subjectLabel}
              </span>
              <span
                className={clsx('font-semibold text-teal-800', isMd ? 'text-sm' : 'text-xs')}
              >
                {row.subject}
              </span>
            </span>
          ) : null}
        </div>
      ))}
    </div>
  )
}
