import clsx from 'clsx'

/**
 * Page content wrapper — plain layout shell (no animated background).
 */
const PageAmbient = ({ children, className }) => (
  <div className={clsx('relative z-[1]', className)}>{children}</div>
)

export default PageAmbient
