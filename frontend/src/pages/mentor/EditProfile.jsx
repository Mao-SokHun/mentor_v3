import { useEffect, useRef, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Camera,
  Eye,
  EyeOff,
  FlaskConical,
  GraduationCap,
  Mail,
  Phone,
  ShieldAlert,
  User,
  X,
} from 'lucide-react'
import clsx from 'clsx'
import {
  ExperienceSection,
  PortfolioSection,
  PageAmbient,
  ChangePasswordCard,
  MentorEditSectionCard,
} from '@/components'
import Avatar from '../../components/ui/Avatar'
import SearchableSelect from '../../components/ui/SearchableSelect'
import { CatalogSearchSelect } from '@/components'
import { LocationFilterField } from '@/components'
import Modal from '@/components/ui/Modal'
import { useTranslation, useLocalizedFilterOptions } from '@/i18n'
import NameFieldsGrid from '@/components/common/NameFieldsGrid'
import { FILTER_ALL } from '@/constants'
import { TEACHER_GENDER_OPTIONS } from '@/constants'
import { useAuth } from '@/hooks'
import { isApiEnabled } from '@/constants'
import { deleteAccountWithPassword } from '@/services/auth/authService'
import {
  fetchEditProfileBundle,
  buildSkillOptions,
  buildSubSkillOptions,
  resolveSkillSubSkillFromMentorSkills,
  skillNamesFromCatalog,
  splitExperienceByType,
  syncMentorExperience,
  syncMentorSkills,
  syncMentorPortfolio,
  hasDuplicatePortfolioLinks,
  hasInvalidPortfolioLinks,
  resolveProvinceId,
  updateMentorProfile,
  uploadMentorProfilePicture,
} from '@/services/mentors/mentorService'
import { resolveProfilePictureUrl } from '@/utils/profilePictureUtils'
import { formatMentorDisplayName } from '@/lib/mentorApiMap'
import { buildProvinceOptionObjects, resolveProvinceCanonicalName } from '@/utils/provinceOptions'

const BIO_MAX_LENGTH = 1500
import { resolveMentorProfile } from '@/lib/mentorProfile'

const FILTER_LABEL = 'block text-sm font-semibold text-slate-700 mb-1.5'
const FILTER_SELECT = '!py-2.5'

const SECTION_STACK = 'space-y-3'

const initialPortfolios = (defaults) => {
  if (defaults.portfolios?.length) return defaults.portfolios
  return []
}

// ============= Start edit profile page =============
const EditProfile = () => {
  const navigate = useNavigate()
  const { t, isKhmer, lang, labelFor } = useTranslation()
  const { user, logout, updateUser } = useAuth()
  const photoInputRef = useRef(null)
  const defaults = resolveMentorProfile(user)
  const opts = useLocalizedFilterOptions()

  const [profileLoading, setProfileLoading] = useState(isApiEnabled())
  /** Fields from mentor API row (experience_years, parsed description) */
  const [mentorSnapshot, setMentorSnapshot] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [loadError, setLoadError] = useState('')
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')
  const [showDeletePassword, setShowDeletePassword] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const [deletingAccount, setDeletingAccount] = useState(false)

  const [avatarPreview, setAvatarPreview] = useState(null)
  const [avatarFile, setAvatarFile] = useState(null)
  const [gender, setGender] = useState(defaults.gender)
  const [education, setEducation] = useState([])
  const [educationSnapshot, setEducationSnapshot] = useState([])
  const [workExperience, setWorkExperience] = useState([])
  const [workExperienceSnapshot, setWorkExperienceSnapshot] = useState([])
  const [portfolios, setPortfolios] = useState(() => initialPortfolios(defaults))
  const [portfolioSnapshot, setPortfolioSnapshot] = useState([])
  const [skillsCatalog, setSkillsCatalog] = useState([])
  const [provinceOptions, setProvinceOptions] = useState([])
  const [selectedSkillId, setSelectedSkillId] = useState('')
  const [selectedSubSkillId, setSelectedSubSkillId] = useState('')
  const [skillsSnapshot, setSkillsSnapshot] = useState([])
  const [form, setForm] = useState({
    firstName: defaults.firstName,
    lastName: defaults.lastName,
    phone: defaults.phone,
    province: defaults.province,
    locationDistrict: defaults.locationDistrict ?? '',
    locationCommune: defaults.locationCommune ?? '',
    locationVillage: defaults.locationVillage ?? '',
    bio: defaults.bio,
    major: defaults.major,
    subject: defaults.subject,
    email: defaults.email,
  })

  const displayName = formatMentorDisplayName(
    { firstName: form.firstName, lastName: form.lastName },
    { familyFirst: isKhmer }
  )

  const skillPreview = useMemo(
    () => skillNamesFromCatalog(skillsCatalog, selectedSkillId, selectedSubSkillId, lang),
    [skillsCatalog, selectedSkillId, selectedSubSkillId, lang]
  )

  const specializationPreview = useMemo(() => {
    const subject = skillPreview.subSkillName || skillPreview.skillName || form.subject || form.major
    if (!subject) return null
    return t('mentorProfile.specialist', { subject })
  }, [skillPreview, form.subject, form.major, t])

  const skillSelectOptions = useMemo(
    () =>
      buildSkillOptions(skillsCatalog, lang).map((o) => ({
        value: String(o.value),
        label: o.label,
      })),
    [skillsCatalog, lang]
  )

  const subSkillSelectOptions = useMemo(
    () =>
      buildSubSkillOptions(skillsCatalog, selectedSkillId, lang).map((o) => ({
        value: String(o.value),
        label: o.label,
      })),
    [skillsCatalog, selectedSkillId, lang]
  )

  const locationOptions = useMemo(() => {
    if (provinceOptions.length) {
      return buildProvinceOptionObjects(provinceOptions, lang)
    }
    return opts.locations.filter((o) => o.value !== FILTER_ALL.location)
  }, [provinceOptions, opts.locations, lang])

  const metaPreview = useMemo(() => {
    const provinceLabel = form.province
      ? locationOptions.find((o) => o.value === form.province)?.label ?? form.province
      : ''
    const parts = [
      skillPreview.subSkillName || skillPreview.skillName || form.subject || form.major,
      provinceLabel,
    ].filter(Boolean)
    return parts.join(' • ')
  }, [skillPreview, form.subject, form.major, form.province, locationOptions])

  const handleSkillChange = (skillId) => {
    setSelectedSkillId(skillId)
    setSelectedSubSkillId('')
    const { skillName } = skillNamesFromCatalog(skillsCatalog, skillId, '', lang)
    setForm((prev) => ({ ...prev, major: skillName, subject: '' }))
  }

  const handleSubSkillChange = (subSkillId) => {
    setSelectedSubSkillId(subSkillId)
    const { skillName, subSkillName } = skillNamesFromCatalog(
      skillsCatalog,
      selectedSkillId,
      subSkillId,
      lang
    )
    setForm((prev) => ({ ...prev, major: skillName, subject: subSkillName }))
  }

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))

  const inputClass =
    'w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-100 focus:border-teal-400 transition-shadow disabled:bg-slate-50 disabled:text-slate-500'

  const labelClass = 'block text-xs font-semibold text-slate-600 mb-1'

  const openPhotoPicker = () => photoInputRef.current?.click()

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) return
    setAvatarFile(file)
    setAvatarPreview((prev) => {
      if (prev?.startsWith('blob:')) URL.revokeObjectURL(prev)
      return URL.createObjectURL(file)
    })
  }

  useEffect(
    () => () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview)
    },
    [avatarPreview]
  )

  useEffect(() => {
    if (!isApiEnabled() || !user?.id) {
      setProfileLoading(false)
      return
    }

    let cancelled = false
    setProfileLoading(true)
    setLoadError('')

    fetchEditProfileBundle(user)
      .then(
        ({
          profile,
          portfolio: portfolioRows,
          experience: experienceRows,
          mentorSkills,
          skillsCatalog: catalog,
          provinces,
          hasMentorRow,
        }) => {
        if (cancelled) return
        const canonicalProvince =
          resolveProvinceCanonicalName(profile.province, provinces) || profile.province || ''

        setMentorSnapshot(profile)
        const savedPicture = resolveProfilePictureUrl(profile.profilePicture ?? profile.avatarUrl)
        setAvatarPreview(savedPicture)
        setAvatarFile(null)
        setGender(profile.gender ?? defaults.gender)
        const { education: eduRows, work: workRows } = splitExperienceByType(experienceRows)
        setEducation(eduRows)
        setEducationSnapshot(eduRows.map((row) => ({ ...row })))
        setWorkExperience(workRows)
        setWorkExperienceSnapshot(workRows.map((row) => ({ ...row })))
        setForm((prev) => ({
          ...prev,
          firstName: profile.firstName ?? '',
          lastName: profile.lastName ?? '',
          phone: profile.phone ?? prev.phone,
          email: user?.email ?? prev.email,
          province: canonicalProvince || prev.province,
          major: profile.major ?? prev.major,
          subject: profile.subject ?? prev.subject,
          bio: String(profile.bio ?? prev.bio ?? '').slice(0, BIO_MAX_LENGTH),
        }))
        if (hasMentorRow) {
          updateUser({
            firstName: profile.firstName,
            lastName: profile.lastName,
            name:
              formatMentorDisplayName(
                { firstName: profile.firstName ?? '', lastName: profile.lastName ?? '' },
                { familyFirst: isKhmer }
              ) || user?.name,
            phone: profile.phone,
            gender: profile.gender,
            province: canonicalProvince,
            major: profile.major,
            subject: profile.subject,
            bio: profile.bio,
            avatarUrl: savedPicture || user?.avatarUrl,
            profilePicture: profile.profilePicture ?? profile.avatarUrl,
          })
        }
        const rows = portfolioRows?.length ? portfolioRows : initialPortfolios(defaults)
        setPortfolios(rows)
        setPortfolioSnapshot(
          (portfolioRows ?? []).map((row) => ({
            ...row,
            files: Array.isArray(row.files) ? [...row.files] : [],
          }))
        )
        setSkillsCatalog(catalog ?? [])
        setProvinceOptions(provinces ?? [])
        const { skillId, subSkillId } = resolveSkillSubSkillFromMentorSkills(
          mentorSkills,
          catalog
        )
        setSelectedSkillId(skillId)
        setSelectedSubSkillId(subSkillId)
        setSkillsSnapshot(mentorSkills ?? [])
        if (skillId && subSkillId) {
          const names = skillNamesFromCatalog(catalog, skillId, subSkillId, lang)
          setForm((prev) => ({
            ...prev,
            major: names.skillName || profile.major || prev.major,
            subject: names.subSkillName || profile.subject || prev.subject,
          }))
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLoadError(t('mentorProfile.loadFailed'))
        }
      })
      .finally(() => {
        if (!cancelled) setProfileLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [user?.id])

  const handleSave = async () => {
    setSaveError('')
    const trimmedFirst = form.firstName.trim()
    const trimmedLast = form.lastName.trim()
    if (!trimmedFirst) {
      setSaveError(t('auth.firstNameRequired'))
      return
    }
    if (!trimmedLast) {
      setSaveError(t('auth.lastNameRequired'))
      return
    }
    if (hasInvalidPortfolioLinks(portfolios)) {
      setSaveError(t('mentorProfile.portfolioInvalidUrlHint'))
      return
    }
    if (hasDuplicatePortfolioLinks(portfolios)) {
      setSaveError(t('mentorProfile.portfolioDuplicate'))
      return
    }
    if (!isApiEnabled() || !user?.id) {
      navigate('/mentor/my-profile')
      return
    }

    setSaving(true)
    try {
      // Start save profile and related data
      let uploadedPictureUrl = null
      if (avatarFile) {
        const uploaded = await uploadMentorProfilePicture(user.id, avatarFile)
        uploadedPictureUrl = uploaded?.profile_picture ?? null
        setAvatarFile(null)
        if (uploadedPictureUrl) {
          setAvatarPreview(resolveProfilePictureUrl(uploadedPictureUrl))
        }
      }

      const provinceToSave =
        resolveProvinceCanonicalName(form.province, provinceOptions) || form.province
      const provinceId = resolveProvinceId(provinceToSave, provinceOptions)
      const teachingNames = selectedSkillId
        ? skillNamesFromCatalog(skillsCatalog, selectedSkillId, selectedSubSkillId, 'en')
        : { skillName: form.major, subSkillName: form.subject }

      await updateMentorProfile(
        user.id,
        {
          firstName: trimmedFirst,
          lastName: trimmedLast,
          gender,
          phone: form.phone,
          province: provinceToSave,
          provinceId,
          bio: form.bio,
          major: teachingNames.skillName || form.major,
          subject: teachingNames.subSkillName || form.subject,
        },
        provinceOptions
      )
      const savedEducation = await syncMentorExperience(
        user.id,
        education,
        educationSnapshot,
        'education'
      )
      const savedWork = await syncMentorExperience(
        user.id,
        workExperience,
        workExperienceSnapshot,
        'work'
      )
      setEducation(savedEducation)
      setEducationSnapshot(savedEducation)
      setWorkExperience(savedWork)
      setWorkExperienceSnapshot(savedWork)
      const savedPortfolio = await syncMentorPortfolio(user.id, portfolios, portfolioSnapshot)
      setPortfolios(savedPortfolio.length ? savedPortfolio : initialPortfolios(defaults))
      setPortfolioSnapshot(savedPortfolio)
      const subIdsToSave = selectedSubSkillId ? [Number(selectedSubSkillId)] : []
      const savedSkills = await syncMentorSkills(
        user.id,
        subIdsToSave,
        skillsSnapshot,
        skillsCatalog
      )
      setSkillsSnapshot(savedSkills)
      const resolved = resolveSkillSubSkillFromMentorSkills(savedSkills, skillsCatalog)
      setSelectedSkillId(resolved.skillId)
      setSelectedSubSkillId(resolved.subSkillId)
      const savedName = formatMentorDisplayName(
        { firstName: trimmedFirst, lastName: trimmedLast },
        { familyFirst: isKhmer }
      )
      updateUser({
        firstName: trimmedFirst,
        lastName: trimmedLast,
        name: savedName,
        gender,
        phone: form.phone,
        province: provinceToSave,
          bio: form.bio,
          major: form.major,
        subject: form.subject,
        ...(uploadedPictureUrl
          ? {
              avatarUrl: resolveProfilePictureUrl(uploadedPictureUrl),
              profilePicture: uploadedPictureUrl,
            }
          : {}),
      })
      navigate('/mentor/my-profile')
      // End save profile and related data
    } catch (err) {
      setSaveError(err.message || t('mentorOnboarding.saveFailed'))
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

  const saveActions = (
    <div className="flex flex-wrap gap-2 justify-end">
      <button
        type="button"
        onClick={() => navigate('/mentor/my-profile')}
        className="px-3.5 py-2 text-xs font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
      >
        {t('profile.cancel')}
      </button>
      <button
        type="button"
        onClick={handleSave}
        disabled={saving || profileLoading}
        className="px-4 py-2 text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors shadow-sm disabled:opacity-60"
      >
        {saving ? t('mentorOnboarding.saving') : t('profile.saveChanges')}
      </button>
    </div>
  )

  return (
    <PageAmbient variant="mentor">
      <div className="max-w-5xl mx-auto space-y-4 pb-6">
        <button
          type="button"
          onClick={() => navigate('/mentor/my-profile')}
          className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-teal-600 transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('mentorProfile.title')}
        </button>

        {loadError && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
            {loadError}
          </p>
        )}
        {saveError && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
            {saveError}
          </p>
        )}
        {profileLoading && (
          <p className="text-sm text-slate-500">{t('filters.loadingMentors')}</p>
        )}

        {/* Header preview card */}
        <MentorEditSectionCard>
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={handlePhotoChange}
              />
              <Avatar
                name={displayName}
                src={avatarPreview}
                size="lg"
                className="!w-14 !h-14 sm:!w-16 sm:!h-16 !rounded-full ring-2 ring-teal-100 shadow-sm"
              />
              <button
                type="button"
                onClick={openPhotoPicker}
                className="absolute -bottom-1 -right-1 w-7 h-7 bg-teal-600 rounded-full flex items-center justify-center hover:bg-teal-700 transition-colors shadow-md"
                aria-label={t('profile.uploadPhotoAria')}
              >
                <Camera className="w-3.5 h-3.5 text-white" />
              </button>
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-tight">
                {displayName || t('mentorProfile.editTitle')}
              </h1>
              {specializationPreview ? (
                <p className="flex items-center gap-1.5 mt-0.5 text-xs font-medium text-slate-500">
                  <FlaskConical className="w-3.5 h-3.5 shrink-0 text-teal-600" />
                  <span className="truncate">{specializationPreview}</span>
                </p>
              ) : null}
              {metaPreview ? (
                <p className="mt-0.5 text-xs text-slate-400 truncate">{metaPreview}</p>
              ) : null}
            </div>

            <div className="hidden sm:flex flex-col items-end gap-2 shrink-0">{saveActions}</div>
          </div>
          <div className="sm:hidden border-t border-slate-100 mt-3 pt-3">{saveActions}</div>
        </MentorEditSectionCard>

        {/* Start personal info and bio row */}
        <div className="grid lg:grid-cols-2 gap-4 items-start">
          <MentorEditSectionCard icon={User} title={t('mentorProfile.personalInfo')}>
            <div className={SECTION_STACK}>
              <NameFieldsGrid
                isKhmer={isKhmer}
                firstNameField={
                  <div>
                    <label className={labelClass}>{t('mentorProfile.firstName')}</label>
                    <input value={form.firstName} onChange={set('firstName')} className={inputClass} />
                  </div>
                }
                lastNameField={
                  <div>
                    <label className={labelClass}>{t('mentorProfile.lastName')}</label>
                    <input value={form.lastName} onChange={set('lastName')} className={inputClass} />
                  </div>
                }
              />
              <div>
                <label className={labelClass}>{t('mentorProfile.gender')}</label>
                <div className="flex flex-wrap gap-2 mt-0.5">
                  {TEACHER_GENDER_OPTIONS.map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGender(g)}
                      className={clsx(
                        'px-3.5 py-1.5 rounded-lg text-sm font-medium border transition-colors',
                        gender === g
                          ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-teal-200 hover:text-teal-700'
                      )}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>{t('profile.email')}</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      value={form.email}
                      onChange={set('email')}
                      className={inputClass + ' pl-10'}
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>{t('profile.mobile')}</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      value={form.phone}
                      onChange={set('phone')}
                      className={inputClass + ' pl-10'}
                    />
                  </div>
                </div>
              </div>
            </div>
          </MentorEditSectionCard>

          <MentorEditSectionCard
            icon={User}
            title={t('mentorProfile.detailAboutYou')}
            action={
              <span
                className={clsx(
                  'text-xs font-medium shrink-0 tabular-nums',
                  form.bio.length >= BIO_MAX_LENGTH ? 'text-red-500' : 'text-slate-400'
                )}
              >
                {form.bio.length}/{BIO_MAX_LENGTH}
              </span>
            }
          >
            <textarea
              rows={5}
              value={form.bio}
              onChange={set('bio')}
              maxLength={BIO_MAX_LENGTH}
              placeholder={t('mentorProfile.bioPlaceholder')}
              className={inputClass + ' resize-y min-h-[100px] max-h-48 leading-relaxed'}
            />
          </MentorEditSectionCard>
        </div>
        {/* End personal info and bio row */}

        {/* Start teaching focus */}
        <MentorEditSectionCard
          icon={GraduationCap}
          title={t('mentorProfile.teachingFocus')}
          overflowVisible
        >
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <CatalogSearchSelect
              size="sm"
              placement="bottom"
              label={t('filters.major')}
              labelClassName={FILTER_LABEL}
              value={selectedSkillId}
              onChange={handleSkillChange}
              options={skillSelectOptions}
              placeholder={t('filters.major')}
              menuMinWidth={240}
              menuMaxHeight={260}
              className={FILTER_SELECT}
              disabled={profileLoading || skillSelectOptions.length === 0}
            />
            <CatalogSearchSelect
              size="sm"
              placement="bottom"
              label={t('filters.subject')}
              labelClassName={FILTER_LABEL}
              value={selectedSubSkillId}
              onChange={handleSubSkillChange}
              options={subSkillSelectOptions}
              disabled={!selectedSkillId || subSkillSelectOptions.length === 0}
              placeholder={t('filters.subject')}
              menuMinWidth={240}
              menuMaxHeight={260}
              className={FILTER_SELECT}
            />
            <div className="sm:col-span-2 lg:col-span-1">
              <LocationFilterField
                label={t('filters.location')}
                labelClassName={FILTER_LABEL}
                value={form.province}
                onChange={(v) =>
                  setForm((prev) => ({
                    ...prev,
                    province: v,
                    ...(v === FILTER_ALL.location
                      ? { locationDistrict: '', locationCommune: '', locationVillage: '' }
                      : {}),
                  }))
                }
                options={locationOptions}
                detail={{
                  district: form.locationDistrict,
                  commune: form.locationCommune,
                  village: form.locationVillage,
                }}
                onDetailChange={(key, value) =>
                  setForm((prev) => ({ ...prev, [key]: value }))
                }
                menuMinWidth={240}
                menuMaxHeight={260}
                selectClassName={FILTER_SELECT}
              />
            </div>
          </div>
        </MentorEditSectionCard>
        {/* End teaching focus */}

        {/* Start education and work experience */}
        <div className="grid sm:grid-cols-2 gap-4">
          <MentorEditSectionCard>
            <ExperienceSection
              variant="profile"
              embedded
              alwaysEdit
              experience={education}
              onChange={setEducation}
            />
          </MentorEditSectionCard>

          <MentorEditSectionCard>
            <ExperienceSection
              variant="work"
              embedded
              alwaysEdit
              experience={workExperience}
              onChange={setWorkExperience}
            />
          </MentorEditSectionCard>
        </div>
        {/* End education and work experience */}

        {/* Start portfolio */}
        <MentorEditSectionCard>
          <PortfolioSection
            embedded
            alwaysEdit
            splitLinksAndDocs
            userId={user?.id}
            items={portfolios}
            onChange={setPortfolios}
          />
        </MentorEditSectionCard>
        {/* End portfolio */}

        {/* Start password and danger zone */}
        <MentorEditSectionCard
          icon={ShieldAlert}
          title={t('mentorProfile.accountSecurity')}
          hint={t('mentorProfile.accountSecurityHint')}
        >
          <div className="space-y-3">
            <ChangePasswordCard embedded compact />
            <div className="rounded-xl border border-red-200/90 bg-gradient-to-r from-red-50/80 to-rose-50/50 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100">
                    <ShieldAlert className="h-5 w-5 text-red-600" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-red-900">
                      {t('mentorProfile.dangerZone')}
                    </h3>
                    <p className="mt-0.5 text-xs leading-relaxed text-red-700/90">
                      {t('mentorProfile.deleteAccountHint')}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={openDeleteModal}
                  className="shrink-0 rounded-xl border border-red-300 bg-white px-4 py-2.5 text-sm font-semibold text-red-700 shadow-sm transition-colors hover:border-red-400 hover:bg-red-50"
                >
                  {t('mentorProfile.deleteAccount')}
                </button>
              </div>
            </div>
          </div>
        </MentorEditSectionCard>
        {/* End password and danger zone */}
      </div>
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

export default EditProfile
// ============= End edit profile page =============
