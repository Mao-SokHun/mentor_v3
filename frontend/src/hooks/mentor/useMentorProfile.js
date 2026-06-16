import { useMentorDetail } from './useMentorDetail'

/** @deprecated Prefer useMentorDetail — kept for backward-compatible imports */
export function useMentorProfile(mentorId) {
  const { mentor, portfolio, credentials, availabilitySlots, loading, error } =
    useMentorDetail(mentorId)

  return {
    profile: mentor
      ? {
          ...mentor,
          portfolio,
          credentials,
          availabilitySlots,
        }
      : null,
    loading,
    error,
    setProfile: () => {},
  }
}

export default useMentorProfile
