import clsx from 'clsx'

const PageHeader = ({ title, subtitle, action, className }) => (
  <div className={clsx('flex items-start justify-between gap-4 flex-wrap mb-1', className)}>
    <div className="min-w-0">
      {title && <h1 className="admin-page-title">{title}</h1>}
      {subtitle && <p className="text-sm text-slate-500 mt-1.5 max-w-2xl leading-relaxed">{subtitle}</p>}
    </div>
    {action && <div className="flex-shrink-0">{action}</div>}
  </div>
)

export default PageHeader
