import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Download } from 'lucide-react'
import clsx from 'clsx'
import { useTranslation } from '@/i18n'
import { formatSlotStartTime12h } from '@/utils/timeRangeUtils'
import {
  buildMonthGridFromPosts,
  buildWeekGridFromPosts,
  buildYearGridFromPosts,
  indexPostsByDate,
  mondayOfWeek,
  parseScheduleDate,
} from '@/utils/mentorDetailUtils'
import { parsePostScheduleMeta } from '@/utils/mentorPostMapper'
import {
  REPORT_PERIOD_MONTH,
  REPORT_PERIOD_WEEK,
  REPORT_PERIOD_YEAR,
} from '@/utils/analyticsReportUtils'

const ROW_BAR = [
  'border-l-[3px] border-l-blue-500',
  'border-l-[3px] border-l-rose-500',
]

function findInitialAnchor(posts) {
  const byDate = indexPostsByDate(posts)
  if (byDate.size === 0) return new Date()

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  if (byDate.has(todayKey)) return today

  const monday = mondayOfWeek(today)
  for (let i = 0; i < 7; i++) {
    const d = addDays(monday, i)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    if (byDate.has(key)) return today
  }

  let earliest = null
  for (const post of posts) {
    const parsed = parseScheduleDate(parsePostScheduleMeta(post.description).date)
    if (parsed && (!earliest || parsed < earliest)) earliest = parsed
  }
  return earliest ?? today
}

function addDays(date, days) {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  d.setHours(0, 0, 0, 0)
  return d
}

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function WeekSlot({ cell, rowIdx }) {
  if (!cell) return <div className="h-7" aria-hidden />

  const timeLabel = formatSlotStartTime12h(cell.time)

  return (
    <div
      className={clsx(
        'rounded-md bg-sky-50/90 px-2 py-1.5 text-[11px] font-semibold leading-tight text-sky-900 truncate',
        ROW_BAR[rowIdx % ROW_BAR.length]
      )}
      title={`${timeLabel} | ${cell.subject}`}
    >
      {timeLabel} | {cell.subject}
    </div>
  )
}

function MonthSlot({ cell, rowIdx }) {
  const timeLabel = formatSlotStartTime12h(cell.time)
  return (
    <div
      className={clsx(
        'rounded px-1.5 py-0.5 text-[10px] font-semibold leading-tight text-sky-900 truncate bg-sky-50',
        ROW_BAR[rowIdx % ROW_BAR.length]
      )}
      title={`${timeLabel} | ${cell.subject}`}
    >
      {timeLabel} | {cell.subject}
    </div>
  )
}

const PERIOD_MODES = [REPORT_PERIOD_WEEK, REPORT_PERIOD_MONTH, REPORT_PERIOD_YEAR]

/** Week / month / year schedule calendar for analytics report */
const WeeklyScheduleReport = ({
  posts = [],
  viewMode: controlledViewMode,
  anchorDate: controlledAnchorDate,
  onViewModeChange,
  onAnchorChange,
  onExport,
}) => {
  const { t, lang } = useTranslation()
  const [internalViewMode, setInternalViewMode] = useState(REPORT_PERIOD_WEEK)
  const [internalAnchor, setInternalAnchor] = useState(() => findInitialAnchor(posts))
  const [activeDayKey, setActiveDayKey] = useState(null)

  const isControlled = controlledViewMode != null && controlledAnchorDate != null
  const viewMode = isControlled ? controlledViewMode : internalViewMode
  const anchorDate = isControlled ? controlledAnchorDate : internalAnchor

  const setViewMode = (mode) => {
    if (!isControlled) setInternalViewMode(mode)
    onViewModeChange?.(mode)
  }

  const setAnchorDate = (updater) => {
    const next = typeof updater === 'function' ? updater(anchorDate) : updater
    if (!isControlled) setInternalAnchor(next)
    onAnchorChange?.(next)
  }

  useEffect(() => {
    if (posts.length === 0 || isControlled) return
    setInternalAnchor(findInitialAnchor(posts))
    setActiveDayKey(null)
  }, [posts, isControlled])

  const weekGrid = useMemo(
    () => buildWeekGridFromPosts(posts, anchorDate, lang),
    [posts, anchorDate, lang]
  )

  const monthGrid = useMemo(
    () => buildMonthGridFromPosts(posts, anchorDate, lang),
    [posts, anchorDate, lang]
  )

  const yearGrid = useMemo(
    () => buildYearGridFromPosts(posts, anchorDate, lang),
    [posts, anchorDate, lang]
  )

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const activeDayIdx = useMemo(() => {
    const days = weekGrid.days
    if (!days.length) return 0
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    const key = activeDayKey ?? days.find((d) => d.dateKey === todayKey)?.key
    const idx = days.findIndex((d) => d.key === key)
    if (idx >= 0) return idx
    const firstWithSlots = days.findIndex((d) => d.slots.length > 0)
    return firstWithSlots >= 0 ? firstWithSlots : 0
  }, [weekGrid.days, activeDayKey])

  const rowCount = useMemo(
    () =>
      Math.max(
        1,
        weekGrid.maxRows,
        ...Object.values(weekGrid.scheduleData).map((cells) => cells?.length ?? 0)
      ),
    [weekGrid.maxRows, weekGrid.scheduleData]
  )

  const periodLabel =
    viewMode === REPORT_PERIOD_WEEK
      ? weekGrid.weekRange
      : viewMode === REPORT_PERIOD_MONTH
        ? monthGrid.monthLabel
        : yearGrid.yearLabel

  const scheduleTitle =
    viewMode === REPORT_PERIOD_WEEK
      ? t('analytics.weeklySchedule')
      : viewMode === REPORT_PERIOD_MONTH
        ? t('analytics.monthlySchedule')
        : t('analytics.yearlySchedule')

  const goPrev = () => {
    if (viewMode === REPORT_PERIOD_WEEK) {
      setAnchorDate((d) => addDays(mondayOfWeek(d), -7))
    } else if (viewMode === REPORT_PERIOD_MONTH) {
      setAnchorDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))
    } else {
      setAnchorDate((d) => new Date(d.getFullYear() - 1, 0, 1))
    }
  }

  const goNext = () => {
    if (viewMode === REPORT_PERIOD_WEEK) {
      setAnchorDate((d) => addDays(mondayOfWeek(d), 7))
    } else if (viewMode === REPORT_PERIOD_MONTH) {
      setAnchorDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))
    } else {
      setAnchorDate((d) => new Date(d.getFullYear() + 1, 0, 1))
    }
  }

  const goToday = () => {
    setAnchorDate(new Date())
    setActiveDayKey(null)
  }

  const switchView = (mode) => {
    setViewMode(mode)
    if (mode === REPORT_PERIOD_MONTH) {
      setAnchorDate(new Date(anchorDate.getFullYear(), anchorDate.getMonth(), 1))
    } else if (mode === REPORT_PERIOD_YEAR) {
      setAnchorDate(new Date(anchorDate.getFullYear(), 0, 1))
    } else {
      setAnchorDate(mondayOfWeek(anchorDate))
    }
  }

  const hasAnySlots = indexPostsByDate(posts).size > 0

  return (
    <div>
      <div className="px-4 sm:px-5 pt-4 sm:pt-5 pb-3 border-b border-slate-100 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-base sm:text-lg font-bold text-slate-900">{scheduleTitle}</h2>
          {periodLabel ? <p className="mt-0.5 text-sm text-slate-400 truncate">{periodLabel}</p> : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50">
            {PERIOD_MODES.map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => switchView(mode)}
                className={clsx(
                  'px-3 py-1.5 text-xs font-semibold rounded-md transition-colors',
                  viewMode === mode
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                )}
              >
                {mode === REPORT_PERIOD_WEEK
                  ? t('analytics.viewWeek')
                  : mode === REPORT_PERIOD_MONTH
                    ? t('analytics.viewMonth')
                    : t('analytics.viewYear')}
              </button>
            ))}
          </div>

          <div className="inline-flex items-center rounded-lg border border-slate-200 overflow-hidden">
            <button
              type="button"
              onClick={goPrev}
              aria-label={t('analytics.prevPeriod')}
              className="p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={goToday}
              className="px-2.5 py-1.5 text-xs font-semibold text-teal-700 border-x border-slate-200 hover:bg-teal-50 transition-colors"
            >
              {t('analytics.today')}
            </button>
            <button
              type="button"
              onClick={goNext}
              aria-label={t('analytics.nextPeriod')}
              className="p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {onExport ? (
            <button
              type="button"
              onClick={onExport}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-400 text-white text-xs font-semibold hover:bg-primary-500 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              {t('analytics.exportReport')}
            </button>
          ) : null}
        </div>
      </div>

      {!hasAnySlots ? (
        <p className="text-xs text-slate-400 text-center py-2 px-4 border-b border-slate-50 bg-slate-50/40">
          {t('mentorDetail.noAvailability')}
        </p>
      ) : null}

      {viewMode === REPORT_PERIOD_WEEK ? (
        <div className="overflow-x-auto">
          <div className="min-w-[560px]">
            <div className="grid grid-cols-7 border-b border-slate-100">
              {weekGrid.days.map((day, idx) => {
                const dayDate = parseScheduleDate(day.dateKey)
                const isToday = dayDate && isSameDay(dayDate, today)
                return (
                  <button
                    key={day.key}
                    type="button"
                    onClick={() => setActiveDayKey(day.key)}
                    className={clsx(
                      'py-2.5 text-center text-[11px] font-bold tracking-wide transition-colors',
                      activeDayIdx === idx
                        ? 'text-slate-900 border-b-2 border-slate-800 -mb-px'
                        : 'text-slate-400 hover:text-slate-600',
                      isToday && activeDayIdx !== idx && 'text-teal-600'
                    )}
                  >
                    {day.shortLabel}
                  </button>
                )
              })}
            </div>

            <div className="grid grid-cols-7 gap-1.5 p-3">
              {weekGrid.days.map((day) => (
                <div key={day.key} className="min-w-0 space-y-1.5">
                  {Array.from({ length: rowCount }).map((_, rowIdx) => (
                    <WeekSlot
                      key={rowIdx}
                      cell={weekGrid.scheduleData[day.key]?.[rowIdx]}
                      rowIdx={rowIdx}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : viewMode === REPORT_PERIOD_MONTH ? (
        <div className="overflow-x-auto max-h-[520px] overflow-y-auto">
          <div className="min-w-[560px] p-3">
            <div className="grid grid-cols-7 gap-1 mb-1">
              {monthGrid.weekdayLabels.map((label) => (
                <div
                  key={label}
                  className="py-1.5 text-center text-[10px] font-bold text-slate-400 tracking-wide"
                >
                  {label}
                </div>
              ))}
            </div>

            <div className="space-y-1">
              {monthGrid.weeks.map((week, wi) => (
                <div key={wi} className="grid grid-cols-7 gap-1">
                  {week.map((day) => {
                    const dayDate = parseScheduleDate(day.dateKey)
                    const isToday = dayDate && isSameDay(dayDate, today)
                    return (
                      <div
                        key={day.key}
                        className={clsx(
                          'min-h-[72px] rounded-lg border p-1.5 flex flex-col',
                          day.inMonth
                            ? 'border-slate-100 bg-white'
                            : 'border-transparent bg-slate-50/60',
                          isToday && 'ring-1 ring-teal-400 ring-inset'
                        )}
                      >
                        <span
                          className={clsx(
                            'text-[11px] font-bold leading-none',
                            day.inMonth ? 'text-slate-700' : 'text-slate-300',
                            isToday && 'text-teal-700'
                          )}
                        >
                          {day.dayNum}
                        </span>
                        <div className="mt-1 space-y-0.5 flex-1 overflow-y-auto max-h-14">
                          {day.slots.map((slot, si) => (
                            <MonthSlot key={si} cell={slot} rowIdx={si} />
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 sm:p-5">
          <p className="text-xs text-slate-500 mb-3">
            {t('analytics.yearlyScheduleHint', { count: yearGrid.total })}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {yearGrid.months.map((month) => (
              <div
                key={month.key}
                className={clsx(
                  'rounded-xl border p-3 transition-colors',
                  month.count > 0
                    ? 'border-teal-100 bg-teal-50/40'
                    : 'border-slate-100 bg-slate-50/50'
                )}
              >
                <p className="text-xs font-bold text-slate-800 truncate">{month.fullLabel}</p>
                <p className="mt-1 text-2xl font-bold tabular-nums text-slate-900">{month.count}</p>
                <p className="text-[10px] text-slate-500">{t('analytics.sessionsInMonth')}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default WeeklyScheduleReport
