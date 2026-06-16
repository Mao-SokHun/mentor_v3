import clsx from 'clsx'

/**
 * @param {{ tabs: string[], active: string, onChange: (tab: string) => void, className?: string, spread?: boolean }} props
 * spread — distribute tabs across the bar (community category filter)
 */
const SubjectTabs = ({ tabs, active, onChange, className, spread = false }) => (
  <div
    className={clsx(
      'flex w-full items-center',
      spread
        ? 'flex-wrap justify-between gap-x-1.5 gap-y-1.5 py-0 sm:flex-nowrap sm:gap-x-1'
        : 'gap-2.5 sm:gap-3 overflow-x-auto scrollbar-hide py-1',
      className
    )}
  >
    {tabs.map((tab) => (
      <button
        key={tab}
        type="button"
        onClick={() => onChange(tab)}
        className={clsx(
          'flex-shrink-0 rounded-full font-semibold whitespace-nowrap transition-all',
          spread
            ? 'px-2 py-0.5 text-[11px] tracking-wide sm:px-2.5 sm:py-1 sm:text-xs'
            : 'px-4 py-2 text-xs tracking-wide sm:text-sm',
          active === tab
            ? 'bg-primary-500 text-white shadow-sm'
            : 'glass-subtle border border-white/50 text-slate-600 hover:border-primary-200 hover:text-primary-600'
        )}
      >
        {tab}
      </button>
    ))}
  </div>
)

export default SubjectTabs
