import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { Check, User, BookOpen, Target } from 'lucide-react'
import Input from '../ui/Input'
import Button from '../ui/Button'
import SearchableSelect from '../ui/SearchableSelect'
import RequiredFieldsHint, { FORM_FINE_PRINT_CLASS } from './RequiredFieldsHint'
import FieldLabel from '../ui/FieldLabel'
import NameFieldsGrid from './NameFieldsGrid'
import clsx from 'clsx'
import { useTranslation, useLocalizedFilterOptions } from '@/i18n'
import { FILTER_ALL, isApiEnabled } from '@/constants'
import { getPhoneDigits, isValidLocalPhone, sanitizePhoneInput } from '@/utils/phoneInput'
import { useAuth } from '@/hooks'
import { fetchProvinces } from '@/services/mentors/mentorService'
import { buildProvinceOptionObjects, resolveProvinceCanonicalName } from '@/utils/provinceOptions'
import {
  studentOnboardingFormFromUser,
  studentOnboardingSelectionsFromUser,
  validateStudentOnboardingStep1,
} from '@/lib/studentApiMap'

const SUBJECTS = [
  'Mathematics',
  'Physics',
  'Data Science',
  'English',
  'Programming',
  'Chemistry',
  'Biology',
  'History',
  'Economics',
  'Art',
]

const GOALS = [
  { id: 'examScores', value: 'Improve exam scores' },
  { id: 'newSkill', value: 'Learn a new skill' },
  { id: 'careerChange', value: 'Prepare for a career change' },
  { id: 'enrichment', value: 'Personal enrichment' },
  { id: 'homework', value: 'Homework help' },
  { id: 'university', value: 'University preparation' },
]

const CompleteProfileModal = ({ open, onComplete, required = false }) => {
  const { user } = useAuth()
  const { t, labelFor, isKhmer, lang } = useTranslation()
  const opts = useLocalizedFilterOptions()
  const [provinceRows, setProvinceRows] = useState([])
  const locationOptions = useMemo(() => {
    if (provinceRows.length) {
      return buildProvinceOptionObjects(provinceRows, lang)
    }
    return opts.locations.filter((o) => o.value !== FILTER_ALL.location)
  }, [provinceRows, opts.locations, lang])
  const [step, setStep] = useState(1)
  const [step1Errors, setStep1Errors] = useState(false)
  const [selected, setSelected] = useState([])
  const [selectedGoals, setSelectedGoals] = useState([])
  const [form, setForm] = useState(() => studentOnboardingFormFromUser(user))

  const steps = [
    {
      id: 1,
      labelKey: 'studentOnboarding.stepBasic',
      shortLabelKey: 'studentOnboarding.stepBasicShort',
      icon: User,
    },
    {
      id: 2,
      labelKey: 'studentOnboarding.stepInterests',
      shortLabelKey: 'studentOnboarding.stepInterestsShort',
      icon: BookOpen,
    },
    {
      id: 3,
      labelKey: 'studentOnboarding.stepGoals',
      shortLabelKey: 'studentOnboarding.stepGoalsShort',
      icon: Target,
    },
  ]

  useEffect(() => {
    if (open) {
      const { interests, goals } = studentOnboardingSelectionsFromUser(user)
      setStep(1)
      setStep1Errors(false)
      setSelected(interests)
      setSelectedGoals(goals)
      setForm(studentOnboardingFormFromUser(user))
    }
  }, [open, user])

  useEffect(() => {
    if (!open || !isApiEnabled()) return
    let cancelled = false
    fetchProvinces()
      .then((rows) => {
        if (!cancelled) setProvinceRows(Array.isArray(rows) ? rows : [])
      })
      .catch(() => {
        if (!cancelled) setProvinceRows([])
      })
    return () => {
      cancelled = true
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  if (!open) return null

  const toggleSubject = (s) =>
    setSelected((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]))

  const toggleGoal = (value) =>
    setSelectedGoals((prev) =>
      prev.includes(value) ? prev.filter((x) => x !== value) : [...prev, value]
    )

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  const step1Check = validateStudentOnboardingStep1(form, { locationOptions })
  const { valid: step1Valid, locationFromList } = step1Check

  const phoneError =
    step1Errors && !isValidLocalPhone(form.phone)
      ? getPhoneDigits(form.phone)
        ? t('auth.phoneInvalid')
        : t('auth.phoneRequired')
      : undefined

  const locationError =
    step1Errors && !locationFromList ? t('auth.locationRequired') : undefined

  const finishOnboarding = () => {
    const firstName = form.firstName.trim()
    const lastName = form.lastName.trim()
    const location =
      resolveProvinceCanonicalName(form.location, provinceRows) || form.location
    onComplete?.({
      firstName,
      lastName,
      name: `${firstName} ${lastName}`.trim(),
      location,
      province: location,
      phone: getPhoneDigits(form.phone),
      bio: form.bio.trim(),
      interests: selected,
      goals: selectedGoals,
    })
  }

  const handleNext = () => {
    if (step === 1) {
      setStep1Errors(true)
      if (!step1Valid) return
      setStep(2)
      return
    }
    if (step === 2) {
      setStep(3)
      return
    }
    finishOnboarding()
  }

  const handleSkip = () => {
    if (step === 2) setStep(3)
    else if (step === 3) finishOnboarding()
  }

  const subjectsSelectedLabel =
    selected.length === 1
      ? t('studentOnboarding.subjectsSelected', { count: selected.length })
      : t('studentOnboarding.subjectsSelected_plural', { count: selected.length })

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6" role="presentation">
      <div className="absolute inset-0 bg-slate-900/45 backdrop-blur-sm" aria-hidden />

      <section
        className={clsx(
          'relative w-full max-w-md max-h-[min(90vh,780px)] flex flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200/80',
          isKhmer && 'font-khmer'
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="complete-profile-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="shrink-0 px-5 pt-5 pb-4 border-b border-slate-100">
          <div className="flex items-center">
            {steps.map((s, i) => (
              <div key={s.id} className="flex items-center flex-1 min-w-0 last:flex-none">
                <div
                  className={clsx(
                    'flex flex-col items-center gap-1',
                    isKhmer ? 'min-w-[4rem] sm:min-w-[5rem]' : 'min-w-[3.5rem]'
                  )}
                >
                  <div
                    className={clsx(
                      'w-9 h-9 rounded-xl flex items-center justify-center transition-all shrink-0',
                      step > s.id
                        ? 'bg-emerald-500 text-white'
                        : step === s.id
                          ? 'bg-primary-500 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-400'
                    )}
                  >
                    {step > s.id ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <s.icon className="w-4 h-4" />
                    )}
                  </div>
                  <span
                    className={clsx(
                      'font-medium text-slate-500 text-center leading-tight px-0.5',
                      isKhmer ? 'text-[10px] sm:text-xs' : 'text-[10px] sm:text-xs'
                    )}
                  >
                    <span className="sm:hidden">{t(s.shortLabelKey)}</span>
                    <span className="hidden sm:inline">{t(s.labelKey)}</span>
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div
                    className={clsx(
                      'flex-1 h-0.5 mx-1.5 sm:mx-2 rounded-full min-w-[0.75rem]',
                      step > s.id ? 'bg-emerald-400' : 'bg-slate-200'
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h2 id="complete-profile-title" className="text-xl font-bold text-slate-800">
                  {t('studentOnboarding.title')}
                </h2>
                <p className="text-slate-500 text-sm mt-1">{t('studentOnboarding.subtitle')}</p>
                {required && (
                  <p className="mt-2 text-xs font-medium text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                    {t('profileCompletion.gateNote')}
                  </p>
                )}
              </div>
              <RequiredFieldsHint>{t('auth.requiredFieldsHint')}</RequiredFieldsHint>
              <NameFieldsGrid
                isKhmer={isKhmer}
                firstNameField={
                  <Input
                    label={t('auth.firstName')}
                    placeholder={t('studentOnboarding.firstNamePlaceholder')}
                    value={form.firstName}
                    onChange={(e) => setField('firstName', e.target.value)}
                    error={step1Errors && !form.firstName.trim() ? t('auth.firstNameRequired') : undefined}
                    required
                  />
                }
                lastNameField={
                  <Input
                    label={t('auth.lastName')}
                    placeholder={t('studentOnboarding.lastNamePlaceholder')}
                    value={form.lastName}
                    onChange={(e) => setField('lastName', e.target.value)}
                    error={step1Errors && !form.lastName.trim() ? t('auth.lastNameRequired') : undefined}
                    required
                  />
                }
              />
              <SearchableSelect
                label={t('studentOnboarding.location')}
                value={form.location}
                onChange={(location) => setField('location', location)}
                options={locationOptions}
                placeholder={t('common.typeToSearch')}
                error={locationError}
                required
              />
              <Input
                label={t('studentOnboarding.phone')}
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                placeholder={t('studentOnboarding.phonePlaceholder')}
                value={form.phone}
                onChange={(e) => setField('phone', sanitizePhoneInput(e.target.value))}
                maxLength={10}
                error={phoneError}
                required
              />
              <div>
                <FieldLabel
                  label={t('studentOnboarding.bio')}
                  optional
                  optionalText={t('auth.optional')}
                />
                <textarea
                  rows={3}
                  value={form.bio}
                  onChange={(e) => setField('bio', e.target.value)}
                  placeholder={t('studentOnboarding.bioPlaceholder')}
                  className="w-full min-h-[5.5rem] rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 resize-y focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-300"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  {t('studentOnboarding.interestsTitle')}
                </h2>
                <p className="text-slate-500 text-sm mt-1">
                  {t('studentOnboarding.interestsSubtitle')}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {SUBJECTS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleSubject(s)}
                    className={clsx(
                      'flex items-center gap-1.5 p-2.5 rounded-xl border text-xs font-medium text-left transition-all min-h-[2.5rem]',
                      selected.includes(s)
                        ? 'bg-primary-500 text-white border-primary-400'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-primary-200 hover:bg-primary-50/40'
                    )}
                  >
                    {selected.includes(s) && <Check className="w-3.5 h-3.5 shrink-0" />}
                    <span className="min-w-0 flex-1 leading-snug">{labelFor(s)}</span>
                  </button>
                ))}
              </div>
              {selected.length > 0 && (
                <p className="text-xs text-primary-600 text-center font-medium">
                  {subjectsSelectedLabel}
                </p>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  {t('studentOnboarding.goalsTitle')}
                </h2>
                <p className="text-slate-500 text-sm mt-1">
                  {t('studentOnboarding.goalsSubtitle')}
                </p>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {GOALS.map(({ id, value }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => toggleGoal(value)}
                    className={clsx(
                      'w-full flex items-center gap-2.5 p-3 rounded-xl border text-sm font-medium text-left transition-all',
                      selectedGoals.includes(value)
                        ? 'bg-primary-500 text-white border-primary-400'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-primary-200 hover:bg-primary-50/40'
                    )}
                  >
                    <div
                      className={clsx(
                        'w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0',
                        selectedGoals.includes(value)
                          ? 'border-white bg-white'
                          : 'border-slate-300'
                      )}
                    >
                      {selectedGoals.includes(value) && (
                        <Check className="w-2.5 h-2.5 text-primary-600" />
                      )}
                    </div>
                    <span className="leading-snug">{t(`studentOnboarding.goals.${id}`)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="shrink-0 border-t border-slate-100 px-5 py-4 sm:px-6 bg-slate-50/60">
          <div className="flex items-center justify-between gap-3">
            {step > 1 ? (
              <Button
                variant="ghost"
                size="sm"
                type="button"
                onClick={() => setStep((s) => s - 1)}
              >
                {t('studentOnboarding.back')}
              </Button>
            ) : (
              <span />
            )}

            <div className="flex items-center gap-2 ml-auto">
              {(step === 2 || step === 3) && (
                <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  onClick={handleSkip}
                  className="text-slate-500"
                >
                  {t('studentOnboarding.skip')}
                </Button>
              )}
              <Button
                variant="primary"
                size="sm"
                type="button"
                onClick={handleNext}
                className="min-w-[7rem] whitespace-nowrap"
              >
                {step === 3 ? t('studentOnboarding.finish') : t('studentOnboarding.continue')}
              </Button>
            </div>
          </div>

          <p className={clsx(FORM_FINE_PRINT_CLASS, 'text-center mt-3', isKhmer && 'font-khmer')}>
            {t('auth.agreeTerms')}{' '}
            <Link to="/terms" className="text-primary-600 hover:underline">
              {t('auth.terms')}
            </Link>{' '}
            {t('auth.and')}{' '}
            <Link to="/privacy" className="text-primary-600 hover:underline">
              {t('auth.privacy')}
            </Link>
          </p>
        </div>
      </section>
    </div>,
    document.body
  )
}

export default CompleteProfileModal
