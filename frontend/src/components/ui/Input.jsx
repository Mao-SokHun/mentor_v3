import { forwardRef } from 'react'
import clsx from 'clsx'
import FieldLabel from './FieldLabel'
import { FORM_FINE_PRINT_CLASS } from '../common/RequiredFieldsHint'

const Input = forwardRef(
  (
    {
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      className,
      variant = 'default',
      required,
      optional,
      optionalLabel,
      id,
      ...props
    },
    ref
  ) => {
  const isGlass = variant === 'glass'

  return (
    <div className="w-full">
      <FieldLabel
        htmlFor={id}
        label={label}
        required={required}
        optional={optional}
        optionalText={optionalLabel}
      />
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          id={id}
          required={required}
          className={clsx(
            'w-full rounded-xl px-4 transition-all duration-200 focus:outline-none',
            isGlass ? 'py-2.5 text-base' : 'py-2.5 text-sm',
            'text-slate-800 placeholder-slate-400',
            isGlass
              ? clsx(
                  'auth-field-input border bg-white/90',
                  error
                    ? 'border-red-400 focus:border-red-400 focus:ring-2 focus:ring-red-200/50'
                    : 'border-slate-200 hover:border-slate-300 focus:border-primary-300 focus:ring-2 focus:ring-primary-200/40'
                )
              : clsx(
                  'border bg-white focus:ring-2',
                  error
                    ? 'border-red-400 focus:border-red-400 focus:ring-red-200/50'
                    : 'border-slate-200 hover:border-slate-300 focus:border-primary-300 focus:ring-primary-200/40'
                ),
            leftIcon && 'pl-10',
            rightIcon && 'pr-10',
            className
          )}
          {...props}
        />
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400">
            {rightIcon}
          </div>
        )}
      </div>
      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
      {hint && !error && (
        <p className={clsx('mt-1', FORM_FINE_PRINT_CLASS)}>{hint}</p>
      )}
    </div>
  )
}
)

Input.displayName = 'Input'
export default Input
