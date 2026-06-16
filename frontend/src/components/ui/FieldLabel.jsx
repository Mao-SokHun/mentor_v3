import clsx from 'clsx'

/** Label with optional required (*) or optional hint */
export default function FieldLabel({
  htmlFor,
  label,
  required = false,
  optional = false,
  optionalText = 'Optional',
  className,
}) {
  if (!label) return null

  return (
    <label
      htmlFor={htmlFor}
      className={clsx('block text-base font-semibold text-slate-700 mb-2', className)}
    >
      {label}
      {required && (
        <span className="text-red-500 ml-0.5 font-bold" aria-hidden="true">
          *
        </span>
      )}
      {optional && (
        <span className="text-slate-400 font-normal ml-1.5 text-sm">({optionalText})</span>
      )}
    </label>
  )
}
