import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, ExternalLink, GraduationCap, Download } from 'lucide-react'
import Avatar from '../../components/ui/Avatar'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { PageScaffold, PageCard, StatMetric, DataTable } from '@/components'
import EmptyState from '../../components/ui/EmptyState'
import { useAdminMentors } from '@/hooks'
import { useTranslation } from '@/i18n'

const PAGE_SIZE = 10

const MentorManagement = () => {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const { items, total, loading, setFilters } = useAdminMentors({
    page: 1,
    pageSize: PAGE_SIZE,
  })

  useEffect(() => {
    setFilters({
      page,
      pageSize: PAGE_SIZE,
      q: search.trim() || undefined,
    })
  }, [page, search, setFilters])

  const filtered = useMemo(() => {
    if (!search.trim()) return items
    const q = search.toLowerCase()
    return items.filter(
      (m) =>
        m.name?.toLowerCase().includes(q) ||
        m.location?.toLowerCase().includes(q) ||
        m.subject?.toLowerCase().includes(q)
    )
  }, [items, search])

  const columns = [
    {
      key: 'mentor',
      label: t('adminMentors.colTeacher'),
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar name={row.name} src={row.avatarUrl} size="sm" />
          <div className="min-w-0">
            <p className="font-semibold text-slate-800 truncate">{row.name}</p>
            <p className="text-xs text-slate-400 truncate">{row.location || '—'}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'subject',
      label: t('adminMentors.colSubject'),
      render: (row) => (
        <span className="text-sm text-slate-600 truncate block max-w-[10rem]">
          {row.subject || row.major || '—'}
        </span>
      ),
    },
    {
      key: 'rating',
      label: t('adminMentors.colRating'),
      render: (row) => (
        <span className="font-semibold tabular-nums">{row.rating ? row.rating.toFixed(1) : '—'}</span>
      ),
    },
    {
      key: 'status',
      label: t('adminMentors.colStatus'),
      render: (row) => (
        <Badge variant={row.verified ? 'success' : 'neutral'} size="sm" dot>
          {row.verified ? t('adminMentors.verified') : t('adminMentors.unverified')}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: '',
      className: 'text-right',
      render: (row) => (
        <Link
          to={`/mentor/${row.userId ?? row.id}`}
          className="inline-flex items-center gap-1 text-xs font-medium text-primary-600 hover:underline"
        >
          {t('adminMentors.viewProfile')}
          <ExternalLink className="w-3 h-3" />
        </Link>
      ),
    },
  ]

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <PageScaffold
      title={t('admin.mentors')}
      subtitle={t('adminMentors.subtitle')}
      action={
        <Button variant="outline" size="sm" disabled>
          <Download className="w-4 h-4" />
          {t('adminMentors.export')}
        </Button>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatMetric
          label={t('adminMentors.totalTeachers')}
          value={loading ? '…' : String(total)}
          icon={GraduationCap}
          tone="primary"
        />
        <StatMetric
          label={t('adminMentors.verifiedTeachers')}
          value={loading ? '…' : String(items.filter((m) => m.verified).length)}
          tone="success"
        />
        <StatMetric
          label={t('adminMentors.onThisPage')}
          value={loading ? '…' : String(filtered.length)}
          tone="warning"
        />
      </div>

      <PageCard padding={false}>
        <div className="p-4 border-b border-slate-100 flex flex-wrap gap-3 items-center justify-between">
          <Input
            placeholder={t('adminMentors.searchPlaceholder')}
            leftIcon={<Search className="w-4 h-4" />}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="w-full sm:w-72"
          />
          <p className="text-xs text-slate-400">{t('adminMentors.totalCount', { count: total })}</p>
        </div>

        {loading ? (
          <EmptyState size="sm" title={t('filters.loadingMentors')} className="py-12" />
        ) : (
          <DataTable
            columns={columns}
            rows={filtered}
            emptyMessage={t('adminMentors.empty')}
          />
        )}

        {pageCount > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="text-sm text-slate-600 disabled:opacity-40"
            >
              {t('adminMentors.prev')}
            </button>
            <span className="text-xs text-slate-400">
              {t('adminMentors.pageOf', { page, total: pageCount })}
            </span>
            <button
              type="button"
              disabled={page >= pageCount}
              onClick={() => setPage((p) => p + 1)}
              className="text-sm text-slate-600 disabled:opacity-40"
            >
              {t('adminMentors.next')}
            </button>
          </div>
        )}
      </PageCard>
    </PageScaffold>
  )
}

export default MentorManagement
