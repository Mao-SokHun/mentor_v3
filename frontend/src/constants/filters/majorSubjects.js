import { FILTER_ALL, majorOptions, subjectOptions } from './mentorFilters'
import { GENERAL_KNOWLEDGE_MAJOR, GENERAL_KNOWLEDGE_SUBJECTS } from './generalKnowledgeSubjects'
import { LANGUAGE_MAJOR, LANGUAGE_SUBJECTS } from './languageSubjects'

const ALL_SUBJECT_VALUES = subjectOptions.filter((s) => s !== FILTER_ALL.subject)
const MAJOR_VALUES = majorOptions.filter((m) => m !== FILTER_ALL.major)

const uniq = (items) => [...new Set(items)]
const pick = (...groups) => uniq(groups.flat()).filter((s) => ALL_SUBJECT_VALUES.includes(s))

const WEB = ['JavaScript', 'Node JS', 'React JS', 'Next JS', 'Vue JS', 'Angular', 'PHP', 'Laravel']
const CODE = ['Java', 'JavaScript', 'Python', 'C#', '.NET', 'C++', 'C', 'PHP', 'Node JS']
const DB = ['SQL', 'MySQL', 'PostgreSQL', 'MongoDB']
const MOBILE = ['Mobile Development', 'Flutter', 'Android', 'iOS']
const CS = ['Data Structures', 'Algorithms']
const MATH = ['Mathematics', 'Physics', 'Statistics', 'Calculus']
const BIZ = ['English', 'Mathematics', 'Statistics', 'Calculus']
const SEC = ['Cyber Security', 'Networking']

/** Subjects available per major (English values — matches teacher filter query params) */
export const SUBJECTS_BY_MAJOR = {
  'Information Technology': pick(
    CODE,
    WEB,
    DB,
    MOBILE,
    CS,
    SEC,
    'UI/UX Design',
    'Machine Learning'
  ),
  'Computer Science': pick(CODE, WEB, DB, CS, MOBILE, SEC, 'Machine Learning'),
  'Software Engineering': pick(WEB, CODE, DB, CS, MOBILE, 'UI/UX Design'),
  'Computer Engineering': pick('C', 'C++', 'Java', 'Python', CS, SEC, 'Networking'),
  Business: pick(BIZ),
  Accounting: pick(BIZ),
  Economics: pick(BIZ),
  Finance: pick(BIZ),
  Marketing: pick(BIZ),
  Management: pick(BIZ),
  'Digital Marketing': pick('English', 'Mathematics', 'Statistics'),
  'Data Science': pick('Python', DB, 'Machine Learning', 'Statistics', CS),
  'Cyber Security': pick(SEC, 'Python', 'C++', 'C', 'Java', 'SQL'),
  'Artificial Intelligence': pick('Machine Learning', 'Python', CS, 'Statistics', DB),
  'Network Engineering': pick(SEC, 'C++', 'C', 'Python', 'Java'),
  'Graphic Design': pick('UI/UX Design'),
  Architecture: pick(MATH),
  Education: pick(MATH, 'English', 'Khmer'),
  [GENERAL_KNOWLEDGE_MAJOR]: pick(GENERAL_KNOWLEDGE_SUBJECTS),
  [LANGUAGE_MAJOR]: pick(LANGUAGE_SUBJECTS),
  Law: pick('English', 'Khmer'),
  Medicine: pick(MATH),
  'Civil Engineering': pick(MATH),
  'Electrical Engineering': pick(MATH, 'C++', 'C', 'Python'),
  'Mechanical Engineering': pick(MATH, 'Physics', 'Calculus'),
}

if (import.meta.env?.DEV) {
  const missing = MAJOR_VALUES.filter((major) => !SUBJECTS_BY_MAJOR[major]?.length)
  if (missing.length) {
    console.warn('[majorSubjects] Majors missing subject mapping:', missing)
  }
}

/** @param {string} major */
export function getSubjectsForMajor(major) {
  if (!major || major === FILTER_ALL.major) return []
  const list = SUBJECTS_BY_MAJOR[major]
  return list?.length ? list : ALL_SUBJECT_VALUES
}

/** @param {string} major @param {string} subject */
export function isSubjectValidForMajor(major, subject) {
  if (!subject || subject === FILTER_ALL.subject) return true
  if (!major || major === FILTER_ALL.major) return subject === FILTER_ALL.subject
  return getSubjectsForMajor(major).includes(subject)
}

export function getSubjectFilterOptions(major) {
  if (!major || major === FILTER_ALL.major) return [FILTER_ALL.subject]
  return uniq([FILTER_ALL.subject, ...getSubjectsForMajor(major)])
}
