import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, BookOpen, Hash, FileText, Image, ExternalLink } from 'lucide-react'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Badge from '../../components/ui/Badge'
import { PageScaffold, PageCard, StatMetric, TabBar, DataTable } from '@/components'
import EmptyState from '../../components/ui/EmptyState'
import { useAdminOverview, useAdminSessions } from '@/hooks'
import { useTranslation } from '@/i18n'
import { parsePostScheduleMeta } from '@/utils/mentorPostMapper'

const ContentManagement = () => {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('posts')
  const { overview, loading: statsLoading } = useAdminOverview()
  const { sessions, loading: postsLoading } = useAdminSessions({ status: 'published' })

  const communities = []

  const recentPosts = useMemo(
    () =>
      sessions.map((post) => {
        const meta = parsePostScheduleMeta(post.description ?? '')
        return {
          id: post.post_id ?? post.id,
          post: post.title?.trim() || t('adminSessions.untitled'),
          time: [meta.date, meta.time].filter(Boolean).join(' · ') || '—',
          status: post.status ?? 'published',
        }
      }),
    [sessions, t]
  )

  const filteredPosts = recentPosts.filter((p) =>
    p.post.toLowerCase().includes(search.toLowerCase())
  )

  const contentStats = [
    { label: t('adminContent.communities'), value: statsLoading ? '…' : '—', icon: Hash, tone: 'primary' },
    { label: t('adminContent.posts'), value: postsLoading ? '…' : String(recentPosts.length), icon: FileText, tone: 'success' },
    { label: t('adminContent.teachers'), value: statsLoading ? '…' : (overview?.teachers != null ? String(overview.teachers) : '—'), icon: BookOpen, tone: 'primary' },
    { label: t('adminContent.media'), value: '—', icon: Image, tone: 'warning' },
  ]

  const postColumns = [
    { key: 'post', label: t('adminContent.colPost') },
    { key: 'time', label: t('adminContent.colTime') },
    {
      key: 'status',
      label: t('adminContent.colStatus'),
      render: (row) => (
        <Badge variant={row.status === 'published' ? 'success' : 'warning'} size="sm">
          {row.status}
        </Badge>
      ),
    },
    {
      key: 'view',
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
      title={t('admin.content')}
      subtitle={t('adminContent.subtitle')}
      action={
        <Button variant="primary" size="sm" disabled>
          <Plus className="w-4 h-4" />{t('adminContent.createCommunity')}
        </Button>
      }
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {contentStats.map((s) => (
          <StatMetric key={s.label} label={s.label} value={s.value} change="" icon={s.icon} tone={s.tone} />
        ))}
      </div>

      <TabBar
        tabs={[
          { id: 'communities', label: t('adminContent.tabCommunities') },
          { id: 'posts', label: t('adminContent.tabPosts') },
          { id: 'media', label: t('adminContent.tabMedia') },
        ]}
        active={activeTab}
        onChange={setActiveTab}
      />

      {activeTab === 'communities' && (
        <PageCard padding={false}>
          <div className="p-4 border-b border-slate-100">
            <Input placeholder={t('adminContent.searchCommunities')} leftIcon={<Search className="w-4 h-4" />} value={search} onChange={(e) => setSearch(e.target.value)} className="w-56" />
          </div>
          <EmptyState
            title={t('adminContent.noCommunities')}
            description={t('adminContent.noCommunitiesDesc')}
            className="py-12"
          />
        </PageCard>
      )}

      {activeTab === 'posts' && (
        <PageCard padding={false}>
          <div className="p-4 border-b border-slate-100 flex flex-wrap gap-3 items-center justify-between">
            <Input placeholder={t('adminContent.searchPosts')} leftIcon={<Search className="w-4 h-4" />} value={search} onChange={(e) => setSearch(e.target.value)} className="w-56" />
            <Link to="/admin/sessions" className="text-xs font-medium text-primary-600 hover:underline">
              {t('adminContent.manageSessions')}
            </Link>
          </div>
          {postsLoading ? (
            <EmptyState size="sm" title={t('adminSessions.loading')} className="py-12" />
          ) : (
            <DataTable
              columns={postColumns}
              rows={filteredPosts}
              emptyMessage={t('adminContent.noPosts')}
            />
          )}
        </PageCard>
      )}

      {activeTab === 'media' && (
        <PageCard>
          <EmptyState
            icon={<Image className="w-full h-full" />}
            title={t('adminContent.noMedia')}
            description={t('adminContent.noMediaDesc')}
          />
        </PageCard>
      )}
    </PageScaffold>
  )
}

export default ContentManagement
