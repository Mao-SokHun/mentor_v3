import { Link } from 'react-router-dom'
import { Users, BookOpen, Calendar, DollarSign, ArrowUpRight } from 'lucide-react'
import { PageCard } from '@/components'
import { useTranslation } from '@/i18n'
import { useAdminOverview } from '@/hooks'
import { useAuth } from '@/hooks'

const fmt = (v) => (v == null ? '—' : String(v))

const AdminDashboard = () => {
  const { t } = useTranslation()
  const { user } = useAuth()
  const { overview, loading } = useAdminOverview()

  const displayName = user?.name?.trim() || t('admin.superAdmin')

  const metrics = [
    {
      key: 'students',
      label: t('adminDash.totalStudents'),
      value: loading ? '…' : fmt(overview?.students),
      icon: Users,
    },
    {
      key: 'teachers',
      label: t('adminDash.activeTeachers'),
      value: loading ? '…' : fmt(overview?.teachers),
      icon: BookOpen,
    },
    {
      key: 'sessions',
      label: t('adminDash.publishedSessions'),
      value: loading ? '…' : fmt(overview?.sessions),
      icon: Calendar,
    },
    {
      key: 'revenue',
      label: t('adminDash.monthlyRevenue'),
      value: loading ? '…' : fmt(overview?.revenue),
      icon: DollarSign,
    },
  ]

  const shortcuts = [
    { href: '/admin/users', label: t('admin.userManagement') },
    { href: '/admin/content', label: t('admin.content') },
    { href: '/admin/reports', label: t('admin.reports') },
  ]

  return (
    <div className="admin-dashboard">
      <header className="admin-dash-header">
        <div className="min-w-0">
          <p className="admin-dash-greeting">{t('adminDash.helloName', { name: displayName })}</p>
          <p className="admin-dash-subtitle">{t('adminDash.subtitle')}</p>
        </div>
        <div className="admin-dash-shortcuts">
          {shortcuts.map((item) => (
            <Link key={item.href} to={item.href} className="admin-dash-shortcut">
              {item.label}
              <ArrowUpRight className="w-3.5 h-3.5 opacity-50" />
            </Link>
          ))}
        </div>
      </header>

      <section className="admin-dash-metrics" aria-label={t('adminDash.keyMetrics')}>
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

      <PageCard padding={false} className="admin-dash-panel overflow-hidden">
        <div className="admin-dash-panel__head">
          <div>
            <h2 className="admin-dash-panel__title">{t('adminDash.recentActivity')}</h2>
            <p className="admin-dash-panel__desc">{t('adminDash.noActivityDesc')}</p>
          </div>
          <Link to="/admin/reports" className="admin-dash-panel__link">
            {t('adminDash.viewAll')}
          </Link>
        </div>
        <div className="admin-dash-empty">
          <p className="admin-dash-empty__title">{t('adminDash.noActivity')}</p>
          <p className="admin-dash-empty__hint">{t('adminDash.activityHint')}</p>
        </div>
      </PageCard>
    </div>
  )
}

export default AdminDashboard
