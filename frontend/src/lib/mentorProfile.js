import { EMPTY_TEACHER_PROFILE } from '@/constants'
import { formatMentorDisplayName } from '@/lib/mentorApiMap'

/** Merge auth/API user fields with empty defaults (no mock personas). */
export function resolveMentorProfile(user, base = EMPTY_TEACHER_PROFILE) {
  const firstName = user?.firstName ?? base.firstName
  const lastName = user?.lastName ?? base.lastName
  const displayName =
    user?.name?.trim() ||
    formatMentorDisplayName({ firstName, lastName }) ||
    base.displayName

  return {
    ...base,
    firstName,
    lastName,
    displayName,
    phone: user?.phone || base.phone,
    gender: user?.gender || base.gender,
    experienceYears: user?.experienceYears ?? base.experienceYears,
    workOrganization: user?.workOrganization ?? base.workOrganization,
    workPosition: user?.workPosition ?? base.workPosition,
    experience: user?.experience?.length ? user.experience : base.experience,
    major: user?.major || base.major,
    subject: user?.subject || base.subject,
    province: user?.province || base.province,
    bio: user?.bio || base.bio,
    email: user?.email || base.email,
    schedule: user?.schedule?.length ? user.schedule : base.schedule,
    portfolios: user?.portfolios?.length ? user.portfolios : base.portfolios,
  }
}
