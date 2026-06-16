import clsx from 'clsx'

const TabBar = ({ tabs, active, onChange, className }) => (
  <div className={clsx('flex gap-1 p-1 glass-subtle rounded-xl border border-white/40 overflow-x-auto scrollbar-hide', className)}>
    {tabs.map((tab) => {
      const id = typeof tab === 'string' ? tab : tab.id
      const label = typeof tab === 'string' ? tab : tab.label
      return (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          className={clsx(
            'flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap',
            active === id
              ? 'glass-strong text-primary-600 shadow-sm rounded-lg'
              : 'text-slate-500 hover:text-slate-700'
          )}
        >
          {label}
        </button>
      )
    })}
  </div>
)

export default TabBar
