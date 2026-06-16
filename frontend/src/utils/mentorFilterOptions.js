import { FILTER_ALL, DEFAULT_FILTER_OPTION_SET } from '@/constants'
import {
  flattenSubSkillOptions,
  buildSkillOptions,
  subSkillRowLabel,
  parentSkillRowLabel,
  catalogRowLabelWithFallback,
} from '@/services/mentors/mentorService'
import { buildProvinceFilterOptionObjects, buildProvinceOptionObjects } from '@/utils/provinceOptions'

/** Province rows → filter value strings (English names for API/client matching). */
export function buildProvinceFilterValues(provinces = []) {
  const names = provinces
    .map((row) => String(row.province_name ?? row.name ?? '').trim())
    .filter(Boolean)
  return [FILTER_ALL.location, ...[...new Set(names)].sort((a, b) => a.localeCompare(b))]
}

export { buildProvinceOptionObjects, buildProvinceFilterOptionObjects, provinceRowLabel } from '@/utils/provinceOptions'

function subsFromSkillRow(skill) {
  return skill?.SubSkills ?? skill?.sub_skills ?? skill?.subSkills ?? []
}

/**
 * Major filter options — value = skill_id (string) so EN/KH labels never drift.
 * Users pick from DB catalog only (SearchFilter uses SearchableSelect without allowCustom).
 */
export function buildMajorFilterOptionObjects(catalog = [], lang = 'en') {
  const options = buildSkillOptions(catalog, lang)
    .filter((o) => o.value > 0 && o.label)
    .map((o) => ({
      value: String(o.value),
      label: o.label,
    }))
  return [{ value: FILTER_ALL.major, label: FILTER_ALL.major }, ...options]
}

/** @deprecated Use buildMajorFilterOptionObjects — kept for callers expecting string values */
export function buildMajorFilterValues(catalog = [], lang = 'en') {
  return buildMajorFilterOptionObjects(catalog, lang).map((o) => o.value)
}

/**
 * Subject filter options — value = sub_skill_id (string).
 * Label is localized; value is stable ID for API + client matching.
 */
export function getSubjectFilterOptionObjects(catalog = [], major, lang = 'en') {
  if (!catalog?.length) {
    return [{ value: FILTER_ALL.subject, label: FILTER_ALL.subject }]
  }

  if (!major || major === FILTER_ALL.major) {
    return [
      { value: FILTER_ALL.subject, label: FILTER_ALL.subject },
      ...flattenSubSkillOptions(catalog, lang)
        .filter((o) => o.value > 0 && o.label)
        .map((o) => ({
          value: String(o.value),
          label: o.label,
        })),
    ]
  }

  const majorId = parseInt(String(major), 10)
  const parent = !Number.isNaN(majorId) && majorId > 0
    ? catalog.find((row) => Number(row.skill_id ?? row.id) === majorId)
    : catalog.find((row) => {
        const en = parentSkillRowLabel(row, 'en').toLowerCase()
        const kh = parentSkillRowLabel(row, 'km').toLowerCase()
        const needle = String(major).trim().toLowerCase()
        return en === needle || kh === needle
      })

  if (!parent) return [{ value: FILTER_ALL.subject, label: FILTER_ALL.subject }]

  const subs = subsFromSkillRow(parent)
  return [
    { value: FILTER_ALL.subject, label: FILTER_ALL.subject },
    ...subs
      .map((sub) => {
        const id = sub.sub_skill_id ?? sub.id
        const label = catalogRowLabelWithFallback(sub, lang)
        if (!id || !label) return null
        return { value: String(id), label }
      })
      .filter(Boolean)
      .sort((a, b) => a.label.localeCompare(b.label)),
  ]
}

/** Subject filter value list (IDs + sentinel). */
export function getSubjectFilterOptionsFromCatalog(catalog = [], major, lang = 'en') {
  return getSubjectFilterOptionObjects(catalog, major, lang).map((o) => o.value)
}

/** Merge DB catalog into default filter option set (keeps sort/time/type from static list). */
export function buildMentorFilterOptionSet(catalog = [], provinces = [], lang = 'en') {
  const hasCatalog = catalog?.length > 0
  const hasProvinces = provinces?.length > 0

  return {
    ...DEFAULT_FILTER_OPTION_SET,
    majors: hasCatalog
      ? buildMajorFilterOptionObjects(catalog, lang)
      : DEFAULT_FILTER_OPTION_SET.majors,
    subjects: hasCatalog
      ? getSubjectFilterOptionObjects(catalog, FILTER_ALL.major, lang)
      : DEFAULT_FILTER_OPTION_SET.subjects,
    locations: hasProvinces
      ? buildProvinceFilterOptionObjects(provinces, lang)
      : DEFAULT_FILTER_OPTION_SET.locations,
  }
}
