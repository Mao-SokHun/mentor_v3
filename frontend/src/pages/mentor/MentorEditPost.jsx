import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, CheckCircle } from 'lucide-react'
import { PageScaffold, PageCard, PageAmbient } from '@/components'
import { useTranslation } from '@/i18n'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import TimeRangeInput from '@/components/ui/TimeRangeInput'
import SearchableSelect from '@/components/ui/SearchableSelect'
import { CatalogSearchSelect } from '@/components'
import { isApiEnabled } from '@/constants'
import {
  fetchAllSkills,
  fetchMentorPostById,
  fetchProvinces,
  flattenSubSkillOptions,
  updateMentorPost,
} from '@/services/mentors/mentorService'
import { provinceRowLabel } from '@/utils/provinceOptions'
import { postToScheduleFormValues } from '@/utils/mentorPostMapper'
import {
  buildPostScheduleDescription,
  isValidTimeRange,
  normalizeTimeValue,
} from '@/utils/timeRangeUtils'

const MentorEditPost = () => {
  const { postId } = useParams()
  const { t, lang, labelFor } = useTranslation()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [subject, setSubject] = useState('')
  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('08:00')
  const [endTime, setEndTime] = useState('10:00')
  const [notes, setNotes] = useState('')
  const [provinceId, setProvinceId] = useState('')
  const [subSkillId, setSubSkillId] = useState('')
  const [provinceOptions, setProvinceOptions] = useState([])
  const [subSkillOptions, setSubSkillOptions] = useState([])

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

  useEffect(() => {
    if (!postId || !isApiEnabled()) {
      setLoading(false)
      setLoadError(t('student.schedulePost.notFound'))
      return
    }

    let cancelled = false
    setLoading(true)
    setLoadError('')

    Promise.all([fetchMentorPostById(postId), fetchProvinces(), fetchAllSkills()])
      .then(([post, provinces, skills]) => {
        if (cancelled) return
        if (!post) {
          setLoadError(t('student.schedulePost.notFound'))
          return
        }

        const form = postToScheduleFormValues(post)
        if (!form) {
          setLoadError(t('student.schedulePost.notFound'))
          return
        }

        setSubject(form.subject)
        setDate(form.date)
        setStartTime(form.startTime)
        setEndTime(form.endTime)
        setNotes(form.notes)
        setProvinceId(form.provinceId)
        setSubSkillId(form.subSkillId)
        setProvinceOptions(provinces ?? [])
        setSubSkillOptions(flattenSubSkillOptions(skills ?? []))
      })
      .catch(() => {
        if (!cancelled) setLoadError(t('student.schedulePost.notFound'))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [postId, t])

  const handleSave = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
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

      await updateMentorPost(postId, {
        title: subject.trim(),
        description: description || undefined,
        province_id: pid,
        sub_skill_id: sid,
      })

      setSaved(true)
    } catch (err) {
      setError(err?.message || t('mentorSchedule.publishFailed'))
    } finally {
      setSaving(false)
    }
  }

  if (!postId) return <Navigate to="/mentor/home" replace />

  if (loading) {
    return (
      <PageAmbient variant="mentor">
        <p className="text-sm text-slate-500 py-12 text-center">{t('student.loadingMentors')}</p>
      </PageAmbient>
    )
  }

  if (loadError) {
    return (
      <PageAmbient variant="mentor">
        <div className="max-w-lg mx-auto py-16 text-center space-y-3">
          <p className="text-sm text-slate-600">{loadError}</p>
          <Link
            to="/mentor/home"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-600 hover:text-teal-700"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('mentorSchedule.viewMySchedule')}
          </Link>
        </div>
      </PageAmbient>
    )
  }

  return (
    <PageAmbient variant="mentor" className="space-y-6">
      <PageScaffold title={t('mentorSchedule.editPostTitle')} subtitle={t('mentorSchedule.editPostSubtitle')}>
        <Link
          to="/mentor/schedule"
          className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-primary-700 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('mentorSchedule.viewMySchedule')}
        </Link>

        {saved ? (
          <PageCard className="max-w-xl text-center py-10">
            <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
            <h3 className="font-bold text-slate-800 mb-2">{t('mentorSchedule.editSaved')}</h3>
            <p className="text-sm text-slate-500 mb-6">{t('mentorSchedule.editSavedHint')}</p>
            <div className="flex flex-wrap gap-2 justify-center">
              <Button type="button" variant="primary" onClick={() => navigate('/mentor/home')}>
                {t('mentorSchedule.viewMySchedule')}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/schedule/post/${postId}`)}
              >
                {t('mentorSchedule.previewPost')}
              </Button>
            </div>
          </PageCard>
        ) : (
          <PageCard className="max-w-xl">
            <form onSubmit={handleSave} className="space-y-4">
              <Input
                label={t('mentorCreate.subject')}
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder={t('mentorCreate.subjectPlaceholder')}
                required
              />
              <SearchableSelect
                label={t('filters.location')}
                size="sm"
                placement="bottom"
                value={provinceId}
                onChange={setProvinceId}
                options={provinceSelectOptions}
                placeholder={t('filters.location')}
                menuMinWidth={240}
                disabled={provinceSelectOptions.length === 0}
              />
              <CatalogSearchSelect
                label={t('filters.subject')}
                size="sm"
                placement="bottom"
                value={subSkillId}
                onChange={setSubSkillId}
                options={subSkillOptions.map((o) => ({
                  value: String(o.value),
                  label: o.label,
                }))}
                placeholder={t('filters.subject')}
                menuMinWidth={280}
                disabled={subSkillOptions.length === 0}
              />
              <Input
                label={t('mentorCreate.date')}
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
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
              <div className="flex flex-wrap gap-2">
                <Button type="submit" variant="primary" size="md" disabled={saving}>
                  {saving ? t('profile.saving') : t('mentorSchedule.saveChanges')}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => navigate(`/schedule/post/${postId}`)}
                >
                  {t('mentorSchedule.previewPost')}
                </Button>
              </div>
            </form>
          </PageCard>
        )}
      </PageScaffold>
    </PageAmbient>
  )
}

export default MentorEditPost
