/**
 * @typedef {Record<string, string>} ValidationErrors
 * Error values are i18n keys (e.g. auth.phoneInvalid) for frontend; backend may map to messages.
 */

/**
 * @param {boolean} valid
 * @param {ValidationErrors} [errors]
 */
export function validationResult(valid, errors = {}) {
  return { valid, errors }
}

export function isNonEmptyString(value) {
  return Boolean(String(value ?? '').trim())
}

/**
 * @param {string} value
 * @param {number} maxLength
 */
export function isWithinMaxLength(value, maxLength) {
  if (maxLength == null) return true
  return String(value ?? '').length <= maxLength
}

/**
 * @param {string} value
 * @param {{ value: string }[]} options
 */
export function isValueFromOptions(value, options = []) {
  return options.some((o) => o.value === value)
}
