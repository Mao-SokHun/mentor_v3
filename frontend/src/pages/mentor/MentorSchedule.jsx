import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarClock, Plus, Pencil, Eye, Clock, MapPin, Trash2 } from 'lucide-react'
import clsx from 'clsx'
import {
  PageScaffold,
  PageCard,
  PageAmbient,
  ScheduleSection,
} from '@/components'
import { useTranslation } from '@/i18n'
import { useAuth } from '@/hooks'
import {
  getTeacherWeeklySchedule,
  saveTeacherWeeklySchedule,
} from '@/services/mentors/mentorScheduleService'
import { deleteMentorPost, fetchMyMentorPosts } from '@/services/mentors/mentorService'
import { parsePostScheduleMeta } from '@/utils/mentorPostMapper'
import { compareTimeSortKeys } from '@/utils/timeRangeUtils'
import { provinceRowLabel } from '@/utils/provinceOptions'
import { isApiEnabled } from '@/constants'

const sortPostRows = (rows = []) =>
  [...rows].sort((a, b) => {
    const dateCmp = String(a.session_date ?? a.date ?? '').localeCompare(
      String(b.session_date ?? b.date ?? '')
    )
    if (dateCmp !== 0) return dateCmp
    return compareTimeSortKeys(a.timeSortKey, b.timeSortKey)
  })

function PublishedSessionCard({ row, deletingId, onDelete, t }) {
  const scheduleLine = [row.session_date ?? row.date, row.time_slot ?? row.time]
    .filter(Boolean)
    .join(' · ')

  const btnClass =
    'inline-flex items-center justify-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors'

  return (
    <li className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-base font-bold text-slate-900">{row.subject ?? row.title ?? '—'}</p>
          {scheduleLine ? (
            <p className="mt-1.5 flex items-center gap-1.5 text-sm text-slate-600">
              <Clock className="h-4 w-4 shrink-0 text-teal-600" aria-hidden />
              {scheduleLine}
            </p>
          ) : null}
          {row.province ? (
            <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden />
              {row.province}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-1.5 sm:shrink-0">
          <Link
            to={`/schedule/post/${row.id}`}
            className={clsx(btnClass, 'border border-slate-200 text-slate-700 hover:bg-slate-50')}
          >
            <Eye className="h-3.5 w-3.5" />
            {t('mentorSchedule.previewPost')}
          </Link>
          <Link
            to={`/mentor/edit-post/${row.id}`}
            className={clsx(btnClass, 'border border-primary-200 text-primary-700 hover:bg-primary-50')}
          >
            <Pencil className="h-3.5 w-3.5" />
            {t('mentorSchedule.editPost')}
          </Link>
          <button
            type="button"
            onClick={() => onDelete(row.id)}
            disabled={deletingId === row.id}
            className={clsx(
              btnClass,
              'border border-red-100 text-red-600 hover:bg-red-50 disabled:opacity-50'
            )}
          >
            <Trash2 className="h-3.5 w-3.5" />
            {deletingId === row.id ? t('mentorSchedule.deletingPost') : t('mentorSchedule.deletePost')}
          </button>
        </div>
      </div>
    </li>
  )
}

const MentorSchedule = () => {
  const { t, lang } = useTranslation()
  const { user, updateUser } = useAuth()
  const [schedule, setSchedule] = useState(() => getTeacherWeeklySchedule(user))
  const [published, setPublished] = useState([])
  const [drafts, setDrafts] = useState([])
  const [loadingSessions, setLoadingSessions] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [savedOk, setSavedOk] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    setSchedule(getTeacherWeeklySchedule(user))
  }, [user?.schedule])

  const mapPostRows = (rows = []) =>
    rows.map((post) => {
      const meta = parsePostScheduleMeta(post.description)
      const provinceRow = post.Province ?? post.province ?? null
      return {
        id: post.post_id ?? post.id,
        subject: post.title,
        session_date: meta.date,
        time_slot: meta.time,
        date: meta.date,
        time: meta.time,
        timeSortKey: meta.sortKey,
        status: post.status,
        province: provinceRow?.province_name ? provinceRowLabel(provinceRow, lang) : '',
      }
    })

  const mapAndSortPostRows = (rows = []) => sortPostRows(mapPostRows(rows))

  const loadPosts = useCallback(() => {
    if (!user?.id || !isApiEnabled()) {
      setLoadingSessions(false)
      return
    }
    setLoadingSessions(true)
    Promise.all([
      fetchMyMentorPosts({ status: 'published' }),
      fetchMyMentorPosts({ status: 'draft' }),
    ])
      .then(([publishedRows, draftRows]) => {
        setPublished(mapAndSortPostRows(publishedRows))
        setDrafts(mapAndSortPostRows(draftRows))
      })
      .catch(() => {
        setPublished([])
        setDrafts([])
      })
      .finally(() => setLoadingSessions(false))
  }, [user?.id, labelFor])

  useEffect(() => {
    loadPosts()
  }, [loadPosts])

  const handleDeletePost = async (postId) => {
    if (!postId || !window.confirm(t('mentorSchedule.deletePost') + '?')) return
    setDeletingId(postId)
    try {
      await deleteMentorPost(postId)
      loadPosts()
    } catch (err) {
      setSaveError(err?.message || t('mentorSchedule.publishFailed'))
    } finally {
      setDeletingId(null)
    }
  }

  const handleSaveWeekly = async () => {
    setSaveError('')
    setSavedOk(false)
    setSaving(true)
    try {
      await saveTeacherWeeklySchedule(schedule)
      updateUser({ schedule })
      setSavedOk(true)
    } catch (err) {
      setSaveError(err?.message || t('profile.saveFailed'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <PageAmbient variant="mentor" className="space-y-6">
      <PageScaffold
        title={t('mentorSchedule.title')}
        subtitle={t('mentorSchedule.subtitle')}
        action={
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleSaveWeekly}
              disabled={saving}
              className="px-4 py-2 text-sm font-semibold bg-primary-500 text-white rounded-xl hover:bg-primary-600 disabled:opacity-60"
            >
              {saving ? t('profile.saving') : t('mentorSchedule.saveWeekly')}
            </button>
            <Link
              to="/mentor/create-post"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border border-primary-200 text-primary-600 rounded-xl hover:bg-primary-50"
            >
              <Plus className="w-4 h-4" />
              {t('mentorSchedule.postSession')}
            </Link>
          </div>
        }
      >
        {saveError && <p className="text-sm text-red-600 mb-4">{saveError}</p>}
        {savedOk && (
          <p className="text-sm text-emerald-600 mb-4">{t('mentorSchedule.savedWeekly')}</p>
        )}

        <ScheduleSection
          title={t('mentorProfile.schedule')}
          schedule={schedule}
          onChange={setSchedule}
        />

        <PageCard className="mt-6">
          <div className="mb-4">
            <div className="flex items-center gap-2">
              <CalendarClock className="w-5 h-5 text-primary-500" />
              <h3 className="font-bold text-slate-800 text-base">{t('mentorSchedule.publishedTitle')}</h3>
            </div>
            <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">{t('mentorSchedule.publishedHint')}</p>
          </div>
          {loadingSessions ? (
            <p className="text-sm text-slate-500 py-6 text-center">{t('student.loadingMentors')}</p>
          ) : published.length === 0 ? (
            <div className="py-8 text-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 space-y-3">
              <p className="text-sm text-slate-500">{t('mentorSchedule.noPublished')}</p>
              <Link
                to="/mentor/create-post"
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary-500 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-600"
              >
                <Plus className="w-4 h-4" />
                {t('mentorSchedule.postSession')}
              </Link>
            </div>
          ) : (
            <ul className="space-y-3">
              {published.map((row, idx) => (
                <PublishedSessionCard
                  key={row.id ?? idx}
                  row={row}
                  deletingId={deletingId}
                  onDelete={handleDeletePost}
                  t={t}
                />
              ))}
            </ul>
          )}

          {drafts.length > 0 && (
            <div className="mt-6 pt-5 border-t border-slate-100">
              <h4 className="text-sm font-semibold text-slate-700 mb-3">{t('mentorSchedule.draftTitle')}</h4>
              <ul className="space-y-3">
                {drafts.map((row, idx) => (
                  <PublishedSessionCard
                    key={row.id ?? idx}
                    row={row}
                    deletingId={deletingId}
                    onDelete={handleDeletePost}
                    t={t}
                  />
                ))}
              </ul>
            </div>
          )}
        </PageCard>

        <p className="text-sm text-slate-500 mt-1 px-1">{t('mentorSchedule.browseNote')}</p>
      </PageScaffold>
    </PageAmbient>
  )
}

export default MentorSchedule
