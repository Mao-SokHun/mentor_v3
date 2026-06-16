/**
 * Student UI ↔ future student API (your team adds routes; frontend is ready).
 * Validation: frontend/src/lib/validation/student
 */

import { getPhoneDigits } from '@/utils/phoneInput'
import {
  validateStudentOnboardingStep1 as validateStudentOnboardingStep1Shared,
  validateStudentOnboardingStep2 as validateStudentOnboardingStep2Shared,
} from '@/lib/validation/student/index.js'

export function validateStudentOnboardingStep1(form, ctx) {
  return validateStudentOnboardingStep1Shared(form, ctx)
}

export function validateStudentOnboardingStep2(interests) {
  return validateStudentOnboardingStep2Shared(interests)
}

/** Pre-fill student onboarding modal from session / profile cache. */
export function studentOnboardingFormFromUser(user = {}) {
  return {
    firstName: user.firstName ?? '',
    lastName: user.lastName ?? '',
    location: user.location ?? user.province ?? '',
    phone: user.phone ?? '',
    bio: user.bio ?? '',
  }
}

export function studentOnboardingSelectionsFromUser(user = {}) {
  const interests = Array.isArray(user.interests) ? user.interests : []
  const goals = Array.isArray(user.goals) ? user.goals : []
  return { interests, goals }
}

/** UI onboarding/edit form → API body (align with your student table when ready). */
export function studentProfileToApiPayload(profile = {}) {
  const firstname = profile.firstName?.trim() ?? ''
  const lastname = profile.lastName?.trim() ?? ''
  return {
    firstname,
    lastname,
    phone_number: getPhoneDigits(profile.phone) || null,
    address: profile.location || profile.province || null,
    bio: profile.bio?.trim() || null,
    learning_focus: profile.learningFocus || null,
    interests: profile.interests ?? [],
    goals: profile.goals ?? [],
  }
}

/** API row → session user patch */
export function studentApiRowToProfile(row = {}) {
  if (!row || typeof row !== 'object') return {}
  return {
    firstName: row.firstname ?? row.firstName ?? '',
    lastName: row.lastname ?? row.lastName ?? '',
    name: [row.firstname, row.lastname].filter(Boolean).join(' ').trim(),
    phone: row.phone_number ?? row.phone ?? '',
    location: row.address ?? row.location ?? '',
    province: row.address ?? row.province ?? '',
    bio: row.bio ?? '',
    learningFocus: row.learning_focus ?? row.learningFocus ?? '',
    interests: row.interests ?? [],
    goals: row.goals ?? [],
  }
}
