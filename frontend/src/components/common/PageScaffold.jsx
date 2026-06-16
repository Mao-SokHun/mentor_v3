import clsx from 'clsx'
import PageHeader from './PageHeader'

/** Page shell: title row + content area with consistent spacing */
const PageScaffold = ({ title, subtitle, action, className, children }) => (
  <div className={clsx('space-y-6', className)}>
    {(title || subtitle || action) && (
      <PageHeader title={title} subtitle={subtitle} action={action} />
    )}
    {children}
  </div>
)

export default PageScaffold
