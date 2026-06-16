/** Matches backend validatePassword in authValidation.js */
export const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+='"|{}[\]\\/:;<>?,.\~`]).{8,}$/

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isValidEmail(email) {
  return EMAIL_REGEX.test(String(email ?? '').trim())
}

export function isValidPassword(password) {
  return PASSWORD_REGEX.test(String(password ?? ''))
}

const PASSWORD_SPECIAL = /[!@#$%^&*()_\-+='"|{}[\]\\/:;<>?,.\~`]/

/** UI checklist keys — same rules as backend validatePassword (authValidation.js). */
export const PASSWORD_RULE_KEYS = ['minLength', 'uppercase', 'lowercase', 'number', 'special']

/** Per-rule status for checklist UI (matches backend validatePassword). */
export function getPasswordRuleChecks(password) {
  const p = String(password ?? '')
  return {
    minLength: p.length >= 8,
    uppercase: /[A-Z]/.test(p),
    lowercase: /[a-z]/.test(p),
    number: /\d/.test(p),
    special: PASSWORD_SPECIAL.test(p),
  }
}

/** True when new password is identical to the previous one (client-side check). */
export function isSamePassword(oldPassword, newPassword) {
  const old = String(oldPassword ?? '')
  const next = String(newPassword ?? '')
  if (!old || !next) return false
  return old === next
}
