import clsx from 'clsx'

/**
 * EmptyState
 * Props:
 *   icon       ReactNode  — Lucide icon component instance
 *   title      string
 *   description string
 *   action     ReactNode  — optional button/link
 *   size       'sm' | 'md' | 'lg' (default 'md')
 *   className  string
 */
const EmptyState = ({ icon, title, description, action, size = 'md', className }) => {
  const pad = { sm: 'py-8', md: 'py-12', lg: 'py-20' }
  const iconSize = { sm: 'w-8 h-8', md: 'w-10 h-10', lg: 'w-14 h-14' }
  const wrap = { sm: 'w-14 h-14', md: 'w-16 h-16', lg: 'w-20 h-20' }

  return (
    <div className={clsx('flex flex-col items-center justify-center text-center', pad[size], className)}>
      {icon && (
        <div className={clsx('bg-slate-100 rounded-2xl flex items-center justify-center mb-4', wrap[size])}>
          <span className={clsx('text-slate-300', iconSize[size])}>
            {icon}
          </span>
        </div>
      )}
      {title && (
        <p className="font-bold text-slate-800 text-sm mb-1">{title}</p>
      )}
      {description && (
        <p className="text-sm text-slate-600 max-w-xs">{description}</p>
      )}
      {action && (
        <div className="mt-4">{action}</div>
      )}
    </div>
  )
}

export default EmptyState
