import clsx from 'clsx'

const BillingIntervalToggle = ({ value = 'monthly', onChange, className }) => {
  return (
    <div className={clsx('inline-flex rounded-xl glass-ios-pill p-1 gap-0.5', className)}>
      <button
        type="button"
        onClick={() => onChange('monthly')}
        className={clsx(
          'px-4 py-2 rounded-lg text-xs font-bold transition-all',
          value === 'monthly'
            ? 'bg-white shadow-sm text-primary-600'
            : 'text-slate-500 hover:text-slate-700'
        )}
      >
        Monthly
      </button>
      <button
        type="button"
        onClick={() => onChange('annual')}
        className={clsx(
          'px-4 py-2 rounded-lg text-xs font-bold transition-all',
          value === 'annual'
            ? 'bg-white shadow-sm text-primary-600'
            : 'text-slate-500 hover:text-slate-700'
        )}
      >
        Annual
      </button>
    </div>
  )
}

export default BillingIntervalToggle
