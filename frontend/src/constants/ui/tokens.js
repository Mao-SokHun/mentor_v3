/** Design tokens aligned with Rok Kru UI (PDF) — polished for production */
export const brand = {
  name: 'Rok kru',
  tagline: 'Precision learning',
  copyright: '© 2026 ROKKRU',
}

/** Left hero panel on login / signup (student & teacher) */
export const authPanelCopy = {
  login: {
    student: {
      title: 'Welcome Student',
      subtitle: 'Continue your journey to academic excellence.',
    },
    teacher: {
      title: 'Welcome Teacher',
      subtitle: 'Manage your classes, schedule, and connect with learners across Cambodia.',
    },
  },
  signup: {
    student: {
      title: 'Start your learning journey',
      subtitle: 'Join thousands of students learning with verified teachers on Rokkru.',
    },
    teacher: {
      title: 'Share your expertise',
      subtitle: 'Create a teacher account and grow your teaching presence on Rokkru.',
    },
  },
}

export const footerLinks = [
  { label: 'Privacy Policy', to: '/privacy' },
  { label: 'Terms of Service', to: '/terms' },
  { label: 'Help Center', to: '/help' },
  { label: 'Contact', to: '/contact' },
]

export const topNavTabs = [
  { label: 'HOME', href: '/home' },
  { label: 'SCHEDULE', href: '/schedule' },
  { label: 'COMMUNITY', href: '/community' },
]

export { COMMUNITY_FEED_TABS as communitySubjectTabs } from '../communities/communityUi'

export const mentorSidebarNav = [
  { label: 'Dashboard', href: '/mentor/home', key: 'dashboard' },
  { label: 'Reports', href: '/mentor/analytics', key: 'reports' },
  { label: 'Subscription', href: '/mentor/subscription', key: 'subscription' },
  { label: 'Create Post', action: 'createPost', key: 'createPost' },
]

/** Landing — teachers + bottom CTA mesh/polygon animation (set true to re-enable) */
export const LANDING_SECTION_BG_ANIMATION_ENABLED = false
