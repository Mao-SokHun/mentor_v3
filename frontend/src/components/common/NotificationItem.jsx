import { ChevronRight } from 'lucide-react'
import clsx from 'clsx'
import Button from '../ui/Button'

const NotificationItem = ({ icon: Icon, iconBg, title, body, time, read, primaryAction, onPrimary, onDismiss }) => (
  <div
    className={clsx(
      'px-5 py-4 border-b border-slate-50 last:border-0 transition-colors',
      !read && 'bg-primary-50/40 border-l-2 border-l-primary-400'
    )}
  >
    <div className="flex gap-3">
      {Icon && (
        <div className={clsx('w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0', iconBg)}>
          <Icon className="w-4 h-4" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <p className={clsx('text-sm font-semibold leading-snug', read ? 'text-slate-600' : 'text-slate-800')}>
            {title}
          </p>
          <span className="text-xs text-slate-400 whitespace-nowrap flex-shrink-0">{time}</span>
        </div>
        {body && <p className="text-xs text-slate-500 leading-relaxed">{body}</p>}
        <div className="flex flex-wrap gap-2 mt-3">
          {primaryAction && (
            <Button variant="primary" size="sm" onClick={onPrimary} className="!rounded-lg font-semibold">
              {primaryAction}
              <ChevronRight className="w-3 h-3" />
            </Button>
          )}
          {onDismiss && (
            <Button variant="secondary" size="sm" onClick={onDismiss} className="!rounded-lg font-medium text-slate-500">
              Dismiss
            </Button>
          )}
        </div>
      </div>
    </div>
  </div>
)

export default NotificationItem
