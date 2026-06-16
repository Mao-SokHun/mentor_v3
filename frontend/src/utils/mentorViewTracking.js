import { isApiEnabled } from '@/constants'
import { recordMentorProfileView } from '@/services/mentors/mentorService'

const LOCAL_VIEW_COUNTS_KEY = 'rokkru_mentor_detail_view_counts'

function readLocalViewCounts() {
  try {
    const raw = localStorage.getItem(LOCAL_VIEW_COUNTS_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function writeLocalViewCounts(map) {
  try {
    localStorage.setItem(LOCAL_VIEW_COUNTS_KEY, JSON.stringify(map))
  } catch {
    /* ignore quota errors */
  }
}

export function incrementLocalDetailView(mentorId) {
  if (!mentorId) return
  const map = readLocalViewCounts()
  const key = String(mentorId)
  map[key] = (map[key] || 0) + 1
  writeLocalViewCounts(map)
}

export function getLocalDetailViewCount(mentorId) {
  if (!mentorId) return 0
  const map = readLocalViewCounts()
  return Number(map[String(mentorId)] || 0)
}

/** Fire-and-forget — count Detail button click for teacher report */
export function trackMentorDetailClick(mentorId) {
  if (!mentorId) return

  if (!isApiEnabled()) {
    incrementLocalDetailView(mentorId)
    return
  }

  void recordMentorProfileView(mentorId).catch(() => {
    incrementLocalDetailView(mentorId)
  })
}
