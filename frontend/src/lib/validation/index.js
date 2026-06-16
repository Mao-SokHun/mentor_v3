export * from './shared/constants.js'
export * from './shared/phone.js'
export * from './shared/auth.js'
export * from './shared/result.js'

export * as student from './student/index.js'
export * as mentor from './mentor/index.js'

export {
  validateStudentOnboardingStep1,
  validateStudentOnboardingStep2,
  validateStudentProfileComplete,
} from './student/index.js'

export {
  validateMentorOnboardingStep1,
  validateMentorOnboardingStep2,
  validateMentorProfileComplete,
} from './mentor/index.js'
