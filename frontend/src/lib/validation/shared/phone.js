import { PHONE_MIN_LENGTH, PHONE_MAX_LENGTH } from './constants.js'

export { PHONE_MIN_LENGTH, PHONE_MAX_LENGTH }

/** Digits only, capped at PHONE_MAX_LENGTH (Cambodia local format). */
export function sanitizePhoneInput(value) {
  return String(value ?? '').replace(/\D/g, '').slice(0, PHONE_MAX_LENGTH)
}

export function getPhoneDigits(value) {
  return sanitizePhoneInput(value)
}

export function isValidLocalPhone(value) {
  const digits = getPhoneDigits(value)
  return digits.length >= PHONE_MIN_LENGTH && digits.length <= PHONE_MAX_LENGTH
}
