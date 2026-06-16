import { isValidLocalPhone } from '../shared/phone.js'
import {
  isNonEmptyString,
  isValueFromOptions,
  isWithinMaxLength,
  validationResult,
} from '../shared/result.js'
import { MENTOR_ERROR_CODES, MENTOR_FIELD_LIMITS } from './rules.js'

/**
 * Mentor (teacher) onboarding step 1 — basic + work info.
 * @param {Record<string, string>} form
 * @param {{ locationOptions?: { value: string }[] }} [ctx]
 */
export function validateMentorOnboardingStep1(form = {}, ctx = {}) {
  /** @type {Record<string, string>} */
  const errors = {}
  const locationOptions = ctx.locationOptions ?? []
  const parsedExperienceYears = parseInt(form.experienceYears, 10)
  const experienceYearsValid =
    !Number.isNaN(parsedExperienceYears) && parsedExperienceYears >= 1

  if (!isNonEmptyString(form.firstName)) {
    errors.firstName = MENTOR_ERROR_CODES.FIRST_NAME_REQUIRED
  } else if (!isWithinMaxLength(form.firstName, MENTOR_FIELD_LIMITS.firstname)) {
    errors.firstName = MENTOR_ERROR_CODES.FIRST_NAME_TOO_LONG
  }

  if (!isNonEmptyString(form.lastName)) {
    errors.lastName = MENTOR_ERROR_CODES.LAST_NAME_REQUIRED
  } else if (!isWithinMaxLength(form.lastName, MENTOR_FIELD_LIMITS.lastname)) {
    errors.lastName = MENTOR_ERROR_CODES.LAST_NAME_TOO_LONG
  }

  const provinceFromList = isValueFromOptions(form.province, locationOptions)
  if (!provinceFromList) {
    errors.province = MENTOR_ERROR_CODES.PROVINCE_REQUIRED
  }

  if (!hasPhoneDigits(form.phone)) {
    errors.phone = MENTOR_ERROR_CODES.PHONE_REQUIRED
  } else if (!isValidLocalPhone(form.phone)) {
    errors.phone = MENTOR_ERROR_CODES.PHONE_INVALID
  }

  if (!isNonEmptyString(form.gender)) {
    errors.gender = MENTOR_ERROR_CODES.GENDER_REQUIRED
  }

  if (!experienceYearsValid) {
    errors.experienceYears = MENTOR_ERROR_CODES.EXPERIENCE_YEARS_INVALID
  }

  return {
    ...validationResult(Object.keys(errors).length === 0, errors),
    provinceFromList,
    experienceYearsValid,
    parsedExperienceYears,
  }
}

/**
 * Mentor onboarding step 2 — teaching focus.
 * @param {Record<string, string>} form
 */
export function validateMentorOnboardingStep2(form = {}) {
  /** @type {Record<string, string>} */
  const errors = {}

  if (!isNonEmptyString(form.major)) {
    errors.major = MENTOR_ERROR_CODES.MAJOR_REQUIRED
  }

  if (!isNonEmptyString(form.subject)) {
    errors.subject = MENTOR_ERROR_CODES.SUBJECT_REQUIRED
  }

  return validationResult(Object.keys(errors).length === 0, errors)
}

/**
 * Mentor (teacher) profile complete gate (session / API row).
 * @param {Record<string, unknown>} user
 */
export function validateMentorProfileComplete(user = {}) {
  if (user.profileComplete === true) {
    return validationResult(true)
  }

  /** @type {Record<string, string>} */
  const errors = {}

  if (!isNonEmptyString(user.firstName)) {
    errors.firstName = MENTOR_ERROR_CODES.FIRST_NAME_REQUIRED
  }
  if (!isNonEmptyString(user.lastName)) {
    errors.lastName = MENTOR_ERROR_CODES.LAST_NAME_REQUIRED
  }

  if (!isNonEmptyString(user.province)) {
    errors.province = MENTOR_ERROR_CODES.PROVINCE_REQUIRED
  }

  if (!user.phone) {
    errors.phone = MENTOR_ERROR_CODES.PHONE_REQUIRED
  } else if (!isValidLocalPhone(String(user.phone))) {
    errors.phone = MENTOR_ERROR_CODES.PHONE_INVALID
  }

  if (!isNonEmptyString(user.gender)) errors.gender = MENTOR_ERROR_CODES.GENDER_REQUIRED

  const years = user.experienceYears
  const hasExperience =
    years != null && years !== '' && !Number.isNaN(Number(years)) && Number(years) >= 1
  if (!hasExperience) {
    errors.experienceYears = MENTOR_ERROR_CODES.EXPERIENCE_YEARS_INVALID
  }

  if (!isNonEmptyString(user.major)) errors.major = MENTOR_ERROR_CODES.MAJOR_REQUIRED
  if (!isNonEmptyString(user.subject)) errors.subject = MENTOR_ERROR_CODES.SUBJECT_REQUIRED

  return validationResult(Object.keys(errors).length === 0, errors)
}

function hasPhoneDigits(value) {
  return String(value ?? '').replace(/\D/g, '').length > 0
}
