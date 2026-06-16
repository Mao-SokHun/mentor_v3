import { useState } from 'react'
import { Briefcase, GraduationCap, Plus, X, Edit2, Check, GripVertical } from 'lucide-react'
import clsx from 'clsx'
import PageCard from './PageCard'
import MentorProfileSectionHeader from './MentorProfileSectionHeader'
import { useTranslation } from '@/i18n'

const inputClass =
  'w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-100 focus:border-teal-300'

const profileInputClass =
  'w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-100 focus:border-teal-300'

const profileFieldLabelClass =
  'text-[10px] sm:text-[11px] font-semibold uppercase tracking-wide text-slate-500'

const ExperienceSection = ({
  experience,
  onChange,
  readOnly = false,
  alwaysEdit = false,
  title,
  variant = 'default',
  className,
  embedded = false,
  showHeader = true,
  prependContent = null,
}) => {
  const { t } = useTranslation()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(experience)
  const isFormMode = alwaysEdit && !readOnly && embedded
  const isEducation = variant === 'profile' || variant === 'education'
  const useProfileLayout = isEducation || variant === 'work'
  const sectionTitle =
    title ||
    (isEducation ? t('mentorDetail.academicBackground') : t('mentorProfile.experience'))
  const SectionIcon = isEducation ? GraduationCap : Briefcase
  const yearLabel = t('mentorProfile.yearLabel')
  const positionLabel = t('mentorProfile.experienceFieldPosition')
  const organizationLabel = t('mentorProfile.experienceFieldOrganization')
  const yearPlaceholder = t('mentorProfile.experienceYearPlaceholder')
  const positionPlaceholder = isEducation
    ? t('mentorProfile.backgroundRolePlaceholder')
    : t('mentorOnboarding.workPositionPlaceholder')
  const organizationPlaceholder = isEducation
    ? t('mentorProfile.backgroundOrgPlaceholder')
    : t('mentorOnboarding.workOrganizationPlaceholder')

  const startEdit = () => {
    setDraft(experience.length ? experience : [{ id: Date.now(), role: '', org: '', period: '' }])
    setEditing(true)
  }

  const confirm = () => {
    onChange(draft.filter((item) => item.role?.trim() || item.org?.trim() || item.period?.trim()))
    setEditing(false)
  }

  const cancel = () => {
    setDraft(experience)
    setEditing(false)
  }

  const updateItem = (id, field, value) => {
    const apply = (prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    if (isFormMode) {
      onChange?.(apply(experience))
      return
    }
    setDraft(apply)
  }

  const removeItem = (id) => {
    if (isFormMode) {
      onChange?.(experience.filter((item) => item.id !== id))
      return
    }
    setDraft((prev) => prev.filter((item) => item.id !== id))
  }

  const addItem = () => {
    const row = { id: Date.now(), role: '', org: '', period: '' }
    if (isFormMode) {
      onChange?.([...experience, row])
      return
    }
    setDraft((prev) => [...prev, row])
  }

  const rows = isFormMode ? experience : editing ? draft : experience
  const isEmpty = !isFormMode && !editing && experience.length === 0

  const editActions = !readOnly && !isFormMode ? (
    <div className="flex items-center gap-2 shrink-0">
      {!editing ? (
        <button
          type="button"
          onClick={startEdit}
          className="flex items-center gap-1 px-3 py-1 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <Edit2 className="w-3 h-3" /> {t('mentorProfile.editExperience')}
        </button>
      ) : (
        <>
          <button
            type="button"
            onClick={confirm}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 transition-colors"
          >
            <Check className="w-3.5 h-3.5" /> {t('mentorProfile.confirmExperience')}
          </button>
          <button
            type="button"
            onClick={cancel}
            aria-label={t('profile.cancel')}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </>
      )}
    </div>
  ) : null

  const renderProfileReadRow = (item) => (
    <div
      key={item.id}
      className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100"
    >
      <div className="w-16 shrink-0">
        <p className={profileFieldLabelClass}>{yearLabel}</p>
        <p className="text-xs font-semibold text-slate-800 mt-0.5 leading-snug">{item.period || '—'}</p>
      </div>
      <div className="flex-1 min-w-0 space-y-1">
        <div>
          <p className={profileFieldLabelClass}>{organizationLabel}</p>
          <p className="text-xs font-semibold text-slate-800 mt-0.5 leading-snug">{item.org || '—'}</p>
        </div>
        <div>
          <p className={profileFieldLabelClass}>{positionLabel}</p>
          <p className="text-xs font-semibold text-slate-900 leading-snug">{item.role || '—'}</p>
        </div>
      </div>
      <GripVertical className="w-4 h-4 text-slate-300 shrink-0" aria-hidden />
    </div>
  )

  const renderProfileEditRow = (item) => (
    <div
      key={item.id}
      className="relative flex flex-col sm:flex-row gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100"
    >
      <div className="w-full sm:w-24 shrink-0">
        <p className={clsx(profileFieldLabelClass, 'mb-1')}>{yearLabel}</p>
        <input
          value={item.period}
          onChange={(e) => updateItem(item.id, 'period', e.target.value)}
          placeholder={yearPlaceholder}
          className={profileInputClass}
        />
      </div>
      <div className="flex-1 space-y-1.5 min-w-0">
        <div>
          <p className={clsx(profileFieldLabelClass, 'mb-1')}>{organizationLabel}</p>
          <input
            value={item.org}
            onChange={(e) => updateItem(item.id, 'org', e.target.value)}
            placeholder={organizationPlaceholder}
            className={profileInputClass}
          />
        </div>
        <div>
          <p className={clsx(profileFieldLabelClass, 'mb-1')}>{positionLabel}</p>
          <input
            value={item.role}
            onChange={(e) => updateItem(item.id, 'role', e.target.value)}
            placeholder={positionPlaceholder}
            className={profileInputClass}
          />
        </div>
      </div>
      <button
        type="button"
        onClick={() => removeItem(item.id)}
        className="absolute top-3 right-3 p-1.5 text-red-400 hover:text-red-600 sm:static sm:self-start"
        aria-label={t('mentorProfile.removeExperience')}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )

  const renderDefaultRow = (item) => (
    <div key={item.id} className="relative pl-4 border-l-2 border-primary-200">
      {editing ? (
        <div className="space-y-2 pr-8">
          <input
            value={item.role}
            onChange={(e) => updateItem(item.id, 'role', e.target.value)}
            placeholder={t('mentorOnboarding.workPositionPlaceholder')}
            className={inputClass}
          />
          <input
            value={item.org}
            onChange={(e) => updateItem(item.id, 'org', e.target.value)}
            placeholder={t('mentorOnboarding.workOrganizationPlaceholder')}
            className={inputClass}
          />
          <input
            value={item.period}
            onChange={(e) => updateItem(item.id, 'period', e.target.value)}
            placeholder={t('mentorProfile.experiencePeriodPlaceholder')}
            className={inputClass}
          />
          <button
            type="button"
            onClick={() => removeItem(item.id)}
            className="absolute top-0 right-0 p-1.5 text-red-400 hover:text-red-600"
            aria-label={t('mentorProfile.removeExperience')}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <>
          <p className="text-sm font-semibold text-slate-800">{item.role}</p>
          <p className="text-xs text-slate-500 mt-0.5">{item.org}</p>
          {item.period ? (
            <p className="text-xs text-primary-500 font-medium mt-1">{item.period}</p>
          ) : null}
        </>
      )}
    </div>
  )

  const profileBody = (
    <>
      {isEmpty && (
        <p className="text-xs text-slate-500 text-center py-4 px-3 rounded-lg border border-dashed border-slate-200 bg-slate-50/50">
          {t(isEducation ? 'mentorProfile.backgroundAddLaterHint' : 'mentorProfile.experienceAddLaterHint')}
        </p>
      )}
      <div className="space-y-2">
        {rows.map((item) =>
          isFormMode || editing ? renderProfileEditRow(item) : renderProfileReadRow(item)
        )}
      </div>
      {(isFormMode || editing) && (
        <button
          type="button"
          onClick={addItem}
          className="mt-2 w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-dashed border-slate-200 text-xs font-semibold text-teal-600 hover:border-teal-200 hover:bg-teal-50/50 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />{' '}
          {t(isEducation ? 'mentorProfile.addBackground' : 'mentorProfile.addExperience')}
        </button>
      )}
    </>
  )

  if (useProfileLayout) {
    if (embedded) {
      return (
        <div className={className}>
          {showHeader ? (
            <MentorProfileSectionHeader icon={SectionIcon} title={sectionTitle} action={editActions} />
          ) : null}
          {prependContent}
          {profileBody}
        </div>
      )
    }

    return (
      <PageCard className={clsx('border border-slate-200/80 shadow-sm', className)}>
        <MentorProfileSectionHeader icon={SectionIcon} title={sectionTitle} action={editActions} />
        {prependContent}
        {profileBody}
      </PageCard>
    )
  }

  return (
    <PageCard padding={false} className={clsx('overflow-hidden', className)}>
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">{sectionTitle}</h3>
        {editActions}
      </div>
      <div className="p-5 space-y-4">
        {isEmpty && (
          <p className="text-sm text-slate-500 leading-relaxed">
            {t(isEducation ? 'mentorProfile.backgroundAddLaterHint' : 'mentorProfile.experienceAddLaterHint')}
          </p>
        )}
        {rows.map(renderDefaultRow)}
        {editing && (
          <button
            type="button"
            onClick={addItem}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl border-2 border-dashed border-primary-200 text-xs font-semibold text-primary-500 hover:bg-primary-50 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />{' '}
            {t(isEducation ? 'mentorProfile.addBackground' : 'mentorProfile.addExperience')}
          </button>
        )}
      </div>
    </PageCard>
  )
}

export default ExperienceSection
