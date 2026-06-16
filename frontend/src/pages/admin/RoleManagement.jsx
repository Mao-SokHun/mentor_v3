import { useState } from 'react'
import { Plus, Shield } from 'lucide-react'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import { PageScaffold, PageCard } from '@/components'
import Modal from '../../components/ui/Modal'
import EmptyState from '../../components/ui/EmptyState'
import { useAdminUserTypes } from '@/hooks'
import { useTranslation } from '@/i18n'

const permissionLabels = {
  manageUsers: 'Manage Users',
  manageContent: 'Manage Content',
  viewReports: 'View Reports',
  manageRoles: 'Manage Roles',
  systemSettings: 'System Settings',
  billing: 'Billing Access',
}

const RoleManagement = () => {
  const { t } = useTranslation()
  const [showCreate, setShowCreate] = useState(false)
  const { userTypes, loading } = useAdminUserTypes()

  return (
    <PageScaffold
      title={t('admin.roles')}
      subtitle={t('adminRoles.subtitle')}
      action={
        <Button variant="primary" size="sm" onClick={() => setShowCreate(true)}>
          <Plus className="w-4 h-4" />{t('adminRoles.createRole')}
        </Button>
      }
    >
      {loading ? (
        <PageCard>
          <EmptyState size="sm" title={t('adminRoles.loading')} />
        </PageCard>
      ) : userTypes.length === 0 ? (
        <PageCard>
          <EmptyState
            icon={<Shield className="w-full h-full" />}
            title={t('adminRoles.emptyTitle')}
            description={t('adminRoles.emptyDesc')}
          />
        </PageCard>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {userTypes.map((type) => {
            const name = type.user_type_name ?? type.name ?? 'Role'
            const id = type.user_type_id ?? type.id
            const isAdmin = String(name).toLowerCase() === 'admin'
            return (
              <PageCard key={id} padding hover className="!shadow-none">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-bold text-slate-800">{name}</h3>
                  <Badge variant={isAdmin ? 'warning' : 'primary'} size="sm">
                    {isAdmin ? t('adminRoles.systemRole') : t('adminRoles.platformRole')}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {t('adminRoles.roleHint', { role: name })}
                </p>
              </PageCard>
            )
          })}
        </div>
      )}

      <Modal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title={t('adminRoles.createRole')}
        description={t('adminRoles.createDesc')}
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowCreate(false)}>{t('admin.cancel')}</Button>
            <Button variant="primary" onClick={() => setShowCreate(false)} disabled>
              {t('adminRoles.createRole')}
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">{t('adminRoles.roleName')}</label>
            <input className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-primary-300" placeholder="e.g. Marketing Manager" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">{t('adminRoles.description')}</label>
            <textarea className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-primary-300 resize-none" rows={2} placeholder="Describe this role's responsibilities..." />
          </div>
          <div>
            <p className="block text-xs font-bold text-slate-700 mb-2">{t('adminRoles.permissions')}</p>
            <div className="space-y-1 text-sm text-slate-500">
              {Object.values(permissionLabels).map((label) => (
                <p key={label}>{label}</p>
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-2">{t('adminRoles.permissionsHint')}</p>
          </div>
        </div>
      </Modal>
    </PageScaffold>
  )
}

export default RoleManagement
