import { useState } from 'react'
import { Download, CreditCard } from 'lucide-react'
import Button from '../../components/ui/Button'
import { PageScaffold, PageCard, TabBar, DataTable } from '@/components'
import EmptyState from '../../components/ui/EmptyState'
import { useAdminPlans } from '@/hooks'
import { useTranslation } from '@/i18n'

const transactions = []

const txColumns = [
  { key: 'id', label: 'Transaction ID', render: (row) => <span className="font-mono text-xs text-slate-500">{row.id}</span> },
  { key: 'date', label: 'Date', render: (row) => <span className="text-xs text-slate-500">{row.date}</span> },
  { key: 'desc', label: 'Description' },
  { key: 'amount', label: 'Amount', render: (row) => <span className="font-semibold">{row.amount}</span> },
  { key: 'status', label: 'Status', render: (row) => <span className="text-xs text-slate-500">{row.status}</span> },
]

const Billing = () => {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('plans')
  const { plans, loading } = useAdminPlans()

  const featured = plans[0]

  return (
    <PageScaffold title={t('admin.billing')} subtitle={t('adminBilling.subtitle')}>
      <PageCard variant="brand" className="text-white">
        <p className="text-white/85 text-xs font-medium mb-0.5">{t('adminBilling.currentPlan')}</p>
        <h2 className="text-xl font-black text-white">
          {loading ? '…' : (featured?.name ?? featured?.plan_name ?? '—')}
        </h2>
        <p className="text-white/90 text-sm mt-1">
          {plans.length > 0
            ? t('adminBilling.plansAvailable', { count: plans.length })
            : t('adminBilling.noPlansHint')}
        </p>
      </PageCard>

      <TabBar
        tabs={[
          { id: 'plans', label: t('adminBilling.tabPlans') },
          { id: 'payment', label: t('adminBilling.tabPayment') },
          { id: 'transactions', label: t('adminBilling.tabTransactions') },
        ]}
        active={activeTab}
        onChange={setActiveTab}
      />

      {activeTab === 'plans' && (
        <PageCard>
          {loading ? (
            <EmptyState size="sm" title={t('adminBilling.loadingPlans')} />
          ) : plans.length === 0 ? (
            <EmptyState
              title={t('adminBilling.noPlans')}
              description={t('adminBilling.noPlansDesc')}
            />
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {plans.map((plan) => {
                const id = plan.subscription_plan_id ?? plan.id
                const name = plan.name ?? plan.plan_name ?? 'Plan'
                const price = plan.price ?? plan.amount
                return (
                  <div key={id} className="rounded-xl border border-slate-100 p-4 bg-slate-50/50">
                    <p className="font-bold text-slate-800">{name}</p>
                    <p className="text-lg font-black text-primary-600 mt-1 tabular-nums">
                      {price != null ? `$${price}` : '—'}
                    </p>
                    {plan.description && (
                      <p className="text-xs text-slate-500 mt-2 leading-relaxed">{plan.description}</p>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </PageCard>
      )}

      {activeTab === 'payment' && (
        <PageCard>
          <EmptyState
            icon={<CreditCard className="w-full h-full" />}
            title={t('adminBilling.noPayment')}
            description={t('adminBilling.noPaymentDesc')}
          />
        </PageCard>
      )}

      {activeTab === 'transactions' && (
        <PageCard padding={false}>
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-bold text-slate-800">{t('adminBilling.transactions')}</h2>
            <Button variant="ghost" size="sm" disabled><Download className="w-4 h-4" />{t('adminMentors.export')}</Button>
          </div>
          <DataTable
            columns={txColumns}
            rows={transactions}
            emptyMessage={t('adminBilling.noTransactions')}
          />
        </PageCard>
      )}
    </PageScaffold>
  )
}

export default Billing
