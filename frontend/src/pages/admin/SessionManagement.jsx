import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Calendar, ExternalLink } from 'lucide-react'
import Input from '../../components/ui/Input'
import Badge from '../../components/ui/Badge'
import { PageScaffold, PageCard, StatMetric, DataTable } from '@/components'
import EmptyState from '../../components/ui/EmptyState'
import { useAdminSessions } from '@/hooks'
import { useTranslation } from '@/i18n'
import { parsePostScheduleMeta } from '@/utils/mentorPostMapper'

const SessionManagement = () => {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const { sessions, loading } = useAdminSessions({ status: 'published' })

  const rows = useMemo(() => {
    return sessions.map((post) => {
      const meta = parsePostScheduleMeta(post.description ?? '')
      const title = post.title?.trim() || t('adminSessions.untitled')
      return {
        id: post.post_id ?? post.id,
        title,
        mentorId: post.user_id ?? post.userId,
        date: meta.date || '—',
        time: meta.time || '—',
        status: post.status ?? 'published',
      }
    })
  }, [sessions, t])

  const filtered = useMemo(() => {
    if (!search.trim()) return rows
    const q = search.toLowerCase()
    return rows.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.date.toLowerCase().includes(q) ||
        r.time.toLowerCase().includes(q)
    )
  }, [rows, search])

  const columns = [
    {
      key: 'title',
      label: t('adminSessions.colSession'),
      render: (row) => <span className="font-medium text-slate-800">{row.title}</span>,
    },
    {
      key: 'date',
      label: t('adminSessions.colDate'),
      render: (row) => <span className="text-sm text-slate-600">{row.date}</span>,
    },
    {
      key: 'time',
      label: t('adminSessions.colTime'),
      render: (row) => <span className="text-sm text-slate-600">{row.time}</span>,
    },
    {
      key: 'status',
      label: t('adminSessions.colStatus'),
      render: (row) => (
        <Badge variant={row.status === 'published' ? 'success' : 'warning'} size="sm">
          {row.status}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: '',
      className: 'text-right',
      render: (row) => (
        <Link
          to={`/schedule/post/${row.id}`}
          className="inline-flex items-center gap-1 text-xs font-medium text-primary-600 hover:underline"
        >
          {t('adminSessions.view')}
          <ExternalLink className="w-3 h-3" />
        </Link>
      ),
    },
  ]

  return (
    <PageScaffold
      title={t('admin.sessions')}
      subtitle={t('adminSessions.subtitle')}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatMetric
          label={t('adminSessions.published')}
          value={loading ? '…' : String(rows.length)}
          icon={Calendar}
          tone="primary"
        />
        <StatMetric
          label={t('adminSessions.filtered')}
          value={loading ? '…' : String(filtered.length)}
          tone="success"
        />
      </div>

      <PageCard padding={false}>
        <div className="p-4 border-b border-slate-100">
          <Input
            placeholder={t('adminSessions.searchPlaceholder')}
            leftIcon={<Search className="w-4 h-4" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-72"
          />
        </div>

        {loading ? (
          <EmptyState size="sm" title={t('adminSessions.loading')} className="py-12" />
        ) : (
          <DataTable
            columns={columns}
            rows={filtered}
            emptyMessage={t('adminSessions.empty')}
          />
        )}
      </PageCard>
    </PageScaffold>
  )
}

export default SessionManagement
