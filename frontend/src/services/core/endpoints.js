/**
 * API path constants — must match backend routes.
 *
 * Base URL (.env): VITE_API_URL=http://localhost:3000/api
 * Full URL = VITE_API_URL + path
 *
 * Naming:
 * - Backend resource: mentor  →  /api/v1/mentors/...
 * - UI role & pages:  mentor  →  /mentor/edit-profile, /mentor/home, ...
 */

const mentorRoutes = {
  list: '/v1/mentors',
  search: '/v1/mentors/search',
  byId: (userId) => `/v1/mentors/${userId}`,
  profileViews: (userId) => `/v1/mentors/${userId}/profile-views`,
  me: '/v1/mentors/me',
  myAnalytics: '/v1/mentors/me/analytics',
  myDashboard: '/v1/mentors/me/dashboard',
  myEditProfile: '/v1/mentors/me/edit-profile',
  myPosts: '/v1/mentors/me/posts',
  create: '/v1/mentors',
  catalog: '/v1/mentors/catalog',
  skills: {
    listAll: '/v1/mentors/skill/listAllSkill',
    byMentor: (userId) => `/v1/mentors/${userId}/skills`,
  },
  provinces: {
    listAll: '/v1/mentors/provinces/listAll',
  },
  portfolio: {
    byMentor: (userId) => `/v1/mentors/${userId}/portfolio`,
    withFile: (userId) => `/v1/mentors/${userId}/portfolio/with-file`,
    item: (userId, link) =>
      `/v1/mentors/${userId}/portfolio/${encodeURIComponent(link)}`,
    files: (userId, link) =>
      `/v1/mentors/${userId}/portfolio/${encodeURIComponent(link)}/files`,
    file: (userId, link, fileId) =>
      `/v1/mentors/${userId}/portfolio/${encodeURIComponent(link)}/files/${fileId}`,
  },
  experience: {
    byMentor: (userId) => `/v1/mentors/${userId}/experience`,
    item: (userId, experienceId) =>
      `/v1/mentors/${userId}/experience/${experienceId}`,
  },
  posts: {
    listPublished: '/v1/mentors/posts',
    byMentor: (userId) => `/v1/mentors/${userId}/posts`,
    byId: (postId) => `/v1/mentors/posts/${postId}`,
  },
}

export const ENDPOINTS = {
  health: '/health',

  /** Auth — backend mount: /api/v1/auth */
  auth: {
    login: '/v1/auth/login',
    register: '/v1/auth/register',
    logout: '/v1/auth/logout',
    me: '/v1/auth/profile',
    /** PUT — extend when backend adds profile fields on users table */
    updateProfile: '/v1/auth/profile',
    deleteAccount: '/v1/auth/delete-user',
    verifyLoginOtp: '/v1/auth/verify-otp',
    forgotPassword: '/v1/auth/forgot-password',
    verifyResetOtp: '/v1/auth/verify-forgot-otp',
    setNewPassword: '/v1/auth/set-new-password',
    resetPassword: '/v1/auth/reset-password',
  },

  /** User types — backend mount: /api/v1/user-types */
  userTypes: {
    list: '/v1/user-types',
  },

  /** Mentor API — use from /mentor/* pages and mentorService.js */
  mentors: mentorRoutes,

  communities: {
    list: '/communities',
    byId: (id) => `/communities/${id}`,
  },

  sessions: {
    list: '/sessions',
    byId: (id) => `/sessions/${id}`,
  },

  users: {
    me: '/v1/users/me',
    profilePicture: '/v1/users/me/profile-picture',
    list: '/users',
    byId: (id) => `/users/${id}`,
  },

  /**
   * Student profile — your team implements mount e.g. app.use('/api/v1/students', ...)
   * Frontend calls GET/PUT /api/v1/students/me (cookie session).
   */
  students: {
    me: '/v1/students/me',
  },

  admin: {
    reports: '/admin/reports',
    content: '/admin/content',
  },

  /** Platform CMS — team implements /api/v1/platform/content/* */
  platformContent: {
    help: '/v1/platform/content/help',
    terms: '/v1/platform/content/terms',
    privacy: '/v1/platform/content/privacy',
  },

  /** Mentor subscription via Stripe — backend mount: /api/v1/stripe */
  stripe: {
    config: '/v1/stripe/config',
    plans: '/v1/stripe/plans',
    current: '/v1/stripe/subscription/current',
    createCheckout: '/v1/stripe/create-checkout-session',
    session: (sessionId) => `/v1/stripe/session/${encodeURIComponent(sessionId)}`,
  },
}
