import clsx from 'clsx'
import { formatTimeRange, normalizeTimeValue } from '@/utils/timeRangeUtils'

const timeInputClass =
  'w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-100 focus:border-teal-300 bg-white'

/**
 * Free-form time range — teacher picks start/end; stored as HH:mm for sorting.
 */
const TimeRangeInput = ({
  label,
  startTime = '',
  endTime = '',
  onChange,
  error,
  disabled = false,
  className,
}) => {
  const handleStart = (e) => {
    onChange?.({
      startTime: normalizeTimeValue(e.target.value),
      endTime: normalizeTimeValue(endTime),
    })
  }

  const handleEnd = (e) => {
    onChange?.({
      startTime: normalizeTimeValue(startTime),
      endTime: normalizeTimeValue(e.target.value),
    })
  }

  const preview = formatTimeRange(startTime, endTime)

  return (
    <div className={className}>
      {label ? (
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">{label}</label>
      ) : null}
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-2 items-center">
        <input
          type="time"
          value={normalizeTimeValue(startTime)}
          onChange={handleStart}
          disabled={disabled}
          className={timeInputClass}
          aria-label="Start time"
        />
        <span className="text-center text-slate-400 text-sm font-medium px-1 hidden sm:block">
          –
        </span>
        <input
          type="time"
          value={normalizeTimeValue(endTime)}
          onChange={handleEnd}
          disabled={disabled}
          className={timeInputClass}
          aria-label="End time"
        />
      </div>
      {preview ? (
        <p className="mt-1.5 text-xs text-slate-500">
          {preview}
        </p>
      ) : null}
      {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
    </div>
  )
}

export default TimeRangeInput
