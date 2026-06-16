import clsx from 'clsx'

/**
 * @param {{
 *   eyebrow?: string,
 *   title: string,
 *   subtitle?: string,
 *   className?: string,
 *   children?: import('react').ReactNode,
 * }} props
 */
const WelcomeBanner = ({ eyebrow = 'Welcome back', title, subtitle, className, children }) => (
  <div
    className={clsx(
      'relative overflow-hidden rounded-xl border border-primary-200/70',
      'bg-gradient-to-br from-primary-50 via-primary-100 to-primary-200/90',
      'px-6 py-6 sm:px-7 sm:py-7 min-h-[8.5rem] shadow-soft',
      className
    )}
  >
    <div className="absolute inset-0 pointer-events-none" aria-hidden>
      <div className="absolute -top-8 right-0 w-40 h-40 rounded-full bg-white/60 blur-2xl" />
      <div className="absolute bottom-0 left-1/4 w-32 h-32 rounded-full bg-primary-300/30 blur-2xl" />
      <div className="absolute inset-0 bg-gradient-to-tr from-white/25 via-transparent to-primary-300/10" />
    </div>
    <div className="relative z-10 space-y-2">
      {eyebrow && (
        <p className="text-xs font-bold uppercase tracking-wider text-primary-600/90">{eyebrow}</p>
      )}
      <h1 className="text-xl sm:text-2xl font-bold text-primary-900">{title}</h1>
      {subtitle && (
        <p className="text-sm font-medium text-primary-800/85 leading-relaxed max-w-lg">{subtitle}</p>
      )}
      {children}
    </div>
  </div>
)

export default WelcomeBanner
