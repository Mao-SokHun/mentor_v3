/** Khmer Unicode block + Khmer symbols */
const KHMER_SCRIPT_RE = /[\u1780-\u17FF\u19E0-\u19FF]/

export function containsKhmerScript(value) {
  if (value == null || value === '') return false
  return KHMER_SCRIPT_RE.test(String(value))
}

/** Apply Kantumruy typography when any value includes Khmer script (UI may stay EN). */
export function contentFontClass(...values) {
  return values.some(containsKhmerScript) ? 'font-khmer' : undefined
}
