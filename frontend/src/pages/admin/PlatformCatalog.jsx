import { useEffect, useState } from 'react'
import { Tags, MapPin } from 'lucide-react'
import { PageScaffold, PageCard, StatMetric, TabBar, DataTable } from '@/components'
import EmptyState from '../../components/ui/EmptyState'
import { fetchAdminCatalog } from '@/services/admin/adminApi'
import { skillRowLabel } from '@/services/mentors/mentorService'
import { provinceRowLabel } from '@/utils/provinceOptions'
import { useTranslation } from '@/i18n'

const PlatformCatalog = () => {
  const { t, lang } = useTranslation()
  const [activeTab, setActiveTab] = useState('skills')
  const [catalog, setCatalog] = useState({ skills: [], provinces: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetchAdminCatalog()
      .then((data) => {
        if (!cancelled) setCatalog(data)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const skillRows = catalog.skills.flatMap((skill) => {
    const subs = skill.SubSkills ?? skill.subSkills ?? skill.sub_skills ?? []
    if (!subs.length) {
      return [{
        id: skill.skill_id ?? skill.id,
        major: skillRowLabel(skill, lang),
        subject: '—',
        subCount: 0,
      }]
    }
    return subs.map((sub) => ({
      id: `${skill.skill_id ?? skill.id}-${sub.sub_skill_id ?? sub.id}`,
      major: skillRowLabel(skill, lang),
      subject: skillRowLabel(sub, lang),
      subCount: subs.length,
    }))
  })

  const provinceRows = catalog.provinces.map((p) => ({
    id: p.province_id ?? p.id,
    name: provinceRowLabel(p, lang),
    code: p.province_code ?? p.code ?? '—',
  }))

  const skillColumns = [
    { key: 'major', label: t('adminCatalog.colMajor') },
    { key: 'subject', label: t('adminCatalog.colSubject') },
  ]

  const provinceColumns = [
    { key: 'name', label: t('adminCatalog.colProvince') },
    { key: 'code', label: t('adminCatalog.colCode'), render: (row) => (
      <span className="font-mono text-xs text-slate-500">{row.code}</span>
    ) },
  ]

  const subSkillTotal = catalog.skills.reduce(
    (sum, s) => sum + (s.SubSkills ?? s.subSkills ?? s.sub_skills ?? []).length,
    0
  )

  return (
    <PageScaffold
      title={t('admin.catalog')}
      subtitle={t('adminCatalog.subtitle')}
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatMetric
          label={t('adminCatalog.majors')}
          value={loading ? '…' : String(catalog.skills.length)}
          icon={Tags}
          tone="primary"
        />
        <StatMetric
          label={t('adminCatalog.subjects')}
          value={loading ? '…' : String(subSkillTotal)}
          tone="success"
        />
        <StatMetric
          label={t('adminCatalog.provinces')}
          value={loading ? '…' : String(catalog.provinces.length)}
          icon={MapPin}
          tone="warning"
        />
      </div>

      <TabBar
        tabs={[
          { id: 'skills', label: t('adminCatalog.tabSkills') },
          { id: 'provinces', label: t('adminCatalog.tabProvinces') },
        ]}
        active={activeTab}
        onChange={setActiveTab}
      />

      <PageCard padding={false}>
        {loading ? (
          <EmptyState size="sm" title={t('adminCatalog.loading')} className="py-12" />
        ) : activeTab === 'skills' ? (
          <DataTable
            columns={skillColumns}
            rows={skillRows}
            emptyMessage={t('adminCatalog.emptySkills')}
          />
        ) : (
          <DataTable
            columns={provinceColumns}
            rows={provinceRows}
            emptyMessage={t('adminCatalog.emptyProvinces')}
          />
        )}
      </PageCard>

      <p className="text-xs text-slate-400">{t('adminCatalog.readOnlyHint')}</p>
    </PageScaffold>
  )
}

export default PlatformCatalog
