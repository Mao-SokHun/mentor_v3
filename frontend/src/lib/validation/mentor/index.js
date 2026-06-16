export {
  MENTOR_ERROR_CODES,
  MENTOR_ERROR_I18N,
  MENTOR_FIELD_LIMITS,
  MENTOR_ONBOARDING_STEP1_FIELDS,
  MENTOR_ONBOARDING_STEP2_FIELDS,
  MENTOR_PROFILE_COMPLETE_FIELDS,
} from './rules.js'

export {
  validateMentorOnboardingStep1,
  validateMentorOnboardingStep2,
  validateMentorProfileComplete,
} from './validateMentor.js'

/** Backward-compatible alias */
export { validateMentorProfileComplete as validateMentorProfileCompleteLegacy } from './validateMentor.js'
