/** Stable error codes — map to i18n in frontend; backend returns code or message. */

export const STUDENT_ERROR_CODES = {
  FIRST_NAME_REQUIRED: 'FIRST_NAME_REQUIRED',
  LAST_NAME_REQUIRED: 'LAST_NAME_REQUIRED',
  FIRST_NAME_TOO_LONG: 'FIRST_NAME_TOO_LONG',
  LAST_NAME_TOO_LONG: 'LAST_NAME_TOO_LONG',
  PHONE_REQUIRED: 'PHONE_REQUIRED',
  PHONE_INVALID: 'PHONE_INVALID',
  LOCATION_REQUIRED: 'LOCATION_REQUIRED',
  INTERESTS_REQUIRED: 'INTERESTS_REQUIRED',
  BIO_TOO_LONG: 'BIO_TOO_LONG',
}

/** Suggested i18n keys for frontend (localeEn / localeKm) */
export const STUDENT_ERROR_I18N = {
  [STUDENT_ERROR_CODES.FIRST_NAME_REQUIRED]: 'auth.firstNameRequired',
  [STUDENT_ERROR_CODES.LAST_NAME_REQUIRED]: 'auth.lastNameRequired',
  [STUDENT_ERROR_CODES.PHONE_REQUIRED]: 'auth.phoneRequired',
  [STUDENT_ERROR_CODES.PHONE_INVALID]: 'auth.phoneInvalid',
  [STUDENT_ERROR_CODES.LOCATION_REQUIRED]: 'auth.locationRequired',
  [STUDENT_ERROR_CODES.INTERESTS_REQUIRED]: 'studentOnboarding.interestsRequired',
}

export const STUDENT_ONBOARDING_STEP1_FIELDS = [
  'firstName',
  'lastName',
  'location',
  'phone',
]

export const STUDENT_ONBOARDING_STEP2_FIELDS = ['interests']

export const STUDENT_PROFILE_COMPLETE_FIELDS = [
  'firstName',
  'lastName',
  'phone',
  'location',
]

export { STUDENT_FIELD_LIMITS } from '../shared/constants.js'
