import { EMPTY_STUDENT_PROFILE } from '@/constants'

/** Merge auth/session user fields with empty defaults (no mock personas). */
export function resolveStudentProfile(user, base = EMPTY_STUDENT_PROFILE) {
  const firstName = user?.firstName ?? base.firstName
  const lastName = user?.lastName ?? base.lastName
  const displayName =
    user?.name?.trim() || `${firstName} ${lastName}`.trim() || base.displayName

  return {
    ...base,
    firstName,
    lastName,
    displayName,
    email: user?.email || base.email,
    phone: user?.phone || base.phone,
    bio: user?.bio || base.bio,
    location: user?.location || user?.province || base.location,
    province: user?.province || user?.location || base.province,
    learningFocus: user?.learningFocus || base.learningFocus,
    interests: user?.interests?.length ? user.interests : base.interests,
    goals: user?.goals?.length ? user.goals : base.goals,
  }
}
