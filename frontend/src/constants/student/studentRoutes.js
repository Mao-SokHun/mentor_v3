/**
 * Student & shared browse routes — single source of truth for navigation.
 * Shared paths (home, schedule, search) are used by both students and mentors.
 */

/** Browse — shared with mentor (role={null} in App.jsx) */
export const SHARED_ROUTES = {
  home: '/home',
  schedule: '/schedule',
  schedulePost: (postId) => `/schedule/post/${postId}`,
  search: (q = '') => (q ? `/search?q=${encodeURIComponent(q)}` : '/search'),
  community: '/community',
  mentorDetail: (mentorId) => `/mentor/${mentorId}`,
  messages: '/messages',
  notifications: '/notifications',
}

/** Student-only (role="student" in App.jsx) */
export const STUDENT_ROUTES = {
  profile: '/profile',
  editProfile: '/student/edit-profile',
  book: (mentorId) => `/book/${mentorId}`,
  sessionReview: (sessionId) => `/session/${sessionId}/review`,
  bookings: '/student/bookings',
}

export const studentRoutes = { ...SHARED_ROUTES, ...STUDENT_ROUTES }

export default studentRoutes
