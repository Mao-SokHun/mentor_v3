/** Filter sentinel values — match backend query omit rules in `toMentorQueryParams` */
import { LANGUAGE_SUBJECTS } from './languageSubjects'

export const FILTER_ALL = {
  major: 'All Majors',
  subject: 'All Subjects',
  location: 'All Provinces',
  sort: 'Highest Rated',
  type: 'All Types',
  time: 'Any Time',
}

export const DEFAULT_TEACHER_FILTERS = {
  ...FILTER_ALL,
  locationDistrict: '',
  locationCommune: '',
  locationVillage: '',
}

/** @deprecated Offline fallback only — majors come from DB `skill` via fetchAllSkills(). Do not extend for new data. */
export const majorOptions = [
  FILTER_ALL.major,
  'Information Technology',
  'Computer Science',
  'Software Engineering',
  'Computer Engineering',
  'Business',
  'Accounting',
  'Economics',
  'Finance',
  'Marketing',
  'Management',
  'Digital Marketing',
  'Data Science',
  'Cyber Security',
  'Artificial Intelligence',
  'Network Engineering',
  'Graphic Design',
  'Architecture',
  'Education',
  'General Knowledge',
  'Language',
  'Law',
  'Medicine',
  'Civil Engineering',
  'Electrical Engineering',
  'Mechanical Engineering',
]

/** @deprecated Offline fallback only — subjects come from DB `sub_skill` via fetchAllSkills(). Do not extend for new data. */
export const subjectOptions = [
  FILTER_ALL.subject,
  'Java',
  'JavaScript',
  'Node JS',
  'React JS',
  'Next JS',
  'Vue JS',
  'Angular',
  'Python',
  'PHP',
  'Laravel',
  'C#',
  '.NET',
  'C++',
  'C',
  'SQL',
  'MySQL',
  'PostgreSQL',
  'MongoDB',
  'Data Structures',
  'Algorithms',
  'UI/UX Design',
  'Machine Learning',
  'Cyber Security',
  'Networking',
  'Mobile Development',
  'Flutter',
  'Android',
  'iOS',
  ...LANGUAGE_SUBJECTS,
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'History',
  'Geography',
  'Statistics',
  'Calculus',
]

export const locationOptions = [
  FILTER_ALL.location,
  'Phnom Penh',
  'Siem Reap',
  'Battambang',
  'Banteay Meanchey',
  'Kampong Cham',
  'Kampong Chhnang',
  'Kampong Speu',
  'Kampong Thom',
  'Kampot',
  'Kandal',
  'Kep',
  'Koh Kong',
  'Kratie',
  'Mondulkiri',
  'Oddar Meanchey',
  'Pailin',
  'Preah Sihanouk',
  'Preah Vihear',
  'Prey Veng',
  'Pursat',
  'Ratanakiri',
  'Stung Treng',
  'Svay Rieng',
  'Takeo',
  'Tbong Khmum',
]

export const sortOptions = [
  'Best Match',
  'Highest Rated',
  'Most Popular',
  'Newest',
  'Most Reviewed',
  'Price: Low to High',
  'Price: High to Low',
  'Nearest Location',
  'Most Students',
  'Top Recommended',
]

export const sessionTypeOptions = [
  FILTER_ALL.type,
  'Private',
  'Group',
  'Private Math',
  'Group Science',
]

export const sessionTimeOptions = [
  FILTER_ALL.time,
  '08:00–10:00',
  '10:00–12:00',
  '12:00–14:00',
  '14:00–16:00',
  '16:00–18:00',
  '18:00–20:00',
]

/** Default option lists — majors/subjects/locations overridden from API when isApiEnabled() (see useMentorFilterCatalog). */
export const DEFAULT_FILTER_OPTION_SET = {
  majors: majorOptions,
  subjects: subjectOptions,
  locations: locationOptions,
  sorts: sortOptions,
  types: sessionTypeOptions,
  times: sessionTimeOptions,
}
