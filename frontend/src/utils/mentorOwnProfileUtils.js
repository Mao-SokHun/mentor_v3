/** Education rows (degree, school) — skip period-only noise. */
export function resolveEducationForProfileView(education = []) {
  return (education ?? []).filter(
    (row) => String(row.role ?? '').trim() || String(row.org ?? '').trim()
  )
}

/** Work history rows from mentor_experiences only. */
export function resolveWorkExperienceForProfileView(work = []) {
  return (work ?? []).filter(
    (row) => String(row.role ?? '').trim() || String(row.org ?? '').trim()
  )
}

/** @deprecated Use resolveEducationForProfileView or resolveWorkExperienceForProfileView */
export function resolveExperienceForProfileView(experience = [], profile = {}) {
  const { education, work } = splitRowsByType(experience)
  const edu = resolveEducationForProfileView(education)
  if (edu.length) return edu
  return resolveWorkExperienceForProfileView(work)
}

function splitRowsByType(rows = []) {
  const education = []
  const work = []
  for (const row of rows ?? []) {
    if (row?.type === 'work') work.push(row)
    else education.push(row)
  }
  return { education, work }
}

import { displayProvinceLabel } from '@/utils/provinceOptions'

export function profileContactFields(profile = {}, t, lang = 'en') {
  const provinceLabel = displayProvinceLabel(profile.provinceRow ?? profile.province, lang)
  const rows = [
    { label: t('profile.email'), value: profile.email?.trim() },
    { label: t('profile.mobile'), value: profile.phone?.trim() },
    {
      label: t('filters.location'),
      value: provinceLabel,
    },
    { label: t('mentorProfile.gender'), value: profile.gender?.trim() },
  ].filter((row) => row.value)

  return rows
}

export function hasPortfolioItems(portfolio = []) {
  return portfolio.some(
    (item) =>
      item.link?.trim() ||
      item.title?.trim() ||
      item.description?.trim() ||
      (item.files?.length ?? 0) > 0
  )
}
