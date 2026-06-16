import clsx from 'clsx'

const StatMetric = ({ label, value, change, icon: Icon, tone = 'default' }) => {
  const tones = {
    default: 'bg-slate-50 text-slate-600',
    primary: 'bg-primary-50 text-primary-600',
    success: 'bg-emerald-50 text-emerald-600',
    warning: 'bg-amber-50 text-amber-600',
    info: 'bg-sky-50 text-sky-600',
  }

  return (
    <div className="glass-panel p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
          <p className="text-2xl font-bold text-slate-800 mt-1 tabular-nums">{value}</p>
          {change && (
            <p className={clsx('text-xs font-medium mt-1', change.startsWith('+') ? 'text-emerald-600' : 'text-slate-400')}>
              {change}
            </p>
          )}
        </div>
        {Icon && (
          <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', tones[tone])}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </div>
  )
}

export default StatMetric
