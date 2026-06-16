import clsx from 'clsx'

/**
 * ProgressBar
 * Props:
 *   value      number  (0–100)
 *   max        number  (default 100)
 *   size       'xs' | 'sm' | 'md' | 'lg'  (default 'sm')
 *   color      'rose' | 'emerald' | 'rose' | 'amber' | 'purple' | 'auto' (default 'rose')
 *              'auto' picks color based on value: red<40, amber<70, emerald>=70
 *   showLabel  boolean — show percentage text to the right
 *   label      string  — optional label above the bar
 *   animated   boolean — shimmer animation
 *   className  string
 */

const heights = { xs: 'h-1', sm: 'h-1.5', md: 'h-2.5', lg: 'h-4' }

const trackColors = {
  rose: 'from-primary-400 to-primary-500',
  emerald: 'from-emerald-400 to-teal-500',
  rose: 'from-primary-300 to-primary-400',
  amber: 'from-amber-400 to-orange-400',
  purple: 'from-primary-300 to-primary-500',
}

const getAutoColor = (val) => {
  if (val < 40) return 'from-primary-300 to-primary-400'
  if (val < 70) return 'from-amber-400 to-orange-400'
  return 'from-emerald-400 to-teal-500'
}

const ProgressBar = ({
  value = 0,
  max = 100,
  size = 'sm',
  color = 'rose',
  showLabel = false,
  label,
  animated = false,
  className,
}) => {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  const gradient = color === 'auto' ? getAutoColor(pct) : (trackColors[color] || trackColors.rose)

  return (
    <div className={clsx('w-full', className)}>
      {(label || showLabel) && (
        <div className="flex items-center justify-between mb-1">
          {label && <span className="text-xs text-slate-500">{label}</span>}
          {showLabel && <span className="text-xs font-semibold text-slate-600">{Math.round(pct)}%</span>}
        </div>
      )}
      <div className={clsx('w-full bg-slate-100 rounded-full overflow-hidden', heights[size])}>
        <div
          className={clsx(
            'h-full rounded-full bg-gradient-to-r transition-all duration-500',
            gradient,
            animated && 'animate-pulse'
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

export default ProgressBar
