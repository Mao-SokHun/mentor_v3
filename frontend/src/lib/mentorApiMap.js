/**
 * Teacher UI ↔ mentor table (`backend-rokkru-auth-intergrate/models/mentorModel.js`).
 * Do not change backend here — map UI fields to existing columns until new columns exist.
 *
 * DB columns: user_id, firstname, lastname, gender, phone_number, province_id,
 *             experience_years, description, profile_picture
 *
 * Name columns (Khmer convention on backend):
 *   DB firstname = family name (ត្រកូល)  ↔  UI lastName
 *   DB lastname  = given name (ឈ្មោះ)   ↔  UI firstName
 *
 * UI-only (stored in `description` until backend adds columns):
 *   major, subject, bio, workOrganization, workPosition
 *
 * `mentor.description` is the bio field ("ព័ត៌មានលម្អិតអំពីអ្នក") — no separate title column.
 */

import { getPhoneDigits } from '@/utils/phoneInput'
import { validateMentorOnboardingStep1 as validateMentorOnboardingStep1Shared } from '@/lib/validation/mentor/index.js'

/** @typedef {{ id: number|string, role: string, org: string, period: string }} ExperienceItem */

/** @typedef {Object} TeacherProfileUI
 * @property {string} [firstName]
 * @property {string} [lastName]
 * @property {string} [name]
 * @property {string} [title]
 * @property {string} [phone]
 * @property {string} [gender]
 * @property {number} [experienceYears]
 * @property {string} [workOrganization]
 * @property {string} [workPosition]
 * @property {ExperienceItem[]} [experience]
 * @property {string} [major]
 * @property {string} [subject]
 * @property {string} [province]
 * @property {string} [bio]
 */

/** @typedef {Object} MentorApiPayload
 * @property {string} [firstname]
 * @property {string} [lastname]
 * @property {string} [gender]
 * @property {string} [phone_number]
 * @property {number} [province_id]
 * @property {number} [experience_years]
 * @property {string} [description]
 */

/** UI given/family names → mentor table columns */
export function mentorNamesUiToDb({ firstName = '', lastName = '' } = {}) {
  const given = String(firstName).trim()
  const family = String(lastName).trim()
  return {
    firstname: family || undefined,
    lastname: given || undefined,
  }
}

/** mentor table columns → UI given/family names */
export function mentorNamesDbToUi(row = {}, base = {}) {
  const given = row.lastname ?? row.lastName ?? base.firstName ?? ''
  const family = row.firstname ?? row.firstName ?? base.lastName ?? ''
  return {
    firstName: given,
    lastName: family,
  }
}

/**
 * Display name for mentor UI.
 * Khmer convention (default): family name (lastName) before given name (firstName).
 */
export function formatMentorDisplayName(
  { firstName = '', lastName = '' } = {},
  { familyFirst = true } = {}
) {
  const given = String(firstName).trim()
  const family = String(lastName).trim()
  if (!family && !given) return ''
  return familyFirst ? `${family} ${given}`.trim() : `${given} ${family}`.trim()
}

export const MENTOR_DB_FIELDS = [
  'user_id',
  'firstname',
  'lastname',
  'gender',
  'phone_number',
  'province_id',
  'experience_years',
  'description',
  'profile_picture',
]

const PREFIX = {
  title: 'Title: ',
  teaching: 'Teaching: ',
  organization: 'Organization: ',
  position: 'Position: ',
}

/** Parse mentor.description — plain bio, with legacy prefix stripping for old rows. */
export function parseMentorDescription(description = '') {
  const text = String(description).trim()
  const empty = {
    title: '',
    major: '',
    subject: '',
    bio: '',
    workOrganization: '',
    workPosition: '',
    subjects: [],
  }
  if (!text) return empty

  const lines = text.split('\n\n').filter(Boolean)
  let major = ''
  let subject = ''
  let workOrganization = ''
  let workPosition = ''
  const bioParts = []

  for (const line of lines) {
    if (line.startsWith(PREFIX.title)) continue
    if (line.startsWith(PREFIX.teaching)) {
      const parts = line.slice(PREFIX.teaching.length).split(' · ').map((p) => p.trim())
      major = parts[0] ?? ''
      subject = parts[1] ?? ''
    } else if (line.startsWith(PREFIX.organization)) {
      workOrganization = line.slice(PREFIX.organization.length).trim()
    } else if (line.startsWith(PREFIX.position)) {
      workPosition = line.slice(PREFIX.position.length).trim()
    } else {
      bioParts.push(line)
    }
  }

  const bio = bioParts.join('\n\n').trim() || (lines.every((l) => l.startsWith(PREFIX.title)) ? '' : text)
  return {
    title: '',
    major,
    subject,
    bio,
    workOrganization,
    workPosition,
    subjects: subject ? [subject] : [],
  }
}

/** Save bio only to mentor.description. */
export function buildMentorDescription(profile = {}) {
  const bio = profile.bio?.trim()
  return bio || undefined
}

function resolveProvinceIdFromProfile(profile = {}, provinces = []) {
  if (profile.provinceId != null && profile.provinceId !== '') {
    const id = Number(profile.provinceId)
    return Number.isFinite(id) && id > 0 ? id : undefined
  }
  if (profile.province_id != null && profile.province_id !== '') {
    const id = Number(profile.province_id)
    return Number.isFinite(id) && id > 0 ? id : undefined
  }
  const needle = String(profile.province ?? '').trim().toLowerCase()
  if (!needle || !provinces.length) return undefined
  const hit = provinces.find((row) => {
    const en = String(row.province_name ?? row.name ?? '').trim().toLowerCase()
    const kh = String(row.province_name_kh ?? '').trim().toLowerCase()
    return en === needle || kh === needle
  })
  const id = Number(hit?.province_id ?? hit?.id)
  return Number.isFinite(id) && id > 0 ? id : undefined
}

/** UI teacher profile → POST/PUT body for /v1/mentors */
export function mentorProfileToPayload(profile, provinces = []) {
  const years = profile.experienceYears
  const parsedYears = years != null && years !== '' ? parseInt(String(years), 10) : NaN
  const provinceId = resolveProvinceIdFromProfile(profile, provinces)

  return {
    ...mentorNamesUiToDb(profile),
    gender: profile.gender?.trim() || undefined,
    phone_number: getPhoneDigits(profile.phone) || undefined,
    province_id: provinceId,
    experience_years: Number.isNaN(parsedYears) ? undefined : parsedYears,
    description: buildMentorDescription(profile),
  }
}

/** Shared user fields → PUT /v1/users/me */
export function userProfilePayloadFromMentor(profile, provinces = []) {
  const provinceId = resolveProvinceIdFromProfile(profile, provinces)
  return {
    ...mentorNamesUiToDb(profile),
    phone_number: getPhoneDigits(profile.phone) || undefined,
    province_id: provinceId,
    description: buildMentorDescription(profile),
  }
}

/** Mentor-only fields → PUT /v1/mentors/:userId */
export function mentorOnlyPayload(profile, provinces = []) {
  const years = profile.experienceYears
  const parsedYears = years != null && years !== '' ? parseInt(String(years), 10) : NaN
  return {
    gender: profile.gender?.trim() || undefined,
    experience_years: Number.isNaN(parsedYears) ? undefined : parsedYears,
  }
}

/** Primary experience row for ExperienceSection from work + years fields. */
export function buildExperienceFromWork(
  { workPosition = '', workOrganization = '', experienceYears } = {},
  periodLabel = ''
) {
  const role = String(workPosition).trim()
  const org = String(workOrganization).trim()
  const years = experienceYears != null && experienceYears !== '' ? Number(experienceYears) : null

  if (!role && !org && (years == null || Number.isNaN(years))) return []

  const period =
    periodLabel?.trim() ||
    (years != null && !Number.isNaN(years) ? `${years} years` : '')

  return [{ id: 1, role, org, period }]
}

function provinceNameFromMentorRow(mentor, provinces = []) {
  const linked = mentor?.Province ?? mentor?.province
  if (linked?.province_name) return String(linked.province_name).trim()
  const provinceId = mentor?.province_id
  if (provinceId != null && provinces.length) {
    const hit = provinces.find(
      (row) => Number(row.province_id ?? row.id) === Number(provinceId)
    )
    if (hit) return String(hit.province_name ?? hit.name ?? '').trim()
  }
  return String(mentor?.address ?? '').trim()
}

/** Map GET /v1/users/me `user` payload → mentor UI profile (shared fields). */
export function userProfileRowToMentorUi(userRow = {}, base = {}) {
  if (!userRow || typeof userRow !== 'object') return { ...base }

  const { firstName, lastName } = mentorNamesDbToUi(userRow, base)
  const provinceRow = userRow.province ?? null
  const provinceId =
    userRow.province_id ?? provinceRow?.province_id ?? base.provinceId ?? null
  const province =
    String(provinceRow?.province_name ?? userRow.address ?? base.province ?? '').trim() ||
    base.province

  return {
    ...base,
    firstName,
    lastName,
    displayName: formatMentorDisplayName({ firstName, lastName }) || base.displayName,
    name: formatMentorDisplayName({ firstName, lastName }) || base.name,
    phone: userRow.phone_number ?? base.phone,
    province,
    provinceId,
    provinceRow,
    bio: userRow.description ?? base.bio,
    profilePicture: userRow.profile_picture ?? base.profilePicture,
    avatarUrl:
      userRow.profile_picture ?? base.avatarUrl ?? base.profilePicture ?? null,
    email: userRow.email ?? base.email,
  }
}

/** Mentor-only fields from mentor table row (gender, experience, legacy description parse). */
export function mentorOnlyFieldsFromRow(mentor, base = {}) {
  if (!mentor) return { ...base }

  const parsed = parseMentorDescription(mentor.description ?? '')

  return {
    ...base,
    gender: mentor.gender ?? base.gender,
    experienceYears: mentor.experience_years ?? base.experienceYears ?? null,
    major: parsed.major || base.major,
    subject: parsed.subject || base.subject,
    workOrganization: parsed.workOrganization || base.workOrganization,
    workPosition: parsed.workPosition || base.workPosition,
  }
}

/** Merge experience card + teaching fields from API mentor row. */
export function mentorRowToProfile(mentor, base = {}, provinces = []) {
  if (!mentor) return { ...base }

  const parsed = parseMentorDescription(mentor.description ?? '')
  const experienceYears = mentor.experience_years ?? base.experienceYears ?? null
  const workOrganization = parsed.workOrganization
  const workPosition = parsed.workPosition

  const { firstName, lastName } = mentorNamesDbToUi(mentor, base)
  const province = provinceNameFromMentorRow(mentor, provinces) || base.province

  const provinceRow = mentor?.Province ?? mentor?.province ?? null

  return {
    ...base,
    firstName,
    lastName,
    displayName: formatMentorDisplayName({ firstName, lastName }) || base.displayName,
    name: formatMentorDisplayName({ firstName, lastName }) || base.name,
    phone: mentor.phone_number ?? base.phone,
    gender: mentor.gender ?? base.gender,
    province,
    provinceId: mentor.province_id ?? provinceRow?.province_id ?? base.provinceId ?? null,
    provinceRow,
    experienceYears,
    workOrganization,
    workPosition,
    experience: base.experience?.length ? base.experience : [],
    title: '',
    major: parsed.major,
    subject: parsed.subject,
    bio: parsed.bio,
    profilePicture: mentor.profile_picture ?? base.profilePicture,
    avatarUrl:
      mentor.profile_picture ?? base.avatarUrl ?? base.profilePicture ?? null,
    description: mentor.description ?? '',
  }
}

export function emptyMentorOnboardingForm() {
  return {
    firstName: '',
    lastName: '',
    title: '',
    phone: '',
    gender: '',
    experienceYears: '',
    workOrganization: '',
    workPosition: '',
    major: '',
    subject: '',
    province: '',
    bio: '',
  }
}

/** Pre-fill onboarding modal from session / profile cache. */
export function mentorOnboardingFormFromUser(user = {}) {
  const years = user.experienceYears
  return {
    firstName: user.firstName ?? '',
    lastName: user.lastName ?? '',
    phone: user.phone ?? '',
    gender: user.gender ?? '',
    experienceYears: years != null && years !== '' ? String(years) : '',
    workOrganization: user.workOrganization ?? '',
    workPosition: user.workPosition ?? '',
    major: user.major ?? '',
    subject: user.subject ?? '',
    province: user.province ?? '',
    bio: user.bio ?? '',
  }
}

/**
 * Step-1 onboarding form → profile object for updateUser + saveMentorFromOnboarding.
 * @param {Record<string, string>} form
 * @param {{ yearsExpLabel?: string, subSkillId?: number|null }} [opts]
 * @returns {TeacherProfileUI & { subSkillId?: number|null }}
 */
export function buildOnboardingMentorProfile(form, opts = {}) {
  const firstName = form.firstName.trim()
  const lastName = form.lastName.trim()
  const workOrganization = String(form.workOrganization ?? '').trim()
  const workPosition = String(form.workPosition ?? '').trim()
  const experienceYears = parseInt(form.experienceYears, 10)

  return {
    firstName,
    lastName,
    name: formatMentorDisplayName({ firstName, lastName }),
    phone: getPhoneDigits(form.phone),
    gender: form.gender,
    experienceYears,
    workOrganization,
    workPosition,
    experience: buildExperienceFromWork(
      { workPosition, workOrganization, experienceYears },
      opts.yearsExpLabel
    ),
    major: form.major,
    subject: form.subject,
    province: form.province,
    bio: form.bio.trim(),
    subSkillId: opts.subSkillId ?? null,
  }
}

/**
 * @param {Record<string, string>} form
 * @param {{ locationOptions: { value: string }[] }} ctx
 */
export function validateMentorOnboardingStep1(form, ctx) {
  return validateMentorOnboardingStep1Shared(form, ctx)
}
