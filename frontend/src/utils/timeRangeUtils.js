/** Separator between start and end in stored/display ranges (en-dash). */
export const TIME_RANGE_DISPLAY_SEP = '–'

const RANGE_SPLIT = /\s*[–—-]\s*/

/** Normalize HTML time input or loose string → HH:mm (24h). */
export function normalizeTimeValue(value) {
  const raw = String(value ?? '').trim()
  if (!raw) return ''

  const match24 = raw.match(/^(\d{1,2}):(\d{2})$/)
  if (match24) {
    const h = Math.min(23, Math.max(0, parseInt(match24[1], 10)))
    const m = Math.min(59, Math.max(0, parseInt(match24[2], 10)))
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
  }

  const match12 = raw.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)
  if (match12) {
    let h = parseInt(match12[1], 10) % 12
    if (match12[3].toUpperCase() === 'PM') h += 12
    const m = Math.min(59, Math.max(0, parseInt(match12[2], 10)))
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
  }

  return raw
}

/** Build display + sortable range from start/end (HH:mm). */
export function formatTimeRange(startTime, endTime) {
  const start = normalizeTimeValue(startTime)
  const end = normalizeTimeValue(endTime)
  if (!start && !end) return ''
  if (!end) return start
  if (!start) return end
  return `${start}${TIME_RANGE_DISPLAY_SEP}${end}`
}

/**
 * Parse legacy "08:00–10:00" or "8:00 AM – 10:30 AM" strings.
 * @returns {{ startTime: string, endTime: string, display: string, sortKey: string }}
 */
export function parseTimeRange(value) {
  const raw = String(value ?? '').trim()
  if (!raw) {
    return { startTime: '', endTime: '', display: '', sortKey: '99:99' }
  }

  const parts = raw.split(RANGE_SPLIT).map((p) => normalizeTimeValue(p)).filter(Boolean)
  const startTime = parts[0] ?? ''
  const endTime = parts[1] ?? ''
  const display = formatTimeRange(startTime, endTime) || raw

  return {
    startTime,
    endTime,
    display,
    sortKey: startTime || '99:99',
  }
}

export function getTimeRangeSortKey(startTime, endTime, legacyTime) {
  const start = normalizeTimeValue(startTime)
  if (start) return start
  return parseTimeRange(legacyTime).sortKey
}

export function compareTimeSortKeys(a, b) {
  return String(a ?? '99:99').localeCompare(String(b ?? '99:99'))
}

/** Compare schedule slots: day order then start time. */
const DAY_ORDER = {
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
  Sunday: 7,
}

export function compareScheduleSlots(a, b) {
  const dayA = DAY_ORDER[a?.day] ?? 99
  const dayB = DAY_ORDER[b?.day] ?? 99
  if (dayA !== dayB) return dayA - dayB
  const keyA = getTimeRangeSortKey(a?.startTime, a?.endTime, a?.time)
  const keyB = getTimeRangeSortKey(b?.startTime, b?.endTime, b?.time)
  return compareTimeSortKeys(keyA, keyB)
}

/** Normalize weekly slot shape for storage/display. */
export function normalizeScheduleSlot(slot = {}) {
  const startTime = normalizeTimeValue(slot.startTime)
  const endTime = normalizeTimeValue(slot.endTime)

  if (startTime || endTime) {
    return {
      ...slot,
      startTime,
      endTime,
      time: formatTimeRange(startTime, endTime),
      sortKey: startTime || '99:99',
    }
  }

  const parsed = parseTimeRange(slot.time)
  return {
    ...slot,
    startTime: parsed.startTime,
    endTime: parsed.endTime,
    time: parsed.display,
    sortKey: parsed.sortKey,
  }
}

export function normalizeScheduleSlots(slots = []) {
  return [...slots.map(normalizeScheduleSlot)].sort(compareScheduleSlots)
}

export function getSlotTimeDisplay(slot) {
  if (!slot) return ''
  const normalized = normalizeScheduleSlot(slot)
  return normalized.time || '—'
}

/** Mentor post description lines (sort-friendly). */
export function buildPostScheduleDescription({ date, startTime, endTime, notes }) {
  const lines = []
  if (date?.trim()) lines.push(`Date: ${date.trim()}`)
  const start = normalizeTimeValue(startTime)
  const end = normalizeTimeValue(endTime)
  if (start) lines.push(`TimeStart: ${start}`)
  if (end) lines.push(`TimeEnd: ${end}`)
  if (notes?.trim()) lines.push(notes.trim())
  return lines.join('\n')
}

export function isValidTimeRange(startTime, endTime) {
  const start = normalizeTimeValue(startTime)
  const end = normalizeTimeValue(endTime)
  if (!start || !end) return Boolean(start || end)
  return compareTimeSortKeys(start, end) < 0
}

/** 24h HH:mm → "09:00 AM" for report slots */
export function formatTime12h(value) {
  const normalized = normalizeTimeValue(value)
  if (!normalized) return String(value ?? '').trim() || '—'
  const [hStr, mStr] = normalized.split(':')
  const h = parseInt(hStr, 10)
  const m = parseInt(mStr, 10)
  if (Number.isNaN(h)) return normalized
  const ampm = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 || 12
  return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`
}

/** First time in a range → 12h label for compact report cells */
export function formatSlotStartTime12h(timeStr) {
  const raw = String(timeStr ?? '').trim()
  if (!raw || raw === '—') return '—'
  const first = raw.split(RANGE_SPLIT)[0]?.trim()
  return formatTime12h(first)
}
