import { useState } from 'react'
import {
  Activity, AlertCircle, CheckCircle, Clock, Download, RefreshCw,
  Server, Zap, ShieldAlert, BarChart3,
} from 'lucide-react'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import { PageCard } from '@/components'
import clsx from 'clsx'
import { useTranslation } from '@/i18n'

const activityLog = []

const typeConfig = {
  info: { badge: 'info', icon: Activity, row: 'hover:bg-slate-50/80' },
  success: { badge: 'success', icon: CheckCircle, row: 'hover:bg-emerald-50/40' },
  warning: { badge: 'warning', icon: AlertCircle, row: 'hover:bg-amber-50/40' },
  danger: { badge: 'danger', icon: AlertCircle, row: 'hover:bg-red-50/40' },
}

const FILTER_KEYS = ['all', 'info', 'success', 'warning', 'danger']

const SystemReports = () => {
  const { t } = useTranslation()
  const [filter, setFilter] = useState('all')
  const [refreshing, setRefreshing] = useState(false)

  const refresh = () => {
    setRefreshing(true)
    setTimeout(() => setRefreshing(false), 1200)
  }

  const filtered = activityLog.filter((a) => filter === 'all' || a.type === filter)

  const metrics = [
    { key: 'events', label: t('adminReports.eventsToday'), value: '—', icon: Activity },
    { key: 'uptime', label: t('adminReports.apiUptime'), value: '—', icon: Server },
    { key: 'latency', label: t('adminReports.avgLatency'), value: '—', icon: Zap },
    { key: 'errors', label: t('adminReports.errors24h'), value: '—', icon: ShieldAlert },
  ]

  return (
    <div className="admin-dashboard admin-reports">
      <header className="admin-dash-header">
        <div className="min-w-0">
          <p className="admin-dash-greeting">{t('adminReports.title')}</p>
          <p className="admin-dash-subtitle">{t('adminReports.subtitle')}</p>
        </div>
        <div className="admin-reports-actions">
          <Button variant="ghost" size="sm" onClick={refresh} disabled={refreshing}>
            <RefreshCw className={clsx('w-4 h-4', refreshing && 'animate-spin')} />
            {t('adminReports.refresh')}
          </Button>
          <Button variant="outline" size="sm" disabled>
            <Download className="w-4 h-4" />
            {t('adminReports.export')}
          </Button>
        </div>
      </header>

      <section className="admin-dash-metrics" aria-label={t('adminReports.summary')}>
        {metrics.map((metric) => (
          <article key={metric.key} className="admin-metric-card">
            <div className="admin-metric-card__icon">
              <metric.icon className="w-[1.125rem] h-[1.125rem]" strokeWidth={1.75} />
            </div>
            <div className="min-w-0">
              <p className="admin-metric-card__value">{metric.value}</p>
              <p className="admin-metric-card__label">{metric.label}</p>
            </div>
          </article>
        ))}
      </section>

      <div className="admin-reports-grid">
        <PageCard padding className="admin-reports-card">
          <div className="flex items-start gap-3 mb-4">
            <div className="admin-metric-card__icon">
              <Server className="w-[1.125rem] h-[1.125rem]" strokeWidth={1.75} />
            </div>
            <div>
              <h2 className="admin-dash-panel__title">{t('adminReports.systemHealth')}</h2>
              <p className="admin-dash-panel__desc">{t('adminReports.systemHealthDesc')}</p>
            </div>
          </div>
          <div className="admin-dash-empty admin-dash-empty--compact">
            <p className="admin-dash-empty__title">{t('adminReports.healthUnavailable')}</p>
            <p className="admin-dash-empty__hint">{t('adminReports.healthHint')}</p>
          </div>
        </PageCard>

        <PageCard padding className="admin-reports-card">
          <div className="flex items-start gap-3 mb-4">
            <div className="admin-metric-card__icon">
              <BarChart3 className="w-[1.125rem] h-[1.125rem]" strokeWidth={1.75} />
            </div>
            <div>
              <h2 className="admin-dash-panel__title">{t('adminReports.performance')}</h2>
              <p className="admin-dash-panel__desc">{t('adminReports.performanceDesc')}</p>
            </div>
          </div>
          <div className="admin-dash-empty admin-dash-empty--compact">
            <p className="admin-dash-empty__title">{t('adminReports.noPerformance')}</p>
            <p className="admin-dash-empty__hint">{t('adminReports.performanceHint')}</p>
          </div>
        </PageCard>
      </div>

      <PageCard padding={false} className="admin-dash-panel overflow-hidden">
        <div className="admin-dash-panel__head flex-wrap gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <Activity className="w-4 h-4 text-primary-500 flex-shrink-0" />
            <div>
              <h2 className="admin-dash-panel__title">{t('adminReports.eventLog')}</h2>
              <p className="admin-dash-panel__desc">{t('adminReports.eventLogDesc')}</p>
            </div>
          </div>
          <div className="admin-reports-filters">
            {FILTER_KEYS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={clsx(
                  'admin-reports-filter',
                  filter === f && 'admin-reports-filter--active'
                )}
              >
                {t(`adminReports.filter.${f}`)}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="admin-dash-empty">
            <p className="admin-dash-empty__title">{t('adminReports.noEvents')}</p>
            <p className="admin-dash-empty__hint">{t('adminReports.noEventsHint')}</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((item) => {
              const cfg = typeConfig[item.type] ?? typeConfig.info
              const Icon = cfg.icon
              return (
                <div
                  key={item.id}
                  className={clsx('flex items-start gap-3 px-5 py-4 transition-colors', cfg.row)}
                >
                  <Icon className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <p className="text-sm font-medium text-slate-800">{item.event}</p>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {item.time}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{item.user}</p>
                  </div>
                  <Badge variant={cfg.badge} size="sm">
                    {item.type}
                  </Badge>
                </div>
              )
            })}
          </div>
        )}
      </PageCard>

      <p className="admin-reports-footnote">{t('adminReports.backendHint')}</p>
    </div>
  )
}

export default SystemReports
