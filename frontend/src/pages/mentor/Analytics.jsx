import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Download, Eye, Users, BookOpen, TrendingUp } from 'lucide-react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import clsx from 'clsx'
import {
  PageScaffold,
  StatMetric,
  FilterBar,
  PageAmbient,
  PageCard,
  WeeklyScheduleReport,
  DataTable,
} from '@/components'
import { useTranslation } from '@/i18n'
import { useAuth } from '@/hooks'
import { isApiEnabled } from '@/constants'
import { getStoredUser } from '@/lib/authStorage'
import {
  fetchMyMentorAnalytics,
  fetchMyMentorPosts,
  fetchMyMentorProfile,
} from '@/services/mentors/mentorService'
import { getLocalDetailViewCount } from '@/utils/mentorViewTracking'
import {
  buildAnalyticsExportPayload,
  exportAnalyticsReport,
  resolveMentorExportIdentity,
} from '@/utils/analyticsExportUtils'
import {
  DEFAULT_ANALYTICS_FILTERS,
  buildStatusFilterOptions,
  buildSubjectFilterOptions,
  computeFilteredPostStats,
  postMatchesStatus,
  postMatchesSubject,
} from '@/utils/analyticsFilterUtils'
import {
  REPORT_PERIOD_MONTH,
  REPORT_PERIOD_WEEK,
  REPORT_PERIOD_YEAR,
  filterPostsByReportPeriod,
  formatReportPeriodLabel,
  reportPeriodStamp,
} from '@/utils/analyticsReportUtils'
import { mapPostsToSessionRows } from '@/utils/mentorDetailUtils'
import { buildProfileViewsTrend, buildWeeklyPostsTrend } from '@/utils/mentorDashboardInsights'

const CHART_PRIMARY = '#c07888'
const STATUS_STYLES = {
  Active: 'bg-emerald-50 text-emerald-700',
  Pending: 'bg-amber-50 text-amber-700',
  Cancelled: 'bg-red-50 text-red-600',
}
const SESSION_PAGE_SIZE = 8

function formatStat(value) {
  if (value == null || Number.isNaN(Number(value))) return '—'
  return Number(value).toLocaleString()
}

// ============= Start analytics page =============
const Analytics = () => {
  const { t, lang, labelFor } = useTranslation()
  const { user } = useAuth()
  const [mentorStats, setMentorStats] = useState(null)
  const [mentorPosts, setMentorPosts] = useState([])
  const [mentorRow, setMentorRow] = useState(null)
  const [statsLoading, setStatsLoading] = useState(isApiEnabled())
  const [loadError, setLoadError] = useState('')
  const [sessionPage, setSessionPage] = useState(1)

  const [filters, setFilters] = useState(DEFAULT_ANALYTICS_FILTERS)
  const [appliedFilters, setAppliedFilters] = useState(DEFAULT_ANALYTICS_FILTERS)
  const [reportPeriod, setReportPeriod] = useState(REPORT_PERIOD_WEEK)
  const [reportAnchor, setReportAnchor] = useState(() => new Date())

  // Start fetch analytics data
  useEffect(() => {
    if (!isApiEnabled()) {
      setStatsLoading(false)
      return
    }
    let cancelled = false
    setLoadError('')

    Promise.all([
      fetchMyMentorAnalytics(),
      fetchMyMentorPosts(),
      fetchMyMentorProfile().catch(() => null),
    ])
      .then(([analytics, posts, profile]) => {
        if (cancelled) return
        setMentorStats(analytics)
        setMentorPosts(posts ?? [])
        setMentorRow(profile ?? null)
      })
      .catch((err) => {
        if (!cancelled) {
          setMentorStats(null)
          setMentorPosts([])
          setMentorRow(null)
          setLoadError(err?.message || t('analytics.loadFailed'))
        }
      })
      .finally(() => {
        if (!cancelled) setStatsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [t])
  // End fetch analytics data

  const retryLoad = useCallback(() => {
    if (!isApiEnabled()) return
    setStatsLoading(true)
    setLoadError('')

    Promise.all([
      fetchMyMentorAnalytics(),
      fetchMyMentorPosts(),
      fetchMyMentorProfile().catch(() => null),
    ])
      .then(([analytics, posts, profile]) => {
        setMentorStats(analytics)
        setMentorPosts(posts ?? [])
        setMentorRow(profile ?? null)
      })
      .catch((err) => {
        setMentorStats(null)
        setMentorPosts([])
        setMentorRow(null)
        setLoadError(err?.message || t('analytics.loadFailed'))
      })
      .finally(() => {
        setStatsLoading(false)
      })
  }, [t])

  const subjectOptions = useMemo(
    () => buildSubjectFilterOptions(mentorPosts, t('analytics.allSubjects'), lang),
    [mentorPosts, t, lang]
  )

  const statusOptions = useMemo(
    () =>
      buildStatusFilterOptions(mentorPosts, {
        allLabel: t('analytics.allStatus'),
        activeLabel: t('analytics.statusActive'),
        pendingLabel: t('analytics.statusPending'),
        cancelledLabel: t('analytics.statusCancelled'),
      }),
    [mentorPosts, t]
  )

  /** Calendar navigation — subject/status filters only */
  const calendarPosts = useMemo(
    () =>
      mentorPosts.filter(
        (post) =>
          postMatchesSubject(post, appliedFilters.subject, lang) &&
          postMatchesStatus(post, appliedFilters.status)
      ),
    [mentorPosts, appliedFilters.subject, appliedFilters.status, lang]
  )

  const periodPosts = useMemo(
    () => filterPostsByReportPeriod(calendarPosts, reportPeriod, reportAnchor),
    [calendarPosts, reportPeriod, reportAnchor]
  )

  const periodLabel = useMemo(
    () => formatReportPeriodLabel(reportPeriod, reportAnchor, lang),
    [reportPeriod, reportAnchor, lang]
  )

  const reportTitle = useMemo(() => {
    if (reportPeriod === REPORT_PERIOD_MONTH) return t('analytics.monthlyReport')
    if (reportPeriod === REPORT_PERIOD_YEAR) return t('analytics.yearlyReport')
    return t('analytics.weeklyReport')
  }, [reportPeriod, t])

  const filteredStats = useMemo(() => computeFilteredPostStats(periodPosts), [periodPosts])

  const detailViewCount = useMemo(() => {
    if (isApiEnabled()) {
      return mentorStats?.profile_views ?? 0
    }
    const userId = getStoredUser()?.id
    return userId ? getLocalDetailViewCount(userId) : 0
  }, [mentorStats?.profile_views])

  const applyFilters = () => {
    setAppliedFilters({ ...filters })
    setSessionPage(1)
  }

  const resetFilters = () => {
    setFilters(DEFAULT_ANALYTICS_FILTERS)
    setAppliedFilters(DEFAULT_ANALYTICS_FILTERS)
    setSessionPage(1)
  }

  const filteredSessionRows = useMemo(
    () =>
      mapPostsToSessionRows(periodPosts, {
        lang,
        onlineLabel: t('mentorCard.onlineClass'),
      }),
    [periodPosts, lang, t]
  )

  const postsTrend = useMemo(() => buildWeeklyPostsTrend(periodPosts, lang), [periodPosts, lang])

  const viewsTrend = useMemo(() => buildProfileViewsTrend(mentorStats, lang), [mentorStats, lang])

  const sessionColumns = useMemo(
    () => [
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
    ],
    [t]
  )

  const scheduleKey = `${appliedFilters.subject}-${appliedFilters.status}-${mentorPosts.length}`

  const exportPayload = useMemo(() => {
    const subjectLabel =
      subjectOptions.find((o) => o.value === appliedFilters.subject)?.label ?? ''
    const statusLabel =
      statusOptions.find((o) => o.value === appliedFilters.status)?.label ?? ''

    return buildAnalyticsExportPayload({
      posts: periodPosts,
      reportPeriod,
      periodLabel,
      summary: {
        totalPosts: filteredStats.totalPosts,
        detailViews: detailViewCount,
        activeSessions: filteredStats.activeSessions,
        avgPerWeek: filteredStats.avgPerWeek,
      },
      filters: {
        periodLabel,
        periodStamp: reportPeriodStamp(reportPeriod, reportAnchor),
        subjectLabel,
        statusLabel,
      },
      mentor: resolveMentorExportIdentity(mentorRow, user),
      labels: {
        reportTitle,
        kingdom: t('analytics.exportKingdom'),
        motto: t('analytics.exportMotto'),
        platform: t('analytics.exportPlatform'),
        mentorNameKm: t('analytics.exportMentorNameKm'),
        mentorNameEn: t('analytics.exportMentorNameEn'),
        generated: t('analytics.exportGenerated'),
        noSessions: t('analytics.exportNoSessions'),
        sessionsSheet: t('analytics.exportSessionsSheet'),
        summaryTotalPosts: t('analytics.totalPosts'),
        summaryDetailViews: t('analytics.totalViewer'),
        summaryActiveSessions: t('analytics.totalSessions'),
        summaryAvgPerWeek: t('analytics.avgPerWeek'),
        filterPeriod: t('analytics.exportFilterPeriod'),
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
    })
  }, [
    appliedFilters,
    subjectOptions,
    statusOptions,
    periodPosts,
    reportPeriod,
    periodLabel,
    reportAnchor,
    reportTitle,
    filteredStats,
    detailViewCount,
    mentorRow,
    user,
    t,
  ])

  const handleExportReport = useCallback(() => exportAnalyticsReport(exportPayload), [exportPayload])

  return (
    <PageAmbient variant="mentor">
      <PageScaffold
        title={t('analytics.title')}
        subtitle={t('analytics.subtitle')}
        action={
          <button
            type="button"
            onClick={handleExportReport}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-primary-400 text-white text-xs font-semibold hover:bg-primary-500 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            {t('analytics.exportReport')}
          </button>
        }
      >
        {loadError ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            <p>{loadError}</p>
            <button
              type="button"
              onClick={retryLoad}
              className="shrink-0 px-3 py-1.5 rounded-lg border border-red-200 bg-white text-xs font-semibold text-red-700 hover:bg-red-50 transition-colors"
            >
              {t('common.retry')}
            </button>
          </div>
        ) : null}

        {/* Start summary stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatMetric
            label={t('analytics.totalPosts')}
            value={statsLoading ? '…' : formatStat(filteredStats.totalPosts)}
            icon={BookOpen}
            tone="primary"
          />
          <StatMetric
            label={t('analytics.totalViewer')}
            value={statsLoading ? '…' : formatStat(detailViewCount)}
            icon={Eye}
            tone="info"
          />
          <StatMetric
            label={t('analytics.totalSessions')}
            value={statsLoading ? '…' : formatStat(filteredStats.activeSessions)}
            icon={Users}
            tone="success"
          />
          <StatMetric
            label={t('analytics.avgPerWeek')}
            value={statsLoading ? '…' : formatStat(filteredStats.avgPerWeek)}
            icon={TrendingUp}
            tone="warning"
          />
        </div>
        {/* End summary stats */}

        {/* Start filters */}
        <FilterBar
          standalone
          fields={[
            {
              id: 'subject',
              label: t('analytics.subject'),
              value: filters.subject,
              onChange: (v) => setFilters((prev) => ({ ...prev, subject: v })),
              options: subjectOptions,
            },
            {
              id: 'status',
              label: t('analytics.status'),
              value: filters.status,
              onChange: (v) => setFilters((prev) => ({ ...prev, status: v })),
              options: statusOptions,
            },
          ]}
          onReset={resetFilters}
        >
          <button
            type="button"
            onClick={applyFilters}
            className="px-4 py-2.5 rounded-lg bg-primary-400 text-white text-sm font-semibold hover:bg-primary-500 transition-colors whitespace-nowrap"
          >
            {t('analytics.apply')}
          </button>
        </FilterBar>
        {/* End filters */}

        {/* Start trend charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <PageCard padding={false} className="overflow-hidden">
            <div className="p-5 pb-2">
              <h2 className="text-sm font-bold text-slate-800">{t('analytics.postsTrend')}</h2>
              <p className="text-xs text-slate-500 mt-0.5">{t('analytics.postsTrendHint')}</p>
            </div>
            <div className="px-2 pb-5">
              {postsTrend.length === 0 ? (
                <p className="text-sm text-slate-500 px-3 py-8">{t('analytics.noChartData')}</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={postsTrend} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="t" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 12,
                        border: 'none',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                        fontSize: 12,
                      }}
                    />
                    <Bar dataKey="posts" name={t('analytics.totalPosts')} fill={CHART_PRIMARY} radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </PageCard>

          <PageCard padding={false} className="overflow-hidden">
            <div className="p-5 pb-2">
              <h2 className="text-sm font-bold text-slate-800">{t('analytics.viewsTrend')}</h2>
              <p className="text-xs text-slate-500 mt-0.5">{t('analytics.viewsTrendHint')}</p>
            </div>
            <div className="px-2 pb-5">
              {viewsTrend.length === 0 ? (
                <p className="text-sm text-slate-500 px-3 py-8">{t('analytics.noChartData')}</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={viewsTrend} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="t" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 12,
                        border: 'none',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                        fontSize: 12,
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="views"
                      name={t('analytics.totalViewer')}
                      stroke={CHART_PRIMARY}
                      strokeWidth={2.5}
                      dot={{ r: 3, fill: CHART_PRIMARY }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </PageCard>
        </div>
        {/* End trend charts */}

        {/* Start weekly schedule calendar */}
        <PageCard padding={false} className="overflow-hidden border border-slate-200/80 shadow-sm">
          <WeeklyScheduleReport
            key={scheduleKey}
            posts={calendarPosts}
            viewMode={reportPeriod}
            anchorDate={reportAnchor}
            onViewModeChange={setReportPeriod}
            onAnchorChange={setReportAnchor}
            onExport={handleExportReport}
          />
        </PageCard>
        {/* End weekly schedule calendar */}

        {/* Start filtered sessions table */}
        <div>
          <h2 className="font-bold text-slate-800 text-base mb-1 px-1">{t('analytics.sessionsThisPeriod')}</h2>
          {periodLabel ? (
            <p className="text-xs text-slate-500 mb-3 px-1">{periodLabel}</p>
          ) : null}
          {statsLoading ? (
            <p className="text-sm text-slate-500 px-1">{t('student.loadingMentors')}</p>
          ) : filteredSessionRows.length === 0 ? (
            <p className="text-sm text-slate-500 px-1">{t('analytics.exportNoSessions')}</p>
          ) : (
            <DataTable
              columns={sessionColumns}
              rows={filteredSessionRows}
              page={sessionPage}
              pageSize={SESSION_PAGE_SIZE}
              total={filteredSessionRows.length}
              onPageChange={setSessionPage}
            />
          )}
        </div>
        {/* End filtered sessions table */}
      </PageScaffold>
    </PageAmbient>
  )
}

export default Analytics
// ============= End analytics page =============
