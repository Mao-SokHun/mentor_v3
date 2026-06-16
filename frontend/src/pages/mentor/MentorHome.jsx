import { useCallback, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Download, Pencil, Trash2 } from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts'
import clsx from 'clsx'
import {
  PageCard,
  DataTable,
  StatMetric,
  PageAmbient,
} from '@/components'
import { useTranslation } from '@/i18n'
import { useAuth, useMentorDashboard } from '@/hooks'
import { PERIOD_TODAY, PERIOD_WEEK } from '@/utils/mentorDashboardUtils'
import { deleteMentorPost } from '@/services/mentors/mentorService'
import { isApiEnabled } from '@/constants'
import {
  buildAnalyticsExportPayload,
  exportAnalyticsReport,
  resolveMentorExportIdentity,
} from '@/utils/analyticsExportUtils'

const PRIMARY = '#c07888'

const STATUS_STYLES = {
  Active: 'bg-emerald-50 text-emerald-700',
  Pending: 'bg-amber-50 text-amber-700',
  Cancelled: 'bg-red-50 text-red-600',
}

const PAGE_SIZE = 5

function formatStat(value) {
  if (value == null || Number.isNaN(Number(value))) return '—'
  return Number(value).toLocaleString()
}

function formatRating(rating, reviewCount) {
  const r = Number(rating) || 0
  if (r <= 0 && !reviewCount) return '—'
  return r.toFixed(1)
}

// ============= Start mentor home page =============
const MentorHome = () => {
  const { t } = useTranslation()
  const { user } = useAuth()
  const {
    stats,
    activityChart,
    subjectBreakdown,
    upcomingSessions,
    posts,
    mentorRow,
    loading,
    loadError,
    period,
    setPeriod,
    periods,
    refetch,
  } = useMentorDashboard()
  const [page, setPage] = useState(1)
  const [deletingId, setDeletingId] = useState(null)

  // Start delete session post
  const handleDeletePost = async (postId) => {
    if (!postId || !window.confirm(t('mentorSchedule.deleteConfirm'))) return
    setDeletingId(postId)
    try {
      await deleteMentorPost(postId)
      refetch?.()
    } catch {
      window.alert(t('mentorSchedule.publishFailed'))
    } finally {
      setDeletingId(null)
    }
  }
  // End delete session post

  const actionBtn =
    'inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 transition-colors disabled:opacity-50'

  const periodLabels = {
    [PERIOD_TODAY]: t('mentorDash.today'),
    [PERIOD_WEEK]: t('mentorDash.last7Days'),
  }

  const sessionColumns = [
    {
      key: 'task',
      label: t('mentorDash.taskStart'),
      render: (row) => (
        <div>
          <p className="font-medium text-slate-800 text-xs">{row.date}</p>
          <p className="text-xs text-slate-400">{row.time}</p>
        </div>
      ),
    },
    {
      key: 'subject',
      label: t('mentorDash.subject'),
      render: (row) => <span className="text-xs font-medium">{row.subject}</span>,
    },
    {
      key: 'location',
      label: t('mentorDash.sessionLocation'),
      className: 'text-center',
      render: (row) => (
        <span className="text-xs font-medium text-slate-600">{row.location}</span>
      ),
    },
    {
      key: 'status',
      label: t('mentorDash.status'),
      className: 'text-center',
      render: (row) => (
        <span
          className={clsx(
            'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium',
            STATUS_STYLES[row.status] ?? 'bg-slate-100 text-slate-600'
          )}
        >
          {row.status === 'Active'
            ? t('analytics.statusActive')
            : row.status === 'Pending'
              ? t('analytics.statusPending')
              : row.status === 'Cancelled'
                ? t('analytics.statusCancelled')
                : row.status}
        </span>
      ),
    },
    {
      key: 'details',
      label: t('mentorDash.details'),
      className: 'text-center',
      render: (row) =>
        row.postId ? (
          <Link
            to={`/schedule/post/${row.postId}`}
            className="text-xs font-semibold text-primary-600 hover:text-primary-700"
          >
            {t('mentorDash.viewSessionDetail')}
          </Link>
        ) : (
          <span className="text-xs text-slate-300">—</span>
        ),
    },
    {
      key: 'actions',
      label: t('mentorDash.actions'),
      className: 'text-center',
      render: (row) =>
        row.postId ? (
          <div className="flex items-center justify-center gap-1">
            <Link
              to={`/mentor/edit-post/${row.postId}`}
              className={clsx(actionBtn, 'hover:bg-primary-50 text-primary-600 border-primary-200')}
              aria-label={t('mentorSchedule.editPost')}
              title={t('mentorSchedule.editPost')}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Link>
            {isApiEnabled() ? (
              <button
                type="button"
                onClick={() => handleDeletePost(row.postId)}
                disabled={deletingId === row.postId}
                className={clsx(actionBtn, 'hover:bg-red-50 text-red-600 border-red-100')}
                aria-label={t('mentorSchedule.deletePost')}
                title={t('mentorSchedule.deletePost')}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            ) : null}
          </div>
        ) : (
          <span className="text-xs text-slate-300">—</span>
        ),
    },
  ]

  const exportPayload = useMemo(
    () =>
      buildAnalyticsExportPayload({
        posts,
        summary: {
          totalPosts: stats.sessions,
          detailViews: stats.detailViews,
          activeSessions: stats.sessions,
          avgPerWeek: stats.thisWeek,
        },
        filters: {
          dateRangeLabel: t('mentorDash.sessions'),
          subjectLabel: t('analytics.allSubjects'),
          statusLabel: t('analytics.allStatus'),
        },
        mentor: resolveMentorExportIdentity(mentorRow, user),
        labels: {
          reportTitle: t('mentorDash.sessions'),
          kingdom: t('analytics.exportKingdom'),
          motto: t('analytics.exportMotto'),
          platform: t('analytics.exportPlatform'),
          mentorNameKm: t('analytics.exportMentorNameKm'),
          mentorNameEn: t('analytics.exportMentorNameEn'),
          generated: t('analytics.exportGenerated'),
          noSessions: t('analytics.exportNoSessions'),
          sessionsSheet: t('analytics.exportSessionsSheet'),
          summaryTotalPosts: t('mentorDash.totalSessions'),
          summaryDetailViews: t('mentorDash.detailViews'),
          summaryActiveSessions: t('mentorDash.totalSessions'),
          summaryAvgPerWeek: t('mentorDash.thisWeek'),
          filterDate: t('analytics.exportFilterDate'),
          filterSubject: t('analytics.exportFilterSubject'),
          filterStatus: t('analytics.exportFilterStatus'),
          colDate: t('analytics.exportColDate'),
          colTime: t('analytics.exportColTime'),
          colSubject: t('analytics.exportColSubject'),
          colStatus: t('analytics.exportColStatus'),
        },
        statusLabels: {
          Active: t('analytics.statusActive'),
          Pending: t('analytics.statusPending'),
          Cancelled: t('analytics.statusCancelled'),
        },
      }),
    [posts, stats, mentorRow, user, t]
  )

  const handleExportReport = useCallback(() => exportAnalyticsReport(exportPayload), [exportPayload])

  return (
    <PageAmbient variant="mentor" className="space-y-5">
      {/* Start page header */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-slate-800 via-slate-800 to-slate-900 text-white px-5 py-4">
        <div className="relative z-10">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{t('mentorDash.label')}</p>
          <h1 className="text-xl font-bold mt-0.5">{t('mentorDash.heading')}</h1>
          <p className="text-sm text-slate-300 mt-1">{t('mentorDash.subtitle')}</p>
        </div>
      </div>
      {/* End page header */}

      {loadError ? (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          <p>{loadError}</p>
          <button
            type="button"
            onClick={() => refetch?.()}
            className="shrink-0 px-3 py-1.5 rounded-lg border border-red-200 bg-white text-xs font-semibold text-red-700 hover:bg-red-50 transition-colors"
          >
            {t('common.retry')}
          </button>
        </div>
      ) : null}

      {/* Start stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatMetric
          label={t('mentorDash.totalSessions')}
          value={loading ? '…' : formatStat(stats.sessions)}
          tone="primary"
        />
        <StatMetric
          label={t('mentorDash.detailViews')}
          value={loading ? '…' : formatStat(stats.detailViews)}
          tone="success"
        />
        <StatMetric
          label={t('mentorDash.avgRating')}
          value={loading ? '…' : formatRating(stats.rating, stats.reviewCount)}
          tone="warning"
        />
        <StatMetric
          label={t('mentorDash.thisWeek')}
          value={loading ? '…' : formatStat(stats.thisWeek)}
          tone="info"
        />
      </div>
      {/* End stats row */}

      {/* Start user activity chart */}
      <PageCard padding={false} className="overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 pb-3">
          <h2 className="font-bold text-slate-800 text-base">
            {t('mentorDash.userActivity')} ({periodLabels[period]})
          </h2>
          <div className="flex items-center gap-0.5 bg-slate-100 p-0.5 rounded-lg self-start sm:self-auto">
            {periods.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPeriod(p)}
                className={clsx(
                  'px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                  period === p ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                )}
              >
                {periodLabels[p]}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-0 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
          <div className="flex-1 px-5 pb-5">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={activityChart} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="actGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={PRIMARY} stopOpacity={0.18} />
                    <stop offset="95%" stopColor={PRIMARY} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="t" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: 'none',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="v"
                  name={t('mentorDash.detailViews')}
                  stroke={PRIMARY}
                  strokeWidth={2.5}
                  fill="url(#actGrad)"
                  dot={false}
                  activeDot={{ r: 5, fill: PRIMARY }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="lg:w-64 p-5">
            <h3 className="text-sm font-bold text-slate-800">{t('mentorDash.activityBySubject')}</h3>
            <p className="mt-0.5 mb-4 text-[11px] leading-snug text-slate-400">
              {t('mentorDash.activityBySubjectHint')}
            </p>
            {subjectBreakdown.length === 0 ? (
              <p className="text-xs text-slate-400">{t('mentorDash.noSubjectActivity')}</p>
            ) : (
              <div className="space-y-3.5">
                {subjectBreakdown.map((item) => (
                  <div key={item.key}>
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <span className="min-w-0 text-xs font-medium leading-snug text-slate-600 line-clamp-2">
                        {item.label}
                      </span>
                      <span className="shrink-0 text-xs font-semibold text-slate-800 tabular-nums">
                        {item.pct}%
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={clsx('h-full rounded-full', item.color)}
                        style={{ width: `${item.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </PageCard>
      {/* End user activity chart */}

      {/* Start sessions table */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3 px-1">
          <h2 className="font-bold text-slate-800 text-base">{t('mentorDash.sessions')}</h2>
          <button
            type="button"
            onClick={handleExportReport}
            disabled={loading}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-lg bg-primary-400 text-white text-xs font-semibold hover:bg-primary-500 transition-colors disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            {t('mentorDash.exportReport')}
          </button>
        </div>
        {loading ? (
          <p className="text-sm text-slate-500 px-1">{t('student.loadingMentors')}</p>
        ) : upcomingSessions.length === 0 ? (
          <p className="text-sm text-slate-500 px-1">{t('mentorSchedule.noPublished')}</p>
        ) : (
          <DataTable
            columns={sessionColumns}
            rows={upcomingSessions}
            page={page}
            pageSize={PAGE_SIZE}
            total={upcomingSessions.length}
            onPageChange={setPage}
          />
        )}
      </div>
      {/* End sessions table */}
    </PageAmbient>
  )
}

export default MentorHome
// ============= End mentor home page =============
