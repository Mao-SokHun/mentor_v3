import clsx from 'clsx'

/** Full-screen pages outside AppLayout (book session, session review, etc.) */
const StandalonePageShell = ({ children, className }) => (
  <div
    className={clsx('min-h-screen min-h-dvh app-glass-scope glass-ios-26-shell relative bg-slate-50', className)}
    data-role="student"
  >
    <div className="relative z-[1]">{children}</div>
  </div>
)

export default StandalonePageShell
