import clsx from 'clsx'

const variants = {
  primary: 'bg-primary-50 text-primary-700 border border-primary-100',
  success: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
  warning: 'bg-amber-50 text-amber-700 border border-amber-100',
  danger: 'bg-red-50 text-red-700 border border-red-100',
  info: 'bg-sky-50 text-sky-700 border border-sky-100',
  neutral: 'bg-slate-50 text-slate-600 border border-slate-100',
}

const dots = {
  primary: 'bg-primary-400',
  success: 'bg-emerald-400',
  warning: 'bg-amber-400',
  danger: 'bg-red-400',
  info: 'bg-sky-400',
  neutral: 'bg-slate-400',
}

const sizes = {
  sm: 'px-2.5 py-1 text-xs',
  md: 'px-3 py-1 text-xs',
}

const Badge = ({ children, variant = 'primary', size = 'md', dot, className }) => {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 font-medium rounded-full',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {dot && <span className={clsx('w-1.5 h-1.5 rounded-full', dots[variant])} />}
      {children}
    </span>
  )
}

export default Badge
