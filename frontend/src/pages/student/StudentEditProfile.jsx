import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera, Mail, Phone, BookOpen, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/hooks'
import { PageScaffold, PageCard, PageAmbient, ChangePasswordCard } from '@/components'
import NameFieldsGrid from '@/components/common/NameFieldsGrid'
import Modal from '@/components/ui/Modal'
import Avatar from '../../components/ui/Avatar'
import Select from '../../components/ui/Select'
import SearchableSelect from '../../components/ui/SearchableSelect'
import clsx from 'clsx'
import { useTranslation, localizeOptionList } from '@/i18n'
import { isApiEnabled } from '@/constants'
import { deleteAccountWithPassword } from '@/services/auth/authService'
import { fetchProvinces } from '@/services/mentors/mentorService'
import { buildProvinceOptionObjects, resolveProvinceCanonicalName } from '@/utils/provinceOptions'
import { resolveStudentProfile } from '@/lib/studentProfile'
import {
  saveStudentProfile,
  fetchMyStudentProfile,
} from '@/services/students/studentProfileService'
import { getPhoneDigits, sanitizePhoneInput } from '@/utils/phoneInput'

const subjectOptions = [
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'English',
  'Data Science',
  'Programming',
  'History',
  'Economics',
]
const learningFocusAreas = ['IT', 'Language', 'Accounting', 'General Knowledge']

const fieldLabelClass = 'block text-xs font-medium text-slate-500 mb-1.5'
const fieldInputClass =
  'w-full text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-200'

const StudentEditProfile = () => {
  const navigate = useNavigate()
  const { user, logout, updateUser } = useAuth()
  const { t, labelFor, isKhmer, lang } = useTranslation()
  const defaults = resolveStudentProfile(user)
  const studentId = user?.id ? String(user.id).padStart(5, '0') : '—'

  const [profileLoading, setProfileLoading] = useState(isApiEnabled())
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [firstName, setFirstName] = useState(defaults.firstName ?? '')
  const [lastName, setLastName] = useState(defaults.lastName ?? '')
  const [bio, setBio] = useState(defaults.bio)
  const [email, setEmail] = useState(defaults.email)
  const [phone, setPhone] = useState(defaults.phone)
  const [learningFocus, setLearningFocus] = useState(defaults.learningFocus)
  const [province, setProvince] = useState(defaults.province || defaults.location)
  const [selectedSubjects, setSelectedSubjects] = useState(defaults.interests)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')
  const [showDeletePassword, setShowDeletePassword] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const [deletingAccount, setDeletingAccount] = useState(false)
  const [provinceRows, setProvinceRows] = useState([])
  const photoInputRef = useRef(null)

  const displayName =
    `${firstName} ${lastName}`.trim() || defaults.displayName || t('auth.student')

  const learningFocusOptions = localizeOptionList(learningFocusAreas, labelFor)
  const provinceOptions = useMemo(() => {
    if (provinceRows.length) {
      return buildProvinceOptionObjects(provinceRows, lang)
    }
    return []
  }, [provinceRows, lang])

  useEffect(() => {
    if (!isApiEnabled()) return
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
  }, [])

  useEffect(() => {
    if (!provinceRows.length) return
    setProvince((current) =>
      resolveProvinceCanonicalName(current, provinceRows) || current
    )
  }, [provinceRows])

  useEffect(() => {
    if (!isApiEnabled() || !user?.id) {
      setProfileLoading(false)
      return
    }

    let cancelled = false
    setProfileLoading(true)

    fetchMyStudentProfile()
      .then((row) => {
        if (cancelled || !row) return
        const merged = resolveStudentProfile({ ...user, ...row })
        setFirstName(merged.firstName ?? '')
        setLastName(merged.lastName ?? '')
        setBio(merged.bio)
        setPhone(merged.phone)
        setLearningFocus(merged.learningFocus)
        setProvince(merged.province || merged.location)
        setSelectedSubjects(merged.interests)
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setProfileLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [user?.id])

  const openPhotoPicker = () => photoInputRef.current?.click()

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return URL.createObjectURL(file)
    })
  }

  useEffect(
    () => () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview)
    },
    [avatarPreview]
  )

  const toggleSubject = (s) =>
    setSelectedSubjects((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]))

  const handleSave = async () => {
    setSaveError('')
    const trimmedFirst = firstName.trim()
    const trimmedLast = lastName.trim()
    if (!trimmedFirst) {
      setSaveError(t('auth.firstNameRequired'))
      return
    }
    if (!trimmedLast) {
      setSaveError(t('auth.lastNameRequired'))
      return
    }
    setSaving(true)
    try {
      const provinceToSave =
        resolveProvinceCanonicalName(province, provinceRows) || province
      const patch = {
        firstName: trimmedFirst,
        lastName: trimmedLast,
        name: `${trimmedFirst} ${trimmedLast}`.trim(),
        email,
        phone: getPhoneDigits(phone),
        bio: bio.trim(),
        location: provinceToSave,
        province: provinceToSave,
        learningFocus,
        interests: selectedSubjects,
        goals: user?.goals ?? [],
      }
      const saved = await saveStudentProfile(patch)
      updateUser(saved)
      navigate('/profile')
    } catch (err) {
      setSaveError(err?.message || t('profile.saveFailed'))
    } finally {
      setSaving(false)
    }
  }

  const openDeleteModal = () => {
    setDeleteModalOpen(true)
    setDeletePassword('')
    setShowDeletePassword(false)
    setDeleteError('')
  }

  const closeDeleteModal = () => {
    if (deletingAccount) return
    setDeleteModalOpen(false)
    setDeletePassword('')
    setShowDeletePassword(false)
    setDeleteError('')
  }

  const handleDeleteAccount = async () => {
    setDeleteError('')
    if (!deletePassword.trim()) {
      setDeleteError(t('mentorProfile.deletePasswordRequired'))
      return
    }

    setDeletingAccount(true)
    try {
      await deleteAccountWithPassword({
        userId: user?.id,
        password: deletePassword,
      })
      await logout()
      navigate('/login', { replace: true })
    } catch (err) {
      if (err?.message === 'DELETE_ACCOUNT_ENDPOINT_UNAVAILABLE') {
        setDeleteError(t('mentorProfile.deleteAccountEndpointUnavailable'))
      } else if (err?.message === 'DELETE_ACCOUNT_PASSWORD_INCORRECT') {
        setDeleteError(t('mentorProfile.deletePasswordIncorrect'))
      } else if (err?.message === 'DELETE_ACCOUNT_USER_NOT_FOUND') {
        setDeleteError(t('mentorProfile.deleteAccountUserNotFound'))
      } else if (err?.message === 'DELETE_ACCOUNT_PASSWORD_REQUIRED') {
        setDeleteError(t('mentorProfile.deletePasswordRequired'))
      } else {
        setDeleteError(t('mentorProfile.deleteAccountFailed'))
      }
    } finally {
      setDeletingAccount(false)
    }
  }

  if (profileLoading) {
    return (
      <PageAmbient variant="ambient">
        <div className="py-16 text-center text-slate-500">{t('student.loadingMentors')}</div>
      </PageAmbient>
    )
  }

  return (
    <PageAmbient variant="ambient" className="space-y-6">
      <PageScaffold
        title={t('profile.editTitle')}
        subtitle={t('profile.editSubtitle')}
        action={
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => navigate('/profile')}
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-60"
            >
              {t('profile.cancel')}
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2 text-sm font-semibold bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors shadow-sm disabled:opacity-60"
            >
              {saving ? t('profile.saving') : t('profile.saveChanges')}
            </button>
          </div>
        }
        className="mb-2"
      >
        {saveError && (
          <p className="text-sm text-red-600 mb-4" role="alert">
            {saveError}
          </p>
        )}
        <div className="grid lg:grid-cols-3 gap-5">
          <div className="space-y-4">
            <PageCard className="text-center">
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={handlePhotoChange}
              />
              <div className="relative w-24 h-24 mx-auto mb-4">
                <Avatar name={displayName} src={avatarPreview} size="xl" />
                <button
                  type="button"
                  onClick={openPhotoPicker}
                  className="absolute bottom-0 right-0 w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center hover:bg-primary-600 transition-colors shadow-md"
                  aria-label={t('profile.uploadPhotoAria')}
                >
                  <Camera className="w-4 h-4 text-white" />
                </button>
              </div>
              <p className="font-semibold text-slate-800">{displayName}</p>
              <button
                type="button"
                onClick={openPhotoPicker}
                className="mt-2 text-xs text-primary-600 hover:underline font-medium"
              >
                {t('profile.uploadPhoto')}
              </button>
            </PageCard>

            <PageCard>
              <h3 className="font-bold text-slate-800 text-sm mb-4">{t('profile.schoolLocation')}</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">{t('profile.studentId')}</label>
                  <p className="text-sm font-medium text-slate-700">{studentId}</p>
                </div>
                <Select
                  id="learningFocus"
                  label={t('profile.learningFocus')}
                  labelClassName="block text-xs font-medium text-slate-500 mb-1.5"
                  value={learningFocus}
                  onChange={setLearningFocus}
                  options={learningFocusOptions}
                  placement="bottom"
                  className="bg-slate-50"
                />
                <SearchableSelect
                  id="province"
                  label={t('profile.province')}
                  labelClassName="block text-xs font-medium text-slate-500 mb-1.5"
                  value={province}
                  onChange={setProvince}
                  options={provinceOptions}
                  placeholder={t('common.typeToSearch')}
                  className="bg-slate-50"
                />
              </div>
            </PageCard>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <PageCard>
              <h3 className="font-bold text-slate-800 mb-4">{t('mentorProfile.personalInfo')}</h3>
              <NameFieldsGrid
                isKhmer={isKhmer}
                firstNameField={
                  <div>
                    <label htmlFor="student-firstName" className={fieldLabelClass}>
                      {t('auth.firstName')}
                    </label>
                    <input
                      id="student-firstName"
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className={fieldInputClass}
                      autoComplete="given-name"
                    />
                  </div>
                }
                lastNameField={
                  <div>
                    <label htmlFor="student-lastName" className={fieldLabelClass}>
                      {t('auth.lastName')}
                    </label>
                    <input
                      id="student-lastName"
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className={fieldInputClass}
                      autoComplete="family-name"
                    />
                  </div>
                }
              />
            </PageCard>

            <PageCard>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-slate-800">{t('profile.aboutMe')}</h3>
                <span className="text-xs text-slate-400">{bio.length} / 500</span>
              </div>
              <textarea
                rows={5}
                value={bio}
                onChange={(e) => setBio(e.target.value.slice(0, 500))}
                placeholder={t('profile.bioPlaceholder')}
                className="w-full text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-primary-200 placeholder-slate-400"
              />
            </PageCard>

            <PageCard>
              <h3 className="font-bold text-slate-800 mb-4">{t('profile.contactDetails')}</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="email" className="block text-xs font-medium text-slate-500 mb-1.5">
                    {t('profile.emailAddress')}
                  </label>
                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus-within:ring-2 focus-within:ring-primary-200">
                    <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      readOnly
                      className="flex-1 text-sm text-slate-700 bg-transparent outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="phone" className="block text-xs font-medium text-slate-500 mb-1.5">
                    {t('profile.mobileNumber')}
                  </label>
                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus-within:ring-2 focus-within:ring-primary-200">
                    <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <input
                      id="phone"
                      type="tel"
                      inputMode="numeric"
                      value={phone}
                      onChange={(e) => setPhone(sanitizePhoneInput(e.target.value))}
                      className="flex-1 text-sm text-slate-700 bg-transparent outline-none"
                    />
                  </div>
                </div>
              </div>
            </PageCard>

            <PageCard>
              <h3 className="font-bold text-slate-800 mb-1">{t('profile.learningPreferences')}</h3>
              <p className="text-xs text-slate-400 mb-4">{t('profile.learningPreferencesHint')}</p>
              <div className="flex flex-wrap gap-2">
                {subjectOptions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleSubject(s)}
                    className={clsx(
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all',
                      selectedSubjects.includes(s)
                        ? 'bg-primary-500 text-white border-primary-400 shadow-sm'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-primary-200 hover:text-primary-600'
                    )}
                  >
                    <BookOpen className="w-3 h-3" />
                    {labelFor(s)}
                  </button>
                ))}
              </div>
            </PageCard>

            <ChangePasswordCard />

            <PageCard className="border border-red-100 bg-red-50/40 space-y-3">
              <h3 className="font-bold text-red-800">{t('mentorProfile.dangerZone')}</h3>
              <p className="text-sm text-red-700">{t('mentorProfile.deleteAccountHint')}</p>
              <div>
                <button
                  type="button"
                  onClick={openDeleteModal}
                  className="px-4 py-2 rounded-xl border border-red-200 bg-white text-red-700 text-sm font-semibold hover:bg-red-50 transition-colors"
                >
                  {t('mentorProfile.deleteAccount')}
                </button>
              </div>
            </PageCard>
          </div>
        </div>
      </PageScaffold>
      <Modal
        open={deleteModalOpen}
        onClose={closeDeleteModal}
        title={<span className="text-red-800 font-extrabold">{t('mentorProfile.deleteAccount')}</span>}
        description={
          <span className="text-slate-800 text-sm font-semibold">
            {t('mentorProfile.deleteAccountConfirm')}
          </span>
        }
        className="border border-slate-200"
        footer={
          <>
            <button
              type="button"
              onClick={closeDeleteModal}
              disabled={deletingAccount}
              className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-60"
            >
              {t('profile.cancel')}
            </button>
            <button
              type="button"
              onClick={handleDeleteAccount}
              disabled={deletingAccount}
              className="px-4 py-2 text-sm font-semibold bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors disabled:opacity-60"
            >
              {deletingAccount
                ? t('mentorProfile.deletingAccount')
                : t('mentorProfile.confirmDeleteAccount')}
            </button>
          </>
        }
      >
        <div className="mb-3 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-700">
          {t('mentorProfile.deleteAccountHint')}
        </div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          {t('mentorProfile.confirmPassword')}
        </label>
        <div className="relative">
          <input
            type={showDeletePassword ? 'text' : 'password'}
            value={deletePassword}
            onChange={(e) => setDeletePassword(e.target.value)}
            placeholder={t('mentorProfile.confirmPasswordPlaceholder')}
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5 pr-10 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-300"
          />
          <button
            type="button"
            onClick={() => setShowDeletePassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            aria-label={
              showDeletePassword
                ? t('mentorProfile.hidePassword')
                : t('mentorProfile.showPassword')
            }
          >
            {showDeletePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {deleteError && <p className="mt-2 text-xs text-red-600">{deleteError}</p>}
      </Modal>
    </PageAmbient>
  )
}

export default StudentEditProfile
