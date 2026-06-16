import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarClock, Users, ArrowLeft, ChevronRight, CheckCircle, MapPin, Clock, GraduationCap } from 'lucide-react'
import { PageScaffold, PageCard, PageAmbient } from '@/components'
import { useTranslation } from '@/i18n'
import { useAuth } from '@/hooks'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import TimeRangeInput from '../../components/ui/TimeRangeInput'
import SearchableSelect from '../../components/ui/SearchableSelect'
import { CatalogSearchSelect } from '@/components'
import clsx from 'clsx'
import { isApiEnabled } from '@/constants'
import { publishTeacherSessionSlot } from '@/services/mentors/mentorScheduleService'
import {
  buildPostScheduleDescription,
  isValidTimeRange,
  normalizeTimeValue,
  formatTimeRange,
} from '@/utils/timeRangeUtils'
import {
  createMentorPost,
  fetchMentorCatalog,
  fetchMentorSkills,
  buildSkillOptions,
  buildSubSkillOptions,
  resolveProvinceId,
  resolveSkillSubSkillFromMentorSkills,
} from '@/services/mentors/mentorService'
import { provinceRowLabel } from '@/utils/provinceOptions'
import { resolveMentorProfile } from '@/lib/mentorProfile'
import MentorPostedSessionsPanel from '@/components/mentor/MentorPostedSessionsPanel'

function optionLabel(options, value) {
  if (!value) return ''
  return options.find((o) => String(o.value) === String(value))?.label ?? ''
}

const HUB_CARD_TONES = {
  primary: {
    icon: 'bg-primary-50 text-primary-600 ring-primary-100/80 group-hover:bg-primary-500 group-hover:text-white group-hover:ring-primary-400/30',
    border: 'hover:border-primary-200/90',
    chevron: 'group-hover:text-primary-600',
  },
  emerald: {
    icon: 'bg-emerald-50 text-emerald-600 ring-emerald-100/80 group-hover:bg-emerald-500 group-hover:text-white group-hover:ring-emerald-400/30',
    border: 'hover:border-emerald-200/90',
    chevron: 'group-hover:text-emerald-600',
  },
}

function CreateHubCard({ icon: Icon, tone = 'primary', title, description, onClick, href }) {
  const styles = HUB_CARD_TONES[tone] ?? HUB_CARD_TONES.primary
  const className = clsx(
    'group flex w-full items-center gap-4 sm:gap-5 rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5',
    'shadow-sm transition-all duration-200 text-left min-h-[112px]',
    styles.border,
    'hover:shadow-md hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300/60'
  )

  const content = (
    <>
      <div
        className={clsx(
          'flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-xl ring-1 transition-colors duration-200',
          styles.icon
        )}
      >
        <Icon className="h-6 w-6 sm:h-7 sm:w-7" aria-hidden />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">{title}</h3>
        <p className="mt-1 text-sm text-slate-500 leading-relaxed line-clamp-2">{description}</p>
      </div>
      <ChevronRight
        className={clsx(
          'h-5 w-5 shrink-0 text-slate-300 transition-all duration-200 group-hover:translate-x-0.5',
          styles.chevron
        )}
        aria-hidden
      />
    </>
  )

  if (href) {
    return (
      <Link to={href} className={className}>
        {content}
      </Link>
    )
  }

  return (
    <button type="button" onClick={onClick} className={className}>
      {content}
    </button>
  )
}

function SchedulePostPreview({ subject, date, startTime, endTime, provinceLabel, skillLabel, notes, t }) {
  const timeLine = formatTimeRange(startTime, endTime)
  const hasContent = subject.trim() || date || timeLine || provinceLabel || skillLabel

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-gradient-to-br from-slate-50 via-white to-teal-50/30 p-5 sm:p-6 shadow-sm lg:sticky lg:top-6">
      <div className="mb-4">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500 sm:text-[13px]">
          {t('mentorCreate.previewTitle')}
        </p>
        <p className="mt-1 text-sm text-slate-500 leading-relaxed">{t('mentorCreate.previewHint')}</p>
      </div>

      <div className="rounded-xl border border-slate-200/80 bg-white overflow-hidden shadow-sm">
        <div className="px-4 py-3.5 bg-gradient-to-r from-teal-50/90 to-white border-b border-slate-100">
          <div className="min-w-0">
            <h3 className="text-lg font-bold text-slate-900 truncate">
              {subject.trim() || t('mentorCreate.previewEmptySubject')}
            </h3>
            {skillLabel ? (
              <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-600">
                <GraduationCap className="h-4 w-4 shrink-0 text-teal-600" aria-hidden />
                <span className="truncate">{skillLabel}</span>
              </p>
            ) : null}
          </div>
        </div>

        <div className="p-4 space-y-2.5">
          {date ? (
            <p className="flex items-center gap-2 text-sm text-slate-700">
              <Clock className="h-4 w-4 shrink-0 text-teal-600" aria-hidden />
              <span className="font-semibold">{date}</span>
              {timeLine ? <span className="text-slate-500">· {timeLine}</span> : null}
            </p>
          ) : timeLine ? (
            <p className="flex items-center gap-2 text-sm text-slate-700">
              <Clock className="h-4 w-4 shrink-0 text-teal-600" aria-hidden />
              {timeLine}
            </p>
          ) : null}
          {provinceLabel ? (
            <p className="flex items-center gap-2 text-sm text-slate-600">
              <MapPin className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
              {provinceLabel}
            </p>
          ) : null}
          {notes.trim() ? (
            <p className="text-sm text-slate-500 leading-relaxed line-clamp-3 pt-1 border-t border-slate-100">
              {notes.trim()}
            </p>
          ) : null}
          {!hasContent ? (
            <p className="text-sm text-slate-400 italic py-4 text-center">{t('mentorCreate.previewEmpty')}</p>
          ) : null}
        </div>
      </div>
    </div>
  )
}

/** Teacher hub — mentor post (API) or legacy session slot when API is off */
const MentorCreatePost = () => {
  const { t, lang, labelFor } = useTranslation()
  const { user } = useAuth()
  const [view, setView] = useState('hub')
  const [subject, setSubject] = useState('')
  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('08:00')
  const [endTime, setEndTime] = useState('10:00')
  const [notes, setNotes] = useState('')
  const [provinceId, setProvinceId] = useState('')
  const [selectedSkillId, setSelectedSkillId] = useState('')
  const [subSkillId, setSubSkillId] = useState('')
  const [skillsCatalog, setSkillsCatalog] = useState([])
  const [provinceOptions, setProvinceOptions] = useState([])
  const [metaLoading, setMetaLoading] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [error, setError] = useState('')
  const [published, setPublished] = useState(false)
  const [postsRefreshKey, setPostsRefreshKey] = useState(0)

  const timeRangeError =
    startTime && endTime && !isValidTimeRange(startTime, endTime)
      ? t('mentorCreate.timeRangeInvalid')
      : ''

  const provinceSelectOptions = useMemo(
    () =>
      provinceOptions.map((p) => ({
        value: String(p.province_id ?? p.id),
        label: provinceRowLabel(p, lang),
      })),
    [provinceOptions, lang]
  )

  const majorSelectOptions = useMemo(
    () =>
      buildSkillOptions(skillsCatalog, lang).map((o) => ({
        value: String(o.value),
        label: o.label,
      })),
    [skillsCatalog, lang]
  )

  const subjectSelectOptions = useMemo(
    () =>
      buildSubSkillOptions(skillsCatalog, selectedSkillId, lang).map((o) => ({
        value: String(o.value),
        label: o.label,
      })),
    [skillsCatalog, selectedSkillId, lang]
  )

  const previewProvince = optionLabel(provinceSelectOptions, provinceId)
  const previewMajor = optionLabel(majorSelectOptions, selectedSkillId)
  const previewSubject = optionLabel(subjectSelectOptions, subSkillId)
  const previewSkill = [previewMajor, previewSubject].filter(Boolean).join(' · ')

  useEffect(() => {
    if (view !== 'schedule' || !isApiEnabled()) return

    let cancelled = false
    setMetaLoading(true)

    Promise.all([
      fetchMentorCatalog(),
      user?.id ? fetchMentorSkills(user.id).catch(() => []) : Promise.resolve([]),
    ])
      .then(([{ skills, provinces }, mentorSkills]) => {
        if (cancelled) return
        const catalog = skills ?? []
        setProvinceOptions(provinces ?? [])
        setSkillsCatalog(catalog)
        const profile = resolveMentorProfile(user)
        const defaultProvinceId = resolveProvinceId(profile.province, provinces)
        if (defaultProvinceId != null) setProvinceId(String(defaultProvinceId))

        const resolved = resolveSkillSubSkillFromMentorSkills(mentorSkills, catalog)
        if (resolved.skillId) setSelectedSkillId(resolved.skillId)
        if (resolved.subSkillId) setSubSkillId(resolved.subSkillId)
      })
      .catch(() => {
        if (!cancelled) {
          setProvinceOptions([])
          setSkillsCatalog([])
        }
      })
      .finally(() => {
        if (!cancelled) setMetaLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [view, user])

  const handlePublishSchedule = async (e) => {
    e.preventDefault()
    setError('')
    setPublishing(true)
    try {
      if (isApiEnabled()) {
        const pid = parseInt(provinceId, 10)
        const sid = parseInt(subSkillId, 10)
        if (!subject.trim()) throw new Error(t('mentorCreate.subject'))
        if (Number.isNaN(pid)) throw new Error(t('filters.location'))
        if (Number.isNaN(sid)) throw new Error(t('filters.subject'))
        if (!startTime.trim()) throw new Error(t('mentorCreate.timeStartRequired'))
        if (!endTime.trim()) throw new Error(t('mentorCreate.timeEndRequired'))
        if (!isValidTimeRange(startTime, endTime)) {
          throw new Error(t('mentorCreate.timeRangeInvalid'))
        }

        const description = buildPostScheduleDescription({
          date,
          startTime,
          endTime,
          notes,
        })

        await createMentorPost(user?.id, {
          title: subject.trim(),
          description: description || undefined,
          province_id: pid,
          sub_skill_id: sid,
          status: 'published',
        })
      } else {
        await publishTeacherSessionSlot({
          userId: user?.id,
          subject,
          date,
          time: formatTimeRange(startTime, endTime),
          notes,
        })
      }
      setPublished(true)
      setPostsRefreshKey((k) => k + 1)
    } catch (err) {
      setError(err?.message || t('mentorSchedule.publishFailed'))
    } finally {
      setPublishing(false)
    }
  }

  const handleSuccessClose = () => {
    setPublished(false)
    setSubject('')
    setDate('')
    setStartTime('08:00')
    setEndTime('10:00')
    setNotes('')
    setSubSkillId('')
  }

  if (view === 'schedule') {
    return (
      <PageAmbient variant="mentor" className="space-y-6">
        <PageScaffold
          title={t('mentorCreate.scheduleTitle')}
          subtitle={t('mentorCreate.scheduleSubtitle')}
        >
          <button
            type="button"
            onClick={() => {
              setView('hub')
              setPublished(false)
              setError('')
            }}
            className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-primary-700 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('mentorCreate.backToHub')}
          </button>

          <div className="max-w-5xl space-y-6">
            <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 items-start">
              <PageCard className="h-full">
                <form onSubmit={handlePublishSchedule} className="space-y-4">
                  <Input
                    label={t('mentorCreate.subject')}
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder={t('mentorCreate.subjectPlaceholder')}
                    required
                  />
                  {isApiEnabled() && (
                    <div className="grid sm:grid-cols-2 gap-4">
                      <SearchableSelect
                        label={t('filters.location')}
                        size="sm"
                        placement="bottom"
                        showAllOnOpen
                        value={provinceId}
                        onChange={setProvinceId}
                        options={provinceSelectOptions}
                        placeholder={t('filters.location')}
                        menuMinWidth={240}
                        disabled={metaLoading || provinceSelectOptions.length === 0}
                      />
                      <CatalogSearchSelect
                        label={t('filters.major')}
                        size="sm"
                        placement="bottom"
                        value={selectedSkillId}
                        onChange={(value) => {
                          setSelectedSkillId(value)
                          setSubSkillId('')
                        }}
                        options={majorSelectOptions}
                        placeholder={t('filters.major')}
                        menuMinWidth={240}
                        disabled={metaLoading || majorSelectOptions.length === 0}
                      />
                      <CatalogSearchSelect
                        label={t('filters.subject')}
                        size="sm"
                        placement="bottom"
                        value={subSkillId}
                        onChange={setSubSkillId}
                        options={subjectSelectOptions}
                        placeholder={t('filters.subject')}
                        menuMinWidth={280}
                        disabled={
                          metaLoading ||
                          !selectedSkillId ||
                          subjectSelectOptions.length === 0
                        }
                      />
                    </div>
                  )}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Input
                      label={t('mentorCreate.date')}
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      required
                    />
                    <div className="sm:col-span-2">
                      <TimeRangeInput
                        label={t('mentorCreate.timeSlot')}
                        startTime={startTime}
                        endTime={endTime}
                        onChange={({ startTime: s, endTime: e }) => {
                          setStartTime(normalizeTimeValue(s))
                          setEndTime(normalizeTimeValue(e))
                        }}
                        error={timeRangeError}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      {t('mentorCreate.notes')}
                    </label>
                    <textarea
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder={t('mentorCreate.notesPlaceholder')}
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-300"
                    />
                  </div>
                  {error && <p className="text-sm text-red-600">{error}</p>}
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    className="w-full sm:w-auto"
                    disabled={publishing || metaLoading}
                  >
                    {publishing ? t('profile.saving') : t('mentorCreate.publishSchedule')}
                  </Button>
                </form>
              </PageCard>

              <SchedulePostPreview
                subject={subject}
                date={date}
                startTime={startTime}
                endTime={endTime}
                provinceLabel={previewProvince}
                skillLabel={previewSkill}
                notes={notes}
                t={t}
              />
              </div>

            {isApiEnabled() ? (
              <MentorPostedSessionsPanel refreshKey={postsRefreshKey} />
            ) : null}
          </div>

          <Modal
            open={published}
            onClose={handleSuccessClose}
            size="sm"
            title={t('mentorSchedule.publishSuccess')}
            footer={
              <Button type="button" variant="primary" onClick={handleSuccessClose}>
                {t('mentorSchedule.publishSuccessOk')}
              </Button>
            }
          >
            <div className="flex flex-col items-center text-center gap-3 py-1">
              <CheckCircle className="w-11 h-11 text-emerald-500" aria-hidden />
              <p className="text-sm text-slate-600 leading-relaxed">{t('mentorSchedule.publishSuccessHint')}</p>
            </div>
          </Modal>
        </PageScaffold>
      </PageAmbient>
    )
  }

  return (
    <PageAmbient variant="mentor" className="space-y-6">
      <PageScaffold title={t('mentorCreate.title')} subtitle={t('mentorCreate.subtitle')}>
        <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
          <CreateHubCard
            icon={CalendarClock}
            tone="primary"
            title={t('mentorCreate.scheduleCardTitle')}
            description={t('mentorCreate.scheduleCardDesc')}
            onClick={() => setView('schedule')}
          />
          <CreateHubCard
            icon={Users}
            tone="emerald"
            title={t('mentorCreate.communityCardTitle')}
            description={t('mentorCreate.communityCardDesc')}
            href="/community/create"
          />
        </div>
      </PageScaffold>
    </PageAmbient>
  )
}

export default MentorCreatePost
