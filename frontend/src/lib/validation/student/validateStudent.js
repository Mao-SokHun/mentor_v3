import { isValidLocalPhone } from '../shared/phone.js'
import {
  isNonEmptyString,
  isValueFromOptions,
  isWithinMaxLength,
  validationResult,
} from '../shared/result.js'
import { STUDENT_ERROR_CODES, STUDENT_FIELD_LIMITS } from './rules.js'

/**
 * Student onboarding step 1 — basic info (CompleteProfileModal step 1).
 * @param {Record<string, string>} form
 * @param {{ locationOptions?: { value: string }[] }} [ctx]
 */
export function validateStudentOnboardingStep1(form = {}, ctx = {}) {
  /** @type {Record<string, string>} */
  const errors = {}
  const locationOptions = ctx.locationOptions ?? []

  if (!isNonEmptyString(form.firstName)) {
    errors.firstName = STUDENT_ERROR_CODES.FIRST_NAME_REQUIRED
  } else if (!isWithinMaxLength(form.firstName, STUDENT_FIELD_LIMITS.firstname)) {
    errors.firstName = STUDENT_ERROR_CODES.FIRST_NAME_TOO_LONG
  }

  if (!isNonEmptyString(form.lastName)) {
    errors.lastName = STUDENT_ERROR_CODES.LAST_NAME_REQUIRED
  } else if (!isWithinMaxLength(form.lastName, STUDENT_FIELD_LIMITS.lastname)) {
    errors.lastName = STUDENT_ERROR_CODES.LAST_NAME_TOO_LONG
  }

  const location = form.location ?? form.province ?? ''
  if (!location || !isValueFromOptions(location, locationOptions)) {
    errors.location = STUDENT_ERROR_CODES.LOCATION_REQUIRED
  }

  if (!hasPhoneDigits(form.phone)) {
    errors.phone = STUDENT_ERROR_CODES.PHONE_REQUIRED
  } else if (!isValidLocalPhone(form.phone)) {
    errors.phone = STUDENT_ERROR_CODES.PHONE_INVALID
  }

  if (form.bio?.trim() && !isWithinMaxLength(form.bio, STUDENT_FIELD_LIMITS.description)) {
    errors.bio = STUDENT_ERROR_CODES.BIO_TOO_LONG
  }

  const locationFromList = isValueFromOptions(location, locationOptions)

  return {
    ...validationResult(Object.keys(errors).length === 0, errors),
    locationFromList,
  }
}

/**
 * Student onboarding step 2 — at least one subject interest.
 * @param {string[]} interests
 */
export function validateStudentOnboardingStep2(interests = []) {
  /** @type {Record<string, string>} */
  const errors = {}
  if (!Array.isArray(interests) || interests.length === 0) {
    errors.interests = STUDENT_ERROR_CODES.INTERESTS_REQUIRED
  }
  return validationResult(Object.keys(errors).length === 0, errors)
}

/**
 * Student profile complete gate (session / API row).
 * @param {Record<string, unknown>} user
 */
export function validateStudentProfileComplete(user = {}) {
  if (user.profileComplete === true) {
    return validationResult(true)
  }

  /** @type {Record<string, string>} */
  const errors = {}

  if (!isNonEmptyString(user.firstName)) {
    errors.firstName = STUDENT_ERROR_CODES.FIRST_NAME_REQUIRED
  }
  if (!isNonEmptyString(user.lastName)) {
    errors.lastName = STUDENT_ERROR_CODES.LAST_NAME_REQUIRED
  }

  const location = user.location ?? user.province ?? ''
  if (!isNonEmptyString(location)) {
    errors.location = STUDENT_ERROR_CODES.LOCATION_REQUIRED
  }

  if (!user.phone) {
    errors.phone = STUDENT_ERROR_CODES.PHONE_REQUIRED
  } else if (!isValidLocalPhone(String(user.phone))) {
    errors.phone = STUDENT_ERROR_CODES.PHONE_INVALID
  }

  return validationResult(Object.keys(errors).length === 0, errors)
}

function hasPhoneDigits(value) {
  return String(value ?? '').replace(/\D/g, '').length > 0
}
