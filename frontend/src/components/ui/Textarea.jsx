import { forwardRef } from 'react'
import clsx from 'clsx'

/**
 * Textarea
 * Props (extends HTML textarea):
 *   label      string
 *   error      string
 *   hint       string
 *   rows       number (default 3)
 *   resize     boolean (default false — no resize)
 *   className  string
 */
const Textarea = forwardRef(({
  label,
  error,
  hint,
  rows = 3,
  resize = false,
  className,
  id,
  ...props
}, ref) => {
  const fieldId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={fieldId} className="block text-xs font-semibold text-slate-600 mb-1.5">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={fieldId}
        rows={rows}
        className={clsx(
          'w-full px-4 py-3 rounded-xl border text-sm text-slate-700 placeholder-slate-400 outline-none transition-colors',
          error
            ? 'border-red-300 focus:border-red-400 bg-red-50/30'
            : 'border-slate-200 focus:border-primary-300 bg-white',
          !resize && 'resize-none',
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      {!error && hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  )
})

Textarea.displayName = 'Textarea'
export default Textarea
