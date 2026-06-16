import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarClock, Clock, Eye, MapPin, Pencil, Trash2 } from 'lucide-react'
import clsx from 'clsx'
import { PageCard } from '@/components'
import { useTranslation } from '@/i18n'
import { useAuth } from '@/hooks'
import { isApiEnabled } from '@/constants'
import { deleteMentorPost, fetchMyMentorPosts } from '@/services/mentors/mentorService'
import { parsePostScheduleMeta } from '@/utils/mentorPostMapper'
import { compareTimeSortKeys } from '@/utils/timeRangeUtils'
import { provinceRowLabel } from '@/utils/provinceOptions'

function sortPostRows(rows = []) {
  return [...rows].sort((a, b) => {
    const dateCmp = String(a.session_date ?? a.date ?? '').localeCompare(
      String(b.session_date ?? b.date ?? '')
    )
    if (dateCmp !== 0) return dateCmp
    return compareTimeSortKeys(a.timeSortKey, b.timeSortKey)
  })
}

function mapPostRows(rows = [], lang) {
  return rows.map((post) => {
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
}

function SessionRow({ row, deletingId, onDelete, t }) {
  const scheduleLine = [row.session_date ?? row.date, row.time_slot ?? row.time]
    .filter(Boolean)
    .join(' · ')

  const btnClass =
    'inline-flex items-center justify-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors'

  return (
    <li className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-base font-bold text-slate-900">{row.subject ?? '—'}</p>
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

/** Mentor's published schedule posts — preview, edit, delete */
export default function MentorPostedSessionsPanel({
  className,
  includeDrafts = false,
  onPostsChange,
  refreshKey = 0,
}) {
  const { t, lang } = useTranslation()
  const { user } = useAuth()
  const [published, setPublished] = useState([])
  const [drafts, setDrafts] = useState([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState(null)
  const [error, setError] = useState('')

  const loadPosts = useCallback(() => {
    if (!user?.id || !isApiEnabled()) {
      setPublished([])
      setDrafts([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError('')

    const requests = [fetchMyMentorPosts({ status: 'published' })]
    if (includeDrafts) {
      requests.push(fetchMyMentorPosts({ status: 'draft' }))
    }

    Promise.all(requests)
      .then((results) => {
        const [publishedRows, draftRows = []] = results
        setPublished(sortPostRows(mapPostRows(publishedRows, lang)))
        setDrafts(includeDrafts ? sortPostRows(mapPostRows(draftRows, lang)) : [])
      })
      .catch(() => {
        setPublished([])
        setDrafts([])
        setError(t('mentorSchedule.publishFailed'))
      })
      .finally(() => setLoading(false))
  }, [user?.id, lang, includeDrafts, t])

  useEffect(() => {
    loadPosts()
  }, [loadPosts, refreshKey])

  const handleDelete = async (postId) => {
    if (!postId || !window.confirm(t('mentorSchedule.deleteConfirm'))) return
    setDeletingId(postId)
    setError('')
    try {
      await deleteMentorPost(postId)
      loadPosts()
      onPostsChange?.()
    } catch (err) {
      setError(err?.message || t('mentorSchedule.publishFailed'))
    } finally {
      setDeletingId(null)
    }
  }

  const hasRows = published.length > 0 || drafts.length > 0

  return (
    <PageCard className={className}>
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <CalendarClock className="h-5 w-5 text-primary-500" aria-hidden />
          <h3 className="text-base font-bold text-slate-800">{t('mentorSchedule.publishedTitle')}</h3>
        </div>
        <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">{t('mentorSchedule.publishedHint')}</p>
      </div>

      {loading ? (
        <p className="py-6 text-center text-sm text-slate-500">{t('student.loadingMentors')}</p>
      ) : !hasRows ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 py-8 text-center">
          <p className="text-sm text-slate-500">{t('mentorSchedule.noPublished')}</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {published.map((row) => (
            <SessionRow
              key={row.id}
              row={row}
              deletingId={deletingId}
              onDelete={handleDelete}
              t={t}
            />
          ))}
        </ul>
      )}

      {includeDrafts && drafts.length > 0 ? (
        <div className="mt-6 border-t border-slate-100 pt-5">
          <h4 className="mb-3 text-sm font-semibold text-slate-700">{t('mentorSchedule.draftTitle')}</h4>
          <ul className="space-y-3">
            {drafts.map((row) => (
              <SessionRow
                key={row.id}
                row={row}
                deletingId={deletingId}
                onDelete={handleDelete}
                t={t}
              />
            ))}
          </ul>
        </div>
      ) : null}

      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
    </PageCard>
  )
}
