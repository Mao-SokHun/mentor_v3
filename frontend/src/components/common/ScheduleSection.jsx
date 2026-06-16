import { useState } from 'react'
import { Plus, X, Edit2, Check, Clock, Calendar, BookOpen } from 'lucide-react'
import clsx from 'clsx'
import PageCard from './PageCard'
import MentorProfileSectionHeader from './MentorProfileSectionHeader'
import Select from '../ui/Select'
import TimeRangeInput from '../ui/TimeRangeInput'
import { useTranslation } from '@/i18n'
import {
  getSlotTimeDisplay,
  normalizeScheduleSlot,
  normalizeScheduleSlots,
} from '@/utils/timeRangeUtils'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

const DAY_SHORT = {
  Monday: 'Mon',
  Tuesday: 'Tue',
  Wednesday: 'Wed',
  Thursday: 'Thu',
  Friday: 'Fri',
  Saturday: 'Sat',
  Sunday: 'Sun',
}

const SCHEDULE_BADGES = [
  'bg-teal-100 text-teal-700',
  'bg-amber-100 text-amber-800',
  'bg-slate-100 text-slate-600',
]

const inputClass =
  'w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-100 focus:border-teal-300'

const ScheduleSlotCard = ({ slot }) => (
  <div className="group relative rounded-xl border border-primary-100/80 bg-gradient-to-br from-white via-white to-primary-50/40 p-3.5 shadow-sm hover:border-primary-200/90 hover:shadow-md transition-all duration-200">
    <div className="flex items-start justify-between gap-2 mb-2.5">
      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-primary-500 text-[10px] font-bold uppercase tracking-wide text-white">
        {DAY_SHORT[slot.day] || slot.day}
      </span>
      <span className="w-7 h-7 rounded-lg bg-white/80 border border-primary-100 flex items-center justify-center flex-shrink-0">
        <Clock className="w-3.5 h-3.5 text-primary-500" />
      </span>
    </div>
    <p className="text-sm font-bold text-slate-800 leading-snug">{getSlotTimeDisplay(slot)}</p>
    <p className="text-[11px] text-slate-500 mt-0.5">{slot.day}</p>
    <div className="mt-2.5 pt-2.5 border-t border-primary-100/60 flex items-start gap-1.5">
      <BookOpen className="w-3.5 h-3.5 text-primary-400 flex-shrink-0 mt-0.5" />
      <p className="text-xs font-medium text-primary-700 leading-snug line-clamp-2">{slot.subject}</p>
    </div>
  </div>
)

const ProfileScheduleRow = ({ slot, badgeClass }) => {
  const dayLabel = String(slot.day ?? '').toUpperCase()
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs sm:text-sm font-semibold uppercase tracking-wide text-slate-500">
        {dayLabel || '—'}
      </p>
      <p className="flex items-center gap-2 mt-2.5 text-sm font-semibold text-slate-800">
        <Clock className="w-4 h-4 text-teal-600 shrink-0" />
        {getSlotTimeDisplay(slot)}
      </p>
      {slot.subject ? (
        <span
          className={clsx(
            'inline-block mt-3 px-2.5 py-0.5 rounded-md text-[11px] font-semibold',
            badgeClass
          )}
        >
          {slot.subject}
        </span>
      ) : null}
    </div>
  )
}

const ScheduleSection = ({
  schedule,
  onChange,
  readOnly = false,
  title,
  hint,
  variant = 'default',
  className,
  embedded = false,
  showHeader = true,
}) => {
  const { t } = useTranslation()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(schedule)
  const isProfile = variant === 'profile'
  const sectionTitle = title || t('mentorProfile.schedule')

  const startEdit = () => {
    setDraft(normalizeScheduleSlots(schedule))
    setEditing(true)
  }

  const confirm = () => {
    onChange(normalizeScheduleSlots(draft))
    setEditing(false)
  }

  const cancel = () => {
    setDraft(schedule)
    setEditing(false)
  }

  const updateSlot = (id, patch) => {
    setDraft((prev) =>
      prev.map((s) => (s.id === id ? normalizeScheduleSlot({ ...s, ...patch }) : s))
    )
  }

  const removeSlot = (id) => {
    setDraft((prev) => prev.filter((s) => s.id !== id))
  }

  const addSlot = () => {
    setDraft((prev) =>
      normalizeScheduleSlots([
        ...prev,
        { id: Date.now(), day: 'Monday', startTime: '08:00', endTime: '10:00', subject: '' },
      ])
    )
  }

  const rows = editing ? draft : normalizeScheduleSlots(schedule)

  const editActions = !readOnly ? (
    <div className="flex items-center gap-2 shrink-0">
      {!editing ? (
        <button
          type="button"
          onClick={startEdit}
          className="flex items-center gap-1 px-3 py-1 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <Edit2 className="w-3 h-3" /> {t('mentorSchedule.edit')}
        </button>
      ) : (
        <>
          <button
            type="button"
            onClick={confirm}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 transition-colors"
          >
            <Check className="w-3.5 h-3.5" /> {t('mentorSchedule.confirm')}
          </button>
          <button
            type="button"
            onClick={cancel}
            aria-label="Cancel"
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </>
      )}
    </div>
  ) : null

  const emptyMessage = (
    <p
      className={clsx(
        'text-sm text-slate-400 text-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50',
        isProfile && embedded ? 'py-4 px-3' : 'py-8'
      )}
    >
      {t('mentorSchedule.emptyWeekly')}
    </p>
  )

  const editForm = (
    <div className="space-y-3">
      {rows.map((slot) => {
        const normalized = normalizeScheduleSlot(slot)
        return (
          <div
            key={slot.id}
            className="relative grid grid-cols-1 gap-3 p-4 rounded-xl border border-slate-100 bg-slate-50/70"
          >
            <Select
              size="sm"
              value={slot.day}
              onChange={(v) => updateSlot(slot.id, { day: v })}
              options={DAYS}
            />
            <TimeRangeInput
              startTime={normalized.startTime}
              endTime={normalized.endTime}
              onChange={({ startTime, endTime }) =>
                updateSlot(slot.id, { startTime, endTime, time: undefined })
              }
            />
            <input
              value={slot.subject}
              onChange={(e) => updateSlot(slot.id, { subject: e.target.value })}
              placeholder="Subject / group"
              className={inputClass}
            />
            <button
              type="button"
              onClick={() => removeSlot(slot.id)}
              className="absolute top-2 right-2 p-1.5 text-red-400 hover:text-red-600"
              aria-label="Remove slot"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )
      })}
      <button
        type="button"
        onClick={addSlot}
        className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl border-2 border-dashed border-teal-200 text-xs font-semibold text-teal-600 hover:bg-teal-50 transition-colors"
      >
        <Plus className="w-3.5 h-3.5" /> {t('mentorSchedule.addSlot')}
      </button>
    </div>
  )

  const profileBody = (
    <>
      {rows.length === 0 && !editing && emptyMessage}
      {editing ? (
        editForm
      ) : (
        <div
          className={clsx(
            embedded
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2'
              : 'space-y-3'
          )}
        >
          {rows.map((slot, idx) => (
            <ProfileScheduleRow
              key={slot.id}
              slot={slot}
              badgeClass={SCHEDULE_BADGES[idx % SCHEDULE_BADGES.length]}
            />
          ))}
        </div>
      )}
    </>
  )

  if (isProfile) {
    if (embedded) {
      return (
        <div className={className}>
          {showHeader ? (
            <>
              <MentorProfileSectionHeader icon={Calendar} title={sectionTitle} action={editActions} />
              {hint ? (
                <p className="text-xs text-slate-500 mb-3 leading-relaxed -mt-1">{hint}</p>
              ) : null}
            </>
          ) : null}
          {profileBody}
        </div>
      )
    }

    return (
      <PageCard className={clsx('border border-slate-200/80 shadow-sm h-full', className)}>
        <MentorProfileSectionHeader icon={Calendar} title={sectionTitle} action={editActions} />
        {hint ? (
          <p className="text-sm text-slate-500 mb-3 leading-relaxed -mt-2">{hint}</p>
        ) : null}
        {profileBody}
      </PageCard>
    )
  }

  return (
    <PageCard padding={false} className={clsx('overflow-hidden', className)}>
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-primary-50/40 to-white">
        <div>
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">{sectionTitle}</h3>
          {!editing && rows.length > 0 && (
            <p className="text-[11px] text-slate-400 mt-1">
              {t('mentorProfile.scheduleCount', { count: rows.length })}
            </p>
          )}
        </div>
        {editActions}
      </div>

      <div className="p-5">
        {rows.length === 0 && !editing && emptyMessage}
        {editing ? (
          editForm
        ) : (
          <div
            className={clsx(
              'grid gap-3',
              rows.length === 1
                ? 'grid-cols-1 max-w-xs'
                : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
            )}
          >
            {rows.map((slot) => (
              <ScheduleSlotCard key={slot.id} slot={slot} />
            ))}
          </div>
        )}
      </div>
    </PageCard>
  )
}

export default ScheduleSection
