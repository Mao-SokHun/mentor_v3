/** Stable error codes — map to i18n in frontend; backend returns code or message. */

export const MENTOR_ERROR_CODES = {
  FIRST_NAME_REQUIRED: 'FIRST_NAME_REQUIRED',
  LAST_NAME_REQUIRED: 'LAST_NAME_REQUIRED',
  FIRST_NAME_TOO_LONG: 'FIRST_NAME_TOO_LONG',
  LAST_NAME_TOO_LONG: 'LAST_NAME_TOO_LONG',
  PHONE_REQUIRED: 'PHONE_REQUIRED',
  PHONE_INVALID: 'PHONE_INVALID',
  PROVINCE_REQUIRED: 'PROVINCE_REQUIRED',
  TITLE_REQUIRED: 'TITLE_REQUIRED',
  GENDER_REQUIRED: 'GENDER_REQUIRED',
  EXPERIENCE_YEARS_INVALID: 'EXPERIENCE_YEARS_INVALID',
  WORK_ORGANIZATION_REQUIRED: 'WORK_ORGANIZATION_REQUIRED',
  WORK_POSITION_REQUIRED: 'WORK_POSITION_REQUIRED',
  MAJOR_REQUIRED: 'MAJOR_REQUIRED',
  SUBJECT_REQUIRED: 'SUBJECT_REQUIRED',
}

/** Suggested i18n keys for frontend (localeEn / localeKm) */
export const MENTOR_ERROR_I18N = {
  [MENTOR_ERROR_CODES.FIRST_NAME_REQUIRED]: 'auth.firstNameRequired',
  [MENTOR_ERROR_CODES.LAST_NAME_REQUIRED]: 'auth.lastNameRequired',
  [MENTOR_ERROR_CODES.PHONE_REQUIRED]: 'auth.phoneRequired',
  [MENTOR_ERROR_CODES.PHONE_INVALID]: 'auth.phoneInvalid',
  [MENTOR_ERROR_CODES.PROVINCE_REQUIRED]: 'auth.locationRequired',
  [MENTOR_ERROR_CODES.TITLE_REQUIRED]: 'mentorOnboarding.titleRequired',
  [MENTOR_ERROR_CODES.GENDER_REQUIRED]: 'mentorOnboarding.genderRequired',
  [MENTOR_ERROR_CODES.EXPERIENCE_YEARS_INVALID]: 'mentorOnboarding.experienceYearsRequired',
  [MENTOR_ERROR_CODES.WORK_ORGANIZATION_REQUIRED]: 'mentorOnboarding.workOrganizationRequired',
  [MENTOR_ERROR_CODES.WORK_POSITION_REQUIRED]: 'mentorOnboarding.workPositionRequired',
  [MENTOR_ERROR_CODES.MAJOR_REQUIRED]: 'mentorOnboarding.majorRequired',
  [MENTOR_ERROR_CODES.SUBJECT_REQUIRED]: 'mentorOnboarding.subjectRequired',
}

export const MENTOR_ONBOARDING_STEP1_FIELDS = [
  'firstName',
  'lastName',
  'province',
  'phone',
  'title',
  'gender',
  'experienceYears',
]

export const MENTOR_ONBOARDING_STEP2_FIELDS = ['major', 'subject']

export const MENTOR_PROFILE_COMPLETE_FIELDS = [
  ...MENTOR_ONBOARDING_STEP1_FIELDS,
  'major',
  'subject',
]

export { MENTOR_FIELD_LIMITS } from '../shared/constants.js'
