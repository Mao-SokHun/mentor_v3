import { useState } from 'react'
import { Save } from 'lucide-react'
import Button from '../../components/ui/Button'
import Avatar from '../../components/ui/Avatar'
import { PageScaffold, PageCard, TabBar } from '@/components'
import { useAuth } from '@/hooks'

const AdminSettings = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')

  return (
    <PageScaffold title="Settings" subtitle="Manage your admin account and platform settings">
      <TabBar
        tabs={[
          { id: 'profile', label: 'Profile' },
          { id: 'platform', label: 'Platform' },
        ]}
        active={activeTab}
        onChange={setActiveTab}
      />

      {activeTab === 'profile' && (
        <div className="grid lg:grid-cols-3 gap-5">
          <PageCard className="lg:col-span-2">
            <h2 className="font-bold text-slate-800 mb-5">Profile Information</h2>
            <div className="flex items-center gap-5">
              <Avatar name={user?.name || 'Admin'} size="lg" />
              <div>
                <p className="font-bold text-slate-800">{user?.name || '—'}</p>
                <p className="text-sm text-slate-400">{user?.email || '—'}</p>
              </div>
            </div>
          </PageCard>

          <div className="space-y-4">
            <PageCard className="bg-gradient-to-br from-rose-50 to-red-50 border-red-100">
              <h3 className="font-bold text-red-700 text-sm mb-2">Danger Zone</h3>
              <p className="text-xs text-red-400 mb-3">These actions cannot be undone.</p>
              <Button variant="danger" size="sm">Delete Account</Button>
            </PageCard>
          </div>
        </div>
      )}

      {activeTab === 'platform' && (
        <PageCard className="max-w-2xl">
          <h3 className="font-bold text-slate-800 text-sm mb-4">Platform Info</h3>
          <div className="space-y-3">
            {[
              { label: 'Platform Name', value: '' },
              { label: 'Domain', value: '' },
              { label: 'Version', value: '' },
              { label: 'Region', value: '' },
            ].map((f) => (
              <div key={f.label}>
                <label className="block text-xs font-bold text-slate-700 mb-1">{f.label}</label>
                <input defaultValue={f.value} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-primary-300" />
              </div>
            ))}
          </div>
          <div className="pt-4"><Button variant="primary" size="sm"><Save className="w-4 h-4" />Save</Button></div>
        </PageCard>
      )}
    </PageScaffold>
  )
}

export default AdminSettings
