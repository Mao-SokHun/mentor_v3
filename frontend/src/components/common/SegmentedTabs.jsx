import clsx from 'clsx'

/**
 * SegmentedTabs  (pill-style tabs / segmented control)
 * The universal `bg-slate-100 p-1 rounded-xl` tab switcher used across the whole app.
 *
 * Props:
 *   tabs       Array<{ id: string, label: string, icon?: ReactNode, count?: number }>
 *   active     string  — id of active tab
 *   onChange   (id: string) => void
 *   size       'sm' | 'md' (default 'md')
 *   fullWidth  boolean — tabs expand to fill width (default false)
 *   className  string
 */
const SegmentedTabs = ({ tabs = [], active, onChange, size = 'md', fullWidth = false, className }) => {
  const isSmall = size === 'sm'

  return (
    <div className={clsx(
      'flex gap-1 bg-slate-100 p-1 rounded-xl',
      fullWidth && 'w-full',
      className
    )}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange?.(tab.id)}
          className={clsx(
            'flex items-center gap-1.5 rounded-lg font-medium capitalize transition-all whitespace-nowrap',
            isSmall ? 'px-2.5 py-1 text-xs' : 'px-4 py-2 text-sm',
            fullWidth && 'flex-1 justify-center',
            active === tab.id
              ? 'bg-white text-slate-800 shadow'
              : 'text-slate-500 hover:text-slate-700'
          )}
        >
          {tab.icon && <span className="flex-shrink-0">{tab.icon}</span>}
          {tab.label}
          {tab.count !== undefined && (
            <span className={clsx(
              'px-1.5 py-0.5 rounded-full text-xs',
              active === tab.id
                ? 'bg-primary-100 text-primary-700'
                : 'bg-slate-200 text-slate-500'
            )}>
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}

export default SegmentedTabs
