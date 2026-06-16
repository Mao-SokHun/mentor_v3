import { apiRequest, apiFormRequest, isApiEnabled } from '../core/api'
import { ENDPOINTS } from '../core/endpoints'
import { getStoredUser } from '@/lib/authStorage'
import { resolveMentorProfile } from '@/lib/mentorProfile'
import { filterMentors } from '@/utils/filterMentors'
import {
  mentorRowToProfile as mapMentorRowToProfile,
  mentorProfileToPayload,
} from '@/lib/mentorApiMap'
import {
  applyMentorSkillRows,
  mapMentorToListItem,
  mapMentorsToList,
} from '@/utils/mentorMapper'
import { buildQueryString, toMentorQueryParams } from '@/utils/mentorQuery'
import { parsePostScheduleMeta, resolveSessionNotes } from '@/utils/mentorPostMapper'
import { compareTimeSortKeys } from '@/utils/timeRangeUtils'
import { FILTER_ALL } from '@/constants'
import { provinceRowLabel } from '@/utils/provinceOptions'
import { isValidPortfolioUrl, classifyPortfolioEntryMode } from '@/utils/portfolioUtils'

export { isValidPortfolioUrl, hasInvalidPortfolioLinks } from '@/utils/portfolioUtils'

// ============= Start mentor service =============

const MENTOR_API = ENDPOINTS.mentors
const MENTOR_LIST_MAX = 50

// ============= Start shared helpers =============
function parseFilterNumericId(value) {
  const n = parseInt(String(value ?? ''), 10)
  return !Number.isNaN(n) && n > 0 ? n : null
}

async function resolveFiltersForApi(filters = {}) {
  const next = { ...filters }
  const needsSkill =
    (filters.subject && filters.subject !== FILTER_ALL.subject) ||
    (filters.major && filters.major !== FILTER_ALL.major)
  if (!needsSkill) return next

  const catalog = await fetchAllSkills()
  const subSkillIdFromValue = parseFilterNumericId(filters.subject)
  const skillIdFromValue = parseFilterNumericId(filters.major)

  if (filters.subject && filters.subject !== FILTER_ALL.subject) {
    const subSkillId =
      subSkillIdFromValue ??
      resolveSubSkillIdFromMajorSubject(filters.major, filters.subject, catalog)
    if (subSkillId != null) next.subSkillId = subSkillId
  } else if (filters.major && filters.major !== FILTER_ALL.major) {
    const skillId = skillIdFromValue ?? resolveSkillId(filters.major, catalog)
    if (skillId != null) next.skillId = skillId
  }
  return next
}

function unwrapApiData(json) {
  return json?.data ?? json
}
// ============= End shared helpers =============

// ============= Start onboarding and list =============
/** Map teacher UI profile → mentor API body (see lib/mentorApiMap.js). */
export function toMentorPayload(profile, provinces = []) {
  return mentorProfileToPayload(profile, provinces)
}

/** Save teacher onboarding to mentor table (POST or PUT). */
export async function saveMentorFromOnboarding(profile, userId) {
  if (!isApiEnabled()) return null

  const body = toMentorPayload(profile)
  const id = userId ?? getStoredUser()?.id

  try {
    return unwrapApiData(
      await apiRequest(MENTOR_API.create, {
        method: 'POST',
        body: JSON.stringify(body),
      })
    )
  } catch (err) {
    const duplicate =
      err.status === 409 ||
      (err.status === 400 && /already exists/i.test(String(err.message ?? '')))
    if (duplicate && id) {
      return unwrapApiData(
        await apiRequest(MENTOR_API.byId(id), {
          method: 'PUT',
          body: JSON.stringify(body),
        })
      )
    }
    throw err
  }
}

export async function fetchMentors(filters = {}) {
  const wantsSinglePage = filters.page != null && filters.pageSize != null
  const pageSize = Math.min(MENTOR_LIST_MAX, Math.max(1, filters.pageSize ?? MENTOR_LIST_MAX))

  if (!isApiEnabled()) {
    return { items: [], total: 0, page: filters.page ?? 1, pageSize: filters.pageSize ?? 0 }
  }

  const apiFilters = await resolveFiltersForApi(filters)
  const listPath = MENTOR_API.list
  const allRaw = []
  let total = 0
  let page = filters.page ?? 1

  while (true) {
    const params = toMentorQueryParams({ ...apiFilters, page, pageSize })
    const qs = buildQueryString(params)
    const json = await apiRequest(`${listPath}${qs}`)
    const payload = unwrapApiData(json)
    const rawItems = Array.isArray(payload)
      ? payload
      : payload?.item ?? payload?.items ?? []

    allRaw.push(...rawItems)
    total = payload?.total ?? allRaw.length

    if (wantsSinglePage || rawItems.length < pageSize || allRaw.length >= total) break
    page += 1
  }

  const mapped = mapMentorsToList(allRaw)
  const filtered = filterMentors(mapped, filters)
  const items = await enrichMentorsWithSkills(filtered)

  return {
    items,
    total: wantsSinglePage ? total : items.length,
    apiTotal: total,
    page: filters.page ?? 1,
    pageSize: wantsSinglePage ? pageSize : items.length,
  }
}

/** Attach mentor_skills (Skill + SubSkill names) to list/card payloads. */
export async function enrichMentorsWithSkills(mentors = []) {
  if (!isApiEnabled() || !Array.isArray(mentors) || mentors.length === 0) {
    return mentors
  }

  return Promise.all(
    mentors.map(async (mentor) => {
      if (mentor.skillItems?.length) return mentor
      const userId = mentor.userId ?? mentor.id
      if (!userId) return mentor
      try {
        const skills = await fetchMentorSkills(userId)
        return applyMentorSkillRows(mentor, skills)
      } catch {
        return mentor
      }
    })
  )
}
// ============= End onboarding and list =============

// ============= Start profile read =============
export async function fetchMentorById(id) {
  if (!isApiEnabled() || !id) return null
  const mentor = unwrapApiData(await apiRequest(MENTOR_API.byId(id)))
  return mapMentorToListItem(mentor)
}

/** Mentor profile + mentor_skills rows for student/public profile pages. */
export async function fetchMentorWithSkills(userId) {
  if (!isApiEnabled() || !userId) return null
  const [mentor, skills] = await Promise.all([
    fetchMentorById(userId),
    fetchMentorSkills(userId),
  ])
  if (!mentor) return null
  return applyMentorSkillRows(mentor, skills)
}

/** Logged-in mentor UI profile merged with mentor_skills table. */
export async function fetchMyMentorProfileForUi(user) {
  if (!isApiEnabled()) return resolveMentorProfile(user)
  const userId = user?.id
  if (!userId) return resolveMentorProfile(user)

  const [mentorRow, skills, catalog] = await Promise.all([
    fetchMyMentorProfile().catch(() => null),
    fetchMentorSkills(userId).catch(() => []),
    fetchMentorCatalog().catch(() => ({ skills: [], provinces: [] })),
  ])
  const provinces = Array.isArray(catalog?.provinces) ? catalog.provinces : []

  const base = mentorRow
    ? mentorRowToProfile(mentorRow, user, provinces)
    : resolveMentorProfile(user)
  return applyMentorSkillRows(
    {
      ...base,
      subjects: base.subject ? [base.subject] : [],
    },
    skills
  )
}

/** GET /v1/mentors/me — logged-in mentor row (null if not created yet) */
export async function fetchMyMentorProfile() {
  if (!isApiEnabled()) return null
  try {
    const data = unwrapApiData(await apiRequest(MENTOR_API.me))
    return data ?? null
  } catch (err) {
    if (err?.status === 400 || err?.status === 404) return null
    throw err
  }
}

/** GET /v1/mentors/catalog — skills + provinces (filters, onboarding) */
export async function fetchMentorCatalog() {
  if (!isApiEnabled()) return { skills: [], provinces: [] }
  const data = unwrapApiData(await apiRequest(MENTOR_API.catalog)) ?? {}
  return {
    skills: Array.isArray(data.skills) ? data.skills : [],
    provinces: Array.isArray(data.provinces) ? data.provinces : [],
  }
}

/** GET /v1/mentors/me/dashboard — analytics + posts + mentor row */
export async function fetchMyMentorDashboard() {
  if (!isApiEnabled()) return { analytics: null, posts: [], mentor: null }
  const data = unwrapApiData(await apiRequest(MENTOR_API.myDashboard)) ?? {}
  return {
    analytics: data.analytics ?? null,
    posts: Array.isArray(data.posts) ? data.posts : [],
    mentor: data.mentor ?? null,
  }
}

/** GET /v1/mentors/me/edit-profile — one request for edit-profile page load */
export async function fetchEditProfileBundle(user) {
  if (!isApiEnabled()) {
    return {
      profile: resolveMentorProfile(user),
      portfolio: [],
      experience: [],
      mentorSkills: [],
      skillsCatalog: [],
      provinces: [],
      hasMentorRow: false,
    }
  }
  const userId = user?.id
  if (!userId) {
    return {
      profile: resolveMentorProfile(user),
      portfolio: [],
      experience: [],
      mentorSkills: [],
      skillsCatalog: [],
      provinces: [],
      hasMentorRow: false,
    }
  }

  const data = unwrapApiData(await apiRequest(MENTOR_API.myEditProfile)) ?? {}
  const mentorSkills = Array.isArray(data.mentorSkills) ? data.mentorSkills : []
  const provinces = Array.isArray(data.catalog?.provinces) ? data.catalog.provinces : []
  const base = data.profile
    ? mentorRowToProfile(data.profile, user, provinces)
    : resolveMentorProfile(user)
  const profile = applyMentorSkillRows(
    { ...base, subjects: base.subject ? [base.subject] : [] },
    mentorSkills
  )
  const portfolio = Array.isArray(data.portfolio)
    ? data.portfolio.map(portfolioRowToUi)
    : []
  const experience = Array.isArray(data.experience)
    ? data.experience.map(experienceRowToUi)
    : []

  return {
    profile,
    portfolio,
    experience,
    mentorSkills,
    skillsCatalog: Array.isArray(data.catalog?.skills) ? data.catalog.skills : [],
    provinces,
    hasMentorRow: Boolean(data.profile),
  }
}
// ============= End profile read =============

// ============= Start profile write and analytics =============
const EMPTY_MENTOR_ANALYTICS = {
  mentor_exists: false,
  portfolio_count: 0,
  skills_count: 0,
  posts_count: 0,
  published_posts_count: 0,
  profile_views: null,
  sessions_count: null,
}

/** GET /v1/mentors/me/analytics — counts for teacher reports page */
export async function fetchMyMentorAnalytics() {
  if (!isApiEnabled()) return null
  try {
    return unwrapApiData(await apiRequest(MENTOR_API.myAnalytics))
  } catch (err) {
    if (err?.status === 404) return { ...EMPTY_MENTOR_ANALYTICS }
    throw err
  }
}

/** POST /v1/mentors/:userId/profile-views — increments mentor.profile_view_count */
export async function recordMentorProfileView(userId) {
  if (!isApiEnabled() || !userId) return null
  return unwrapApiData(
    await apiRequest(MENTOR_API.profileViews(userId), {
      method: 'POST',
      body: JSON.stringify({}),
    })
  )
}

/** POST /mentors/:userId/profile-picture — upload mentor avatar image */
export async function uploadMentorProfilePicture(userId, file) {
  if (!isApiEnabled() || !userId || !file) return null
  const form = new FormData()
  form.append('file', file)
  return unwrapApiData(
    await apiFormRequest(MENTOR_API.profilePicture(userId), form, { method: 'POST' })
  )
}

/** PUT /mentor/edit-profile — update mentor profile (POST if row missing) */
export async function updateMentorProfile(userId, profile, provinces = []) {
  if (!isApiEnabled()) return null
  const body = toMentorPayload(profile, provinces)
  try {
    return unwrapApiData(
      await apiRequest(MENTOR_API.byId(userId), {
        method: 'PUT',
        body: JSON.stringify(body),
      })
    )
  } catch (err) {
    if (err?.status === 400 || err?.status === 404) {
      return unwrapApiData(
        await apiRequest(MENTOR_API.create, {
          method: 'POST',
          body: JSON.stringify(body),
        })
      )
    }
    throw err
  }
}
/** DELETE /mentor/delete — delete mentor profile */
export async function deleteMentorProfile(userId) {
  if (!isApiEnabled()) return null
  return unwrapApiData(
    await apiRequest(MENTOR_API.byId(userId), {
      method: 'DELETE',
    })
  )
}

/** Map mentor API row → teacher edit-profile / auth user shape */
export function mentorRowToProfile(mentor, user) {
  return mapMentorRowToProfile(mentor, resolveMentorProfile(user))
}
// ============= End profile write and analytics =============

// ============= Start portfolio =============
export function portfolioRowToUi(row) {
  const link = row?.link ?? ''
  const technologies = Array.isArray(row?.technologies)
    ? row.technologies.join(', ')
    : String(row?.technologies ?? '').trim()
  const fileId = row?.files?.[0]?.file_id
  return {
    id: link || (fileId ? `doc-${fileId}` : `tmp-${row?.mentor_id ?? 'p'}-${row?.link_tag ?? 'row'}`),
    link,
    title: row?.link_tag ?? row?.title ?? '',
    oldLink: link,
    description: row?.description ?? '',
    portfolioDate: row?.portfolio_date ?? '',
    technologies,
    itemType: row?.item_type ?? 'link',
    sortOrder: row?.sort_order ?? 0,
    files: Array.isArray(row?.files) ? row.files : [],
    pendingFile: null,
    entryMode: classifyPortfolioEntryMode(row),
  }
}

function portfolioPayloadFromUi(item) {
  return {
    link: String(item.link ?? '').trim(),
    link_tag: String(item.title ?? item.link_tag ?? '').trim() || null,
    title: String(item.title ?? '').trim() || null,
    description: String(item.description ?? '').trim() || null,
    portfolio_date: String(item.portfolioDate ?? '').trim() || null,
    technologies: String(item.technologies ?? '').trim() || null,
    item_type: String(item.itemType ?? 'link').trim() || 'link',
    sort_order: Number.isFinite(Number(item.sortOrder)) ? Number(item.sortOrder) : 0,
  }
}

function portfolioFieldsChanged(existing, next) {
  const prev = portfolioPayloadFromUi(existing)
  const nxt = portfolioPayloadFromUi(next)
  return (
    prev.link_tag !== nxt.link_tag ||
    prev.description !== nxt.description ||
    prev.portfolio_date !== nxt.portfolio_date ||
    prev.technologies !== nxt.technologies ||
    prev.item_type !== nxt.item_type ||
    prev.sort_order !== nxt.sort_order
  )
}

function dedupePortfolioItemsByLink(items) {
  const byLink = new Map()
  for (const item of items) {
    byLink.set(item.link, item)
  }
  return [...byLink.values()]
}

/** True when two or more filled portfolio rows share the same URL. */
export function hasDuplicatePortfolioLinks(items = []) {
  const links = items
    .map((item) => String(item.link ?? '').trim())
    .filter((link) => isValidPortfolioUrl(link))
  return new Set(links).size !== links.length
}

export async function fetchMentorPortfolio(userId) {
  if (!isApiEnabled() || !userId) return []
  const json = await apiRequest(MENTOR_API.portfolio.byMentor(userId))
  return (unwrapApiData(json) ?? []).map(portfolioRowToUi)
}

export async function createPortfolioItem(userId, item) {
  const payload = portfolioPayloadFromUi(item)
  if (!isValidPortfolioUrl(payload.link)) throw new Error('Invalid portfolio URL')
  const json = await apiRequest(MENTOR_API.portfolio.byMentor(userId), {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return portfolioRowToUi(unwrapApiData(json))
}

export async function createPortfolioWithFile(userId, item, file) {
  if (!file) throw new Error('Portfolio file is required')
  const form = new FormData()
  form.append('file', file)
  const payload = portfolioPayloadFromUi(item)
  if (payload.link_tag) form.append('link_tag', payload.link_tag)
  if (payload.description) form.append('description', payload.description)
  if (payload.portfolio_date) form.append('portfolio_date', payload.portfolio_date)
  if (payload.technologies) form.append('technologies', payload.technologies)
  if (payload.item_type) form.append('item_type', payload.item_type)
  if (payload.sort_order != null) form.append('sort_order', String(payload.sort_order))
  if (isValidPortfolioUrl(payload.link)) form.append('link', payload.link)

  const json = await apiFormRequest(MENTOR_API.portfolio.withFile(userId), form)
  return portfolioRowToUi(unwrapApiData(json))
}

export async function updatePortfolioItem(userId, link, item) {
  const payload = portfolioPayloadFromUi(item)
  const json = await apiRequest(MENTOR_API.portfolio.item(userId, link), {
    method: 'PATCH',
    body: JSON.stringify({
      link_tag: payload.link_tag,
      description: payload.description,
      portfolio_date: payload.portfolio_date,
      technologies: payload.technologies,
      item_type: payload.item_type,
      sort_order: payload.sort_order,
    }),
  })
  return portfolioRowToUi(unwrapApiData(json))
}

export async function uploadPortfolioFile(userId, link, file) {
  const form = new FormData()
  form.append('file', file)
  const json = await apiFormRequest(MENTOR_API.portfolio.files(userId, link), form)
  return unwrapApiData(json)
}

export async function deletePortfolioFile(userId, link, fileId) {
  await apiRequest(MENTOR_API.portfolio.file(userId, link, fileId), { method: 'DELETE' })
}

export async function deletePortfolioItem(userId, link) {
  await apiRequest(MENTOR_API.portfolio.item(userId, link), { method: 'DELETE' })
}
// ============= End portfolio =============

// ============= Start experience =============
/** UI period label ↔ mentor_experiences.mentor_year (DATE) */
export function periodToMentorYear(period) {
  const text = String(period ?? '').trim()
  if (!text) return null

  const yearsMatch = text.match(/(\d+)\s*years?/i)
  if (yearsMatch) {
    const years = parseInt(yearsMatch[1], 10)
    if (!Number.isNaN(years) && years > 0) {
      return new Date(new Date().getFullYear() - years, 0, 1).toISOString()
    }
  }

  const yearMatch = text.match(/\b(19|20)\d{2}\b/)
  if (yearMatch) {
    return new Date(parseInt(yearMatch[0], 10), 0, 1).toISOString()
  }

  const parsed = new Date(text)
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString()
}

export function mentorYearToPeriod(mentorYear) {
  if (!mentorYear) return ''
  const date = new Date(mentorYear)
  if (Number.isNaN(date.getTime())) return ''

  const year = date.getFullYear()
  const yearsAgo = new Date().getFullYear() - year

  // "3 years" style input is stored as Jan 1 of (currentYear - N)
  if (yearsAgo >= 1 && yearsAgo <= 10) {
    return `${yearsAgo} years`
  }

  return String(year)
}

export function experienceRowToUi(row) {
  const dbId = row?.mentor_experience_id ?? row?.id ?? null
  const typeRaw = String(row?.experience_type ?? 'education').trim().toLowerCase()
  return {
    id: dbId ?? `tmp-${Date.now()}`,
    dbId,
    type: typeRaw === 'work' ? 'work' : 'education',
    role: String(row?.mentor_position ?? '').trim(),
    org: String(row?.mentor_organization ?? '').trim(),
    period: mentorYearToPeriod(row?.mentor_year),
  }
}

/** Split API rows into education (degree/school) vs work (job history). */
export function splitExperienceByType(rows = []) {
  const education = []
  const work = []
  for (const row of rows ?? []) {
    const uiRow = row?.dbId != null || row?.type != null ? row : experienceRowToUi(row)
    if (uiRow.type === 'work') work.push(uiRow)
    else education.push(uiRow)
  }
  return { education, work }
}

function experiencePayloadFromUi(item, experienceType = 'education') {
  const role = String(item.role ?? '').trim()
  const org = String(item.org ?? '').trim()
  const period = String(item.period ?? '').trim()
  const mentor_year = periodToMentorYear(period) ?? new Date().toISOString()
  const type =
    item?.type === 'work' || experienceType === 'work' ? 'work' : 'education'

  return {
    mentor_position: role,
    mentor_organization: org,
    mentor_year,
    experience_type: type,
  }
}

export async function fetchMentorExperience(userId) {
  if (!isApiEnabled() || !userId) return []
  const json = await apiRequest(MENTOR_API.experience.byMentor(userId))
  return (unwrapApiData(json) ?? []).map(experienceRowToUi)
}

export async function createMentorExperienceItem(userId, item, experienceType = 'education') {
  const json = await apiRequest(MENTOR_API.experience.byMentor(userId), {
    method: 'POST',
    body: JSON.stringify(experiencePayloadFromUi(item, experienceType)),
  })
  return experienceRowToUi(unwrapApiData(json))
}

export async function updateMentorExperienceItem(userId, experienceId, item, experienceType = 'education') {
  const json = await apiRequest(MENTOR_API.experience.item(userId, experienceId), {
    method: 'PATCH',
    body: JSON.stringify(experiencePayloadFromUi(item, experienceType)),
  })
  return experienceRowToUi(unwrapApiData(json))
}

export async function deleteMentorExperienceItem(userId, experienceId) {
  await apiRequest(MENTOR_API.experience.item(userId, experienceId), { method: 'DELETE' })
}

/** Sync experience rows from edit-profile UI with mentor_experiences API */
export async function syncMentorExperience(
  userId,
  items,
  serverItems = [],
  experienceType = 'education'
) {
  if (!isApiEnabled() || !userId) return []

  const type = experienceType === 'work' ? 'work' : 'education'
  const allServer =
    serverItems.length > 0 ? serverItems : await fetchMentorExperience(userId)
  const serverList = allServer.filter((row) => (row.type ?? 'education') === type)
  const serverById = new Map(
    serverList.filter((row) => row.dbId != null).map((row) => [row.dbId, row])
  )

  const nextItems = (items ?? [])
    .map((item) => ({
      id: item.id,
      dbId: item.dbId ?? null,
      type,
      role: String(item.role ?? '').trim(),
      org: String(item.org ?? '').trim(),
      period: String(item.period ?? '').trim(),
    }))
    .filter((item) => item.role && item.org)

  const nextDbIds = new Set(
    nextItems.map((item) => item.dbId).filter((id) => id != null)
  )

  for (const [dbId] of serverById) {
    if (!nextDbIds.has(dbId)) {
      await deleteMentorExperienceItem(userId, dbId)
    }
  }

  const saved = []
  for (const item of nextItems) {
    const existing = item.dbId != null ? serverById.get(item.dbId) : null

    if (!existing) {
      saved.push(await createMentorExperienceItem(userId, item, type))
      continue
    }

    const prevPayload = experiencePayloadFromUi(existing, type)
    const nextPayload = experiencePayloadFromUi(item, type)
    const changed =
      prevPayload.mentor_position !== nextPayload.mentor_position ||
      prevPayload.mentor_organization !== nextPayload.mentor_organization ||
      prevPayload.mentor_year !== nextPayload.mentor_year

    if (changed) {
      saved.push(await updateMentorExperienceItem(userId, item.dbId, item, type))
    } else {
      saved.push(existing)
    }
  }

  const refreshed = await fetchMentorExperience(userId)
  return refreshed.filter((row) => row.type === type)
}
// ============= End experience =============

// ============= Start skills =============
/**
 * Skill catalog from DB (`skill` + nested `sub_skill`).
 * Use this for majors/subjects — do not use hardcoded lists in @/constants/filters/mentorFilters.js.
 */
export async function fetchAllSkills() {
  if (!isApiEnabled()) return []
  const json = await apiRequest(MENTOR_API.skills.listAll)
  return unwrapApiData(json) ?? []
}

export async function fetchMentorSkills(userId) {
  if (!isApiEnabled() || !userId) return []
  const json = await apiRequest(MENTOR_API.skills.byMentor(userId))
  return unwrapApiData(json) ?? []
}

/** POST body: sub_skill_id (required) and skill_id (optional, validated server-side) */
export async function addMentorSubSkill(userId, subSkillId, skillId = null) {
  if (!isApiEnabled() || !userId || subSkillId == null) return null
  const body = { sub_skill_id: subSkillId }
  const parsedSkillId = Number(skillId)
  if (!Number.isNaN(parsedSkillId) && parsedSkillId > 0) {
    body.skill_id = parsedSkillId
  }
  const json = await apiRequest(MENTOR_API.skills.byMentor(userId), {
    method: 'POST',
    body: JSON.stringify(body),
  })
  return unwrapApiData(json)
}

export async function deleteMentorSkill(userId, subSkillId) {
  await apiRequest(`${MENTOR_API.skills.byMentor(userId)}/${subSkillId}`, {
    method: 'DELETE',
  })
}

export function mentorSkillSubId(row) {
  return row?.sub_skill_id ?? row?.SubSkill?.sub_skill_id ?? null
}

export function mentorSkillSkillId(row) {
  return (
    row?.skill_id ??
    row?.Skill?.skill_id ??
    row?.SubSkill?.skill_id ??
    row?.SubSkill?.Skill?.skill_id ??
    null
  )
}

/** MentorSkill row → parent skill + sub-skill display names from API include */
export function mentorSkillNamesFromRow(row, lang = 'en') {
  const sub = row?.SubSkill ?? row?.subSkill ?? {}
  const skill = row?.Skill ?? sub?.Skill ?? sub?.skill ?? {}
  return {
    skillName: skillRowLabel(skill, lang),
    subSkillName: skillRowLabel(sub, lang),
  }
}

/** True when row is from `sub_skill` table. */
export function isSubSkillRow(row) {
  if (!row) return false
  return (
    row.sub_skill_id != null ||
    row.sub_skill_name != null ||
    row.sub_skill_name_kh != null
  )
}

/** Parent skill — `skill` table: skill_name / skill_name_kh */
export function parentSkillRowLabel(row, lang = 'en') {
  if (!row) return ''
  const en = String(row.skill_name ?? row.name ?? '').trim()
  const kh = String(row.skill_name_kh ?? en).trim()
  if (lang === 'km' && kh) return kh
  return en || kh
}

/** Sub-skill — `sub_skill` table: sub_skill_name / sub_skill_name_kh */
export function subSkillRowLabel(row, lang = 'en') {
  if (!row) return ''
  const en = String(row.sub_skill_name ?? row.skill_name ?? row.name ?? '').trim()
  const kh = String(row.sub_skill_name_kh ?? row.skill_name_kh ?? en).trim()
  if (lang === 'km' && kh) return kh
  return en || kh
}

/** Auto-detect skill vs sub_skill row (used across browse, profile, filters). */
export function skillRowLabel(row, lang = 'en') {
  if (!row) return ''
  return isSubSkillRow(row) ? subSkillRowLabel(row, lang) : parentSkillRowLabel(row, lang)
}

/** Label for catalog rows; falls back to other language then sub_skill_id. */
export function catalogRowLabelWithFallback(row, lang = 'en') {
  const primary = skillRowLabel(row, lang)
  if (primary) return primary
  const alternate = skillRowLabel(row, lang === 'km' ? 'en' : 'km')
  if (alternate) return alternate
  const id = row?.sub_skill_id ?? row?.skill_id ?? row?.id
  if (!id) return ''
  return lang === 'km' ? `មុខវិជ្ជា ${id}` : `Subject ${id}`
}

function subsFromSkillRow(skill) {
  return skill?.SubSkills ?? skill?.sub_skills ?? skill?.subSkills ?? []
}

/** Skill catalog → select options for parent Skill rows */
export function buildSkillOptions(catalog = [], lang = 'en') {
  return catalog
    .map((skill) => ({
      value: Number(skill.skill_id ?? skill.id),
      label: catalogRowLabelWithFallback(skill, lang),
    }))
    .filter((o) => o.value > 0 && o.label)
    .sort((a, b) => a.label.localeCompare(b.label))
}

/** Skill catalog → SubSkill options filtered by parent skill_id */
export function buildSubSkillOptions(catalog = [], skillId, lang = 'en') {
  const sid = Number(skillId)
  if (!sid) return []

  const skill = catalog.find((row) => Number(row.skill_id ?? row.id) === sid)
  if (!skill) return []

  return subsFromSkillRow(skill)
    .map((sub) => ({
      value: Number(sub.sub_skill_id ?? sub.id),
      label: catalogRowLabelWithFallback(sub, lang),
    }))
    .filter((o) => o.value > 0 && o.label)
    .sort((a, b) => a.label.localeCompare(b.label))
}

export function skillNamesFromCatalog(catalog = [], skillId, subSkillId, lang = 'en') {
  const sid = Number(skillId)
  const subId = Number(subSkillId)
  const skill = catalog.find((row) => Number(row.skill_id ?? row.id) === sid)
  const skillName = skillRowLabel(skill, lang)
  if (!skill || !subId) return { skillName, subSkillName: '' }

  const sub = subsFromSkillRow(skill).find(
    (row) => Number(row.sub_skill_id ?? row.id) === subId
  )
  return {
    skillName,
    subSkillName: skillRowLabel(sub, lang),
  }
}

export function resolveSkillIdForSubSkill(catalog = [], subSkillId) {
  const subId = Number(subSkillId)
  if (!subId) return null

  for (const skill of catalog) {
    const skillId = Number(skill.skill_id ?? skill.id)
    for (const sub of subsFromSkillRow(skill)) {
      if (Number(sub.sub_skill_id ?? sub.id) === subId) {
        return skillId > 0 ? skillId : null
      }
    }
  }

  return null
}

/** Prefill teaching-focus dropdowns from mentor_skills + skill catalog */
export function resolveSkillSubSkillFromMentorSkills(mentorSkills = [], catalog = []) {
  const first = mentorSkills?.[0]
  const subId = mentorSkillSubId(first)
  if (!subId) return { skillId: '', subSkillId: '' }

  const directSkillId = mentorSkillSkillId(first)
  if (directSkillId) {
    return {
      skillId: String(directSkillId),
      subSkillId: String(subId),
    }
  }

  for (const skill of catalog) {
    for (const sub of subsFromSkillRow(skill)) {
      if (Number(sub.sub_skill_id ?? sub.id) === Number(subId)) {
        return {
          skillId: String(skill.skill_id ?? skill.id),
          subSkillId: String(subId),
        }
      }
    }
  }

  return { skillId: '', subSkillId: String(subId) }
}

/** Primary skill/sub-skill labels for profile preview (live selection or DB snapshot). */
export function resolveMentorSkillPreview(
  { selectedSubSkillIds = [], skillOptions = [], skillsSnapshot = [] } = {}
) {
  const selected = selectedSubSkillIds.map((id) => Number(id)).filter((id) => id > 0)

  if (selected.length > 0 && skillOptions.length > 0) {
    const opt = skillOptions.find((o) => o.value === selected[0])
    if (opt?.label) {
      const parts = String(opt.label).split(' · ')
      return {
        skillName: parts[0]?.trim() ?? '',
        subSkillName: parts[1]?.trim() ?? opt.label.trim(),
      }
    }
  }

  if (skillsSnapshot.length > 0) {
    const row =
      skillsSnapshot.find((item) => selected.includes(Number(mentorSkillSubId(item)))) ??
      skillsSnapshot[0]
    return mentorSkillNamesFromRow(row)
  }

  return { skillName: '', subSkillName: '' }
}

/** Flat sub-skill options for selects: { value, label, valueLabel } */
export function flattenSubSkillOptions(skills = [], lang = 'en') {
  const out = []
  for (const skill of skills) {
    const parentName = skillRowLabel(skill, lang)
    const parentEn = skillRowLabel(skill, 'en')
    const subs = skill.SubSkills ?? skill.sub_skills ?? skill.subSkills ?? []
    for (const sub of subs) {
      const id = sub.sub_skill_id ?? sub.id
      if (id == null) continue
      const subName = catalogRowLabelWithFallback(sub, lang)
      const subEn = catalogRowLabelWithFallback(sub, 'en')
      const label = parentName && subName ? `${parentName} · ${subName}` : subName || parentName
      const valueLabel =
        parentEn && subEn ? `${parentEn} · ${subEn}` : subEn || parentEn
      out.push({ value: Number(id), label, valueLabel })
    }
  }
  return out.sort((a, b) => a.label.localeCompare(b.label))
}

export async function syncMentorSkills(
  userId,
  selectedSubSkillIds,
  serverSkills = [],
  catalog = []
) {
  if (!isApiEnabled() || !userId) return []

  const serverList =
    serverSkills.length > 0 ? serverSkills : await fetchMentorSkills(userId)
  const serverIds = new Set(
    serverList.map(mentorSkillSubId).filter((id) => id != null).map(Number)
  )
  const nextIds = new Set(
    selectedSubSkillIds.map((id) => Number(id)).filter((id) => !Number.isNaN(id) && id > 0)
  )

  for (const id of serverIds) {
    if (!nextIds.has(id)) await deleteMentorSkill(userId, id)
  }
  for (const id of nextIds) {
    if (!serverIds.has(id)) {
      const skillId = resolveSkillIdForSubSkill(catalog, id)
      await addMentorSubSkill(userId, id, skillId)
    }
  }

  return fetchMentorSkills(userId)
}
// ============= End skills =============

// ============= Start provinces and filter resolvers =============
export async function fetchProvinces() {
  if (!isApiEnabled()) return []
  const json = await apiRequest(MENTOR_API.provinces.listAll)
  return unwrapApiData(json) ?? []
}

function skillNameVariants(row) {
  if (!row) return []
  const isSub = isSubSkillRow(row)
  const rawNames = isSub
    ? [
        row.sub_skill_name,
        row.sub_skill_name_kh,
        row.skill_name,
        row.skill_name_kh,
      ]
    : [row.skill_name, row.skill_name_kh]
  return [...rawNames, row.name, skillRowLabel(row, 'en'), skillRowLabel(row, 'km')]
    .map((value) => String(value ?? '').trim().toLowerCase())
    .filter(Boolean)
}

/** Map UI skill (major) label → skill_id from skill catalog */
export function resolveSkillId(skillName, skills = []) {
  const idFromValue = parseFilterNumericId(skillName)
  if (idFromValue != null) return idFromValue

  const needle = String(skillName ?? '').trim().toLowerCase()
  if (!needle) return null
  for (const skill of skills) {
    if (skillNameVariants(skill).includes(needle)) {
      return skill.skill_id ?? skill.id ?? null
    }
  }
  return null
}

/** Map UI major + subject labels → sub_skill_id from skill catalog */
export function resolveSubSkillIdFromMajorSubject(major, subject, skills = []) {
  const majorNeedle = String(major ?? '').trim().toLowerCase()
  const subjectNeedle = String(subject ?? '').trim().toLowerCase()
  if (!subjectNeedle) return null

  const composite = resolveSubSkillIdFromCompositeLabel(subject, skills)
  if (composite != null) return composite

  for (const skill of skills) {
    const skillNames = skillNameVariants(skill)
    if (majorNeedle && !skillNames.includes(majorNeedle)) continue
    const subs = skill.SubSkills ?? skill.sub_skills ?? skill.subSkills ?? []
    for (const sub of subs) {
      if (skillNameVariants(sub).includes(subjectNeedle)) {
        return sub.sub_skill_id ?? sub.id ?? null
      }
    }
  }

  return resolveSubSkillId(subject, skills)
}

function resolveSubSkillIdFromCompositeLabel(label, skills = []) {
  const text = String(label ?? '').trim()
  if (!text.includes('·')) return null

  const needle = text.toLowerCase()
  for (const skill of skills) {
    const parentName = parentSkillRowLabel(skill, 'en')
    if (!parentName) continue
    const subs = skill.SubSkills ?? skill.sub_skills ?? skill.subSkills ?? []
    for (const sub of subs) {
      const subName = subSkillRowLabel(sub, 'en')
      if (!subName) continue
      const composite = `${parentName} · ${subName}`.toLowerCase()
      if (composite === needle) return sub.sub_skill_id ?? sub.id ?? null
    }
  }
  return null
}

/** Map UI subject label → sub_skill_id from skill catalog */
export function resolveSubSkillId(subjectName, skills = []) {
  const composite = resolveSubSkillIdFromCompositeLabel(subjectName, skills)
  if (composite != null) return composite

  const idFromValue = parseFilterNumericId(subjectName)
  if (idFromValue != null) return idFromValue

  const needle = String(subjectName ?? '').trim().toLowerCase()
  if (!needle) return null
  for (const skill of skills) {
    const subs = skill.SubSkills ?? skill.sub_skills ?? skill.subSkills ?? []
    for (const sub of subs) {
      if (skillNameVariants(sub).includes(needle)) {
        return sub.sub_skill_id ?? sub.id ?? null
      }
    }
  }
  return null
}

/** Map UI province label → province_id (matches EN or KH display names) */
export function resolveProvinceId(provinceName, provinces = [], lang = 'en') {
  const needle = String(provinceName ?? '').trim().toLowerCase()
  if (!needle) return null
  const hit = provinces.find((p) => {
    const en = String(p.province_name ?? p.name ?? '').trim().toLowerCase()
    const kh = provinceRowLabel(p, 'km').toLowerCase()
    return en === needle || kh === needle
  })
  return hit?.province_id ?? hit?.id ?? null
}
// ============= End provinces and filter resolvers =============

// ============= Start portfolio sync =============
/** Sync portfolio rows from edit-profile UI with GET/POST/PATCH/DELETE mentor portfolio API */
export async function syncMentorPortfolio(userId, items, serverItems = []) {
  if (!isApiEnabled() || !userId) return []

  const serverList =
    serverItems.length > 0 ? serverItems : await fetchMentorPortfolio(userId)
  const serverByLink = new Map(
    serverList
      .filter((r) => r.link)
      .map((r) => [r.oldLink || r.link, r])
  )

  const normalized = (items ?? []).map((item) => ({
    ...portfolioRowToUi(item),
    ...item,
    link: String(item.link ?? '').trim(),
    title: String(item.title ?? '').trim(),
    oldLink: item.oldLink || item.link || undefined,
    pendingFile: item.pendingFile ?? null,
  }))

  const keptLinks = new Set()
  const saved = []

  for (const item of normalized) {
    const hasValidLink = isValidPortfolioUrl(item.link)
    const hasContent =
      hasValidLink ||
      item.title ||
      item.description ||
      item.pendingFile ||
      (item.files?.length ?? 0) > 0
    if (!hasContent) continue

    if (item.pendingFile && !hasValidLink) {
      const created = await createPortfolioWithFile(userId, item, item.pendingFile)
      keptLinks.add(created.link)
      serverByLink.set(created.link, created)
      saved.push(created)
      continue
    }

    if (!hasValidLink) continue

    keptLinks.add(item.link)
    const serverKey = item.oldLink || item.link
    const existing = serverByLink.get(serverKey)

    let row = existing
    if (!existing) {
      row = await createPortfolioItem(userId, item)
      serverByLink.set(item.link, row)
    } else if (item.oldLink && item.oldLink !== item.link) {
      await deletePortfolioItem(userId, item.oldLink)
      serverByLink.delete(item.oldLink)
      row = await createPortfolioItem(userId, item)
      serverByLink.set(item.link, row)
    } else if (portfolioFieldsChanged(existing, item)) {
      row = await updatePortfolioItem(userId, item.oldLink || item.link, item)
      serverByLink.set(item.link, row)
    }

    if (item.pendingFile && row?.link) {
      const uploaded = await uploadPortfolioFile(userId, row.link, item.pendingFile)
      row = {
        ...row,
        files: [...(row.files ?? []), uploaded],
      }
      serverByLink.set(row.link, row)
    }

    saved.push(row)
  }

  for (const [link] of serverByLink) {
    if (!keptLinks.has(link)) {
      await deletePortfolioItem(userId, link)
    }
  }

  return fetchMentorPortfolio(userId)
}
// ============= End portfolio sync =============

// ============= Start posts and schedule =============
/** Published posts → schedule grid rows (one row per post; mentor loaded from profile API). */
export async function mapPublishedPostsToScheduleItems(posts = []) {
  if (!Array.isArray(posts) || posts.length === 0) return []

  const uniqueUserIds = [
    ...new Set(posts.map((post) => post.user_id ?? post.userId).filter(Boolean)),
  ]
  const mentorByUserId = new Map()

  await Promise.all(
    uniqueUserIds.map(async (userId) => {
      const mentor = await fetchMentorWithSkills(userId)
      if (mentor) mentorByUserId.set(String(userId), mentor)
    })
  )

  return posts
    .map((post) => {
      const userId = post.user_id ?? post.userId
      const mentorRow = post.Mentor ?? post.mentor
      let mentor = userId ? mentorByUserId.get(String(userId)) : null
      if (!mentor && mentorRow) {
        mentor = mapMentorToListItem(mentorRow)
      }
      if (!mentor) return null

      const meta = parsePostScheduleMeta(post.description)
      const subSkillRow = post.SubSkill ?? post.sub_skill ?? {}
      const skillRow = subSkillRow.Skill ?? subSkillRow.skill ?? {}
      const subName = skillRowLabel(subSkillRow, 'en')
      const skillParent = skillRowLabel(skillRow, 'en')

      return {
        postId: post.post_id ?? post.id,
        mentor: {
          ...mentor,
          bio: meta.notes || post.description || mentor.bio,
          subject: subName || mentor.subject,
          major: skillParent || mentor.major,
          postSubSkillRow: subSkillRow,
          postSkillRow: skillRow,
          title: post.title || mentor.title,
        },
        timeSlot: meta.timeLabel || meta.time || FILTER_ALL.time,
        sessionDate: meta.date || '',
        timeSortKey: meta.sortKey || '99:99',
        title: post.title ?? '',
        provinceName: post.Province?.province_name ?? '',
        sessionNotes: resolveSessionNotes(meta.notes),
      }
    })
    .filter(Boolean)
    .sort((a, b) => {
      const dateCmp = String(a.sessionDate).localeCompare(String(b.sessionDate))
      if (dateCmp !== 0) return dateCmp
      return compareTimeSortKeys(a.timeSortKey, b.timeSortKey)
    })
}

/** Public feed — published schedule posts from all mentors */
export async function fetchPublishedSchedules({ status = 'published', provinceId, subSkillId, limit } = {}) {
  if (!isApiEnabled()) return []

  const params = new URLSearchParams()
  if (status) params.set('status', status)
  if (provinceId != null) params.set('province_id', String(provinceId))
  if (subSkillId != null) params.set('sub_skill_id', String(subSkillId))
  if (limit != null) params.set('limit', String(limit))

  const qs = params.toString()
  const json = await apiRequest(`${MENTOR_API.posts.listPublished}${qs ? `?${qs}` : ''}`)
  return unwrapApiData(json) ?? []
}

/** Public mentor posts (GET /v1/mentors/:userId/posts) — published by default on profile */
export async function fetchMentorPosts(userId, { status = 'published' } = {}) {
  if (!isApiEnabled() || !userId) return []
  const qs = status ? `?${new URLSearchParams({ status }).toString()}` : ''
  const json = await apiRequest(`${MENTOR_API.posts.byMentor(userId)}${qs}`)
  return unwrapApiData(json) ?? []
}

/** Logged-in mentor's posts — drafts + published (GET /v1/mentors/me/posts) */
export async function fetchMyMentorPosts({ status } = {}) {
  if (!isApiEnabled()) return []
  const qs = status ? `?${new URLSearchParams({ status }).toString()}` : ''
  const json = await apiRequest(`${MENTOR_API.myPosts}${qs}`)
  return unwrapApiData(json) ?? []
}

export async function fetchMentorPostById(postId) {
  if (!isApiEnabled() || !postId) return null
  return unwrapApiData(await apiRequest(MENTOR_API.posts.byId(postId)))
}

/** Post + mentor profile for schedule detail page */
export async function fetchSchedulePostDetail(postId) {
  const post = await fetchMentorPostById(postId)
  if (!post) return null

  const userId = post.user_id ?? post.userId
  const mentor = userId ? await fetchMentorWithSkills(userId) : null

  return { post, mentor }
}

export async function createMentorPost(userId, body) {
  if (!isApiEnabled() || !userId) return null
  return unwrapApiData(
    await apiRequest(MENTOR_API.posts.byMentor(userId), {
      method: 'POST',
      body: JSON.stringify(body),
    })
  )
}

export async function updateMentorPost(postId, body) {
  if (!isApiEnabled() || !postId) return null
  return unwrapApiData(
    await apiRequest(MENTOR_API.posts.byId(postId), {
      method: 'PATCH',
      body: JSON.stringify(body),
    })
  )
}

export async function deleteMentorPost(postId) {
  if (!isApiEnabled() || !postId) return
  await apiRequest(MENTOR_API.posts.byId(postId), { method: 'DELETE' })
}
// ============= End posts and schedule =============
// ============= End mentor service =============
