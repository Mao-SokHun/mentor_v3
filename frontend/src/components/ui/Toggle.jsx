import clsx from 'clsx'

/**
 * Toggle / Switch
 * Props:
 *   checked   boolean
 *   onChange  (bool) => void
 *   size      'sm' | 'md' (default 'md')
 *   disabled  boolean
 *   label     string  — inline label shown to the left
 *   className string
 */
const Toggle = ({ checked, onChange, size = 'md', disabled = false, label, className }) => {
  const sizes = {
    sm: { track: 'w-8 h-4', knob: 'w-3 h-3', translate: 'translate-x-4' },
    md: { track: 'w-10 h-5', knob: 'w-4 h-4', translate: 'translate-x-5' },
  }
  const s = sizes[size] || sizes.md

  return (
    <div className={clsx('flex items-center gap-2', className)}>
      {label && <span className="text-sm text-slate-600 select-none">{label}</span>}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange?.(!checked)}
        className={clsx(
          'relative inline-flex flex-shrink-0 rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-2',
          s.track,
          checked ? 'bg-primary-400' : 'bg-slate-200',
          disabled && 'opacity-50 cursor-not-allowed',
          !disabled && 'cursor-pointer'
        )}
      >
        <span
          className={clsx(
            'absolute top-0.5 left-0.5 bg-white rounded-full shadow transition-transform duration-200',
            s.knob,
            checked ? s.translate : 'translate-x-0'
          )}
        />
      </button>
    </div>
  )
}

export default Toggle
