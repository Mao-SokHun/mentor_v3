import { useAuth } from '@/hooks'
import { isApiEnabled } from '@/constants'
import { isStudentProfileComplete, isMentorProfileComplete, markProfileComplete } from '@/lib/profileCompletion'
import { saveStudentProfileFromOnboarding } from '@/services/students/studentProfileService'
import { saveMentorFromOnboarding, syncMentorSkills } from '@/services/mentors/mentorService'
import CompleteProfileModal from './CompleteProfileModal'
import CompleteMentorProfileModal from './CompleteMentorProfileModal'
import clsx from 'clsx'

/**
 * Blocks app usage until student/teacher completes the onboarding profile card.
 */
const ProfileCompletionGate = ({ children }) => {
  const { user, updateUser } = useAuth()

  const needsStudent = user?.role === 'student' && !isStudentProfileComplete(user)
  const needsMentor = user?.role === 'mentor' && !isMentorProfileComplete(user)
  const blocked = needsStudent || needsMentor

  const handleStudentComplete = async (profile) => {
    const patch = markProfileComplete({
      firstName: profile.firstName,
      lastName: profile.lastName,
      name: profile.name,
      location: profile.location,
      province: profile.location,
      phone: profile.phone,
      bio: profile.bio,
      interests: profile.interests,
      goals: profile.goals,
    })
    updateUser(patch)
    if (isApiEnabled()) {
      await saveStudentProfileFromOnboarding(patch)
    }
  }

  const handleTeacherComplete = async (profile) => {
    const patch = markProfileComplete({
      firstName: profile.firstName,
      lastName: profile.lastName,
      name: profile.name,
      phone: profile.phone,
      gender: profile.gender,
      experienceYears: profile.experienceYears,
      workOrganization: profile.workOrganization,
      workPosition: profile.workPosition,
      experience: profile.experience,
      major: profile.major,
      subject: profile.subject,
      province: profile.province,
      bio: profile.bio,
    })
    updateUser(patch)
    if (isApiEnabled()) {
      await saveMentorFromOnboarding(profile, user?.id)
      if (profile.subSkillId) {
        await syncMentorSkills(user.id, [Number(profile.subSkillId)])
      }
    }
  }

  return (
    <>
      <div
        className={clsx(blocked && 'pointer-events-none select-none opacity-50 saturate-50')}
        aria-hidden={blocked || undefined}
      >
        {children}
      </div>

      <CompleteProfileModal open={needsStudent} onComplete={handleStudentComplete} required />
      <CompleteMentorProfileModal open={needsMentor} onComplete={handleTeacherComplete} required />
    </>
  )
}

export default ProfileCompletionGate
