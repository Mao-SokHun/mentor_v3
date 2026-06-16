import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  Lock,
  CreditCard,
  ArrowLeft,
  Crown,
  Calendar,
  Download,
  Eye,
  X,
  FileText,
} from 'lucide-react'
import {
  PageScaffold,
  PageCard,
  PageAmbient,
  DataTable,
} from '@/components'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import { useMentorSubscription, useSubscriptionPlans } from '@/hooks'
import { useTranslation } from '@/i18n'
import { createCheckoutSession } from '@/services/platform/subscriptionService'
import {
  formatBillingDate,
  downloadInvoice,
  getStatusLabel,
} from '../../utils/mentorSubscription'
import { formatPlanPrice, isPaidPlan } from '../../utils/subscriptionPlans'

const MentorBilling = () => {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const {
    subscription,
    hasSubscription,
    loading: subscriptionLoading,
    error: subscriptionError,
    refresh,
  } = useMentorSubscription()

  const {
    paidPlans,
    loading: plansLoading,
    error: plansError,
    getPlanById,
  } = useSubscriptionPlans()

  const [loading, setLoading] = useState(false)
  const [actionError, setActionError] = useState(null)
  const [viewInvoice, setViewInvoice] = useState(null)

  const selectedPlan =
    getPlanById(searchParams.get('plan')) ??
    paidPlans.find(isPaidPlan) ??
    null

  const checkoutTotal = selectedPlan ? Number(selectedPlan.price) : 0

  const handleStripeCheckout = async () => {
    if (!selectedPlan?.subscription_Plan_id) {
      setActionError('No subscription plan selected. Go back and choose a plan.')
      return
    }

    setLoading(true)
    setActionError(null)
    try {
      const { url } = await createCheckoutSession({
        subscriptionPlanId: selectedPlan.subscription_Plan_id,
      })
      if (!url) throw new Error('Stripe did not return a checkout URL')
      window.location.href = url
    } catch (err) {
      setActionError(err?.message || 'Could not start Stripe checkout')
      setLoading(false)
    }
  }

  const invoiceColumns = [
    {
      key: 'id',
      label: t('billing.invoice'),
      render: (row) => <span className="font-mono text-xs font-semibold text-slate-700">{row.id}</span>,
    },
    {
      key: 'date',
      label: t('billing.date'),
      render: (row) => (
        <span className="text-xs text-slate-600 flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          {formatBillingDate(row.date)}
        </span>
      ),
    },
    { key: 'description', label: t('billing.description') },
    {
      key: 'amount',
      label: t('billing.amount'),
      render: (row) => (
        <span className="font-semibold text-slate-800">${Number(row.amount).toFixed(2)}</span>
      ),
    },
    {
      key: 'status',
      label: t('billing.status'),
      render: (row) => (
        <Badge variant={row.status === 'paid' ? 'success' : 'warning'} size="sm" dot>
          {row.status === 'paid' ? t('billing.paid') : row.status}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: '',
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={() => setViewInvoice(row)}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-primary-600"
            aria-label="View invoice"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => downloadInvoice(row)}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-primary-600"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ]

  const loadError = plansError || subscriptionError || actionError

  return (
    <PageAmbient variant="mentor" className="space-y-6">
      <div className="max-w-4xl mx-auto w-full">
        <PageScaffold
          title={t('billing.title')}
          subtitle={hasSubscription ? t('billing.subtitleActive') : t('billing.subtitleCheckout')}
        >
          {loadError && (
            <PageCard variant="alert" className="mb-4">
              <p className="text-sm text-amber-900">{loadError}</p>
              {(subscriptionError || plansError) && (
                <Button variant="outline" size="sm" className="mt-3" onClick={refresh}>
                  Retry
                </Button>
              )}
            </PageCard>
          )}

          {subscriptionLoading ? (
            <PageCard>
              <p className="text-sm text-slate-600">{t('billing.processing')}</p>
            </PageCard>
          ) : null}

          <Link
            to="/mentor/subscription"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary-600 -mt-2 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('billing.viewPlans')}
          </Link>

          {!subscriptionLoading && hasSubscription ? (
            <div className="space-y-6">
              <PageCard variant="brand" className="text-white">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
                      <Crown className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white/85 uppercase tracking-wide">
                        {getStatusLabel(subscription)}
                      </p>
                      <h2 className="text-xl font-black mt-0.5 text-white">{t('subscription.premium')}</h2>
                      {subscription.billingAnchorDay && (
                        <p className="text-xs text-white/80 mt-2">
                          {t('billing.billingAnchor', {
                            day: subscription.billingAnchorDay,
                            date: formatBillingDate(subscription.currentPeriodEnd),
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="sm:text-right">
                    <p className="text-xs text-white/85">{t('billing.nextCharge')}</p>
                    <p className="text-lg font-bold text-white">{formatBillingDate(subscription.nextBilling)}</p>
                  </div>
                </div>
              </PageCard>

              <PageCard padding={false} className="overflow-hidden">
                <div className="px-5 py-4 border-b border-white/45 flex justify-between items-center gap-3">
                  <div>
                    <h3 className="font-bold text-slate-800">{t('billing.invoicesTitle')}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{t('billing.invoicesSubtitle')}</p>
                  </div>
                  <Badge variant="primary" size="sm">
                    {subscription.invoices?.length || 0}
                  </Badge>
                </div>
                <div className="hidden md:block">
                  <DataTable
                    columns={invoiceColumns}
                    rows={subscription.invoices || []}
                    emptyMessage={t('billing.noInvoices')}
                  />
                </div>
              </PageCard>
            </div>
          ) : !subscriptionLoading ? (
            <div className="max-w-lg mx-auto space-y-4">
              <PageCard>
                <p className="text-xs font-bold text-primary-600/90 uppercase tracking-wide mb-3">
                  {t('billing.phase1')}
                </p>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {plansLoading
                    ? 'Loading plan from database…'
                    : selectedPlan
                      ? `${selectedPlan.name} — $${formatPlanPrice(selectedPlan)}`
                      : 'No plan selected. Pick a plan on the subscription page.'}
                </p>
                {selectedPlan?.description && (
                  <p className="text-xs text-slate-500 mt-2">{selectedPlan.description}</p>
                )}
              </PageCard>

              <PageCard padding={false} className="overflow-hidden">
                <div className="px-6 py-4 border-b border-white/45">
                  <h2 className="font-bold text-slate-800">{t('billing.paymentSummary')}</h2>
                  <p className="text-xs text-slate-600 mt-1">{t('billing.processedVia')}</p>
                </div>
                <div className="px-6 py-4 space-y-2 border-b border-white/40 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">{selectedPlan?.name ?? 'Premium'}</span>
                    <span className="font-semibold">${checkoutTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between pt-2 font-bold text-slate-800">
                    <span>{t('billing.dueToday')}</span>
                    <span className="text-primary-600">${checkoutTotal.toFixed(2)}</span>
                  </div>
                </div>
                <div className="px-6 py-5 space-y-4">
                  <p className="text-xs text-slate-600 leading-relaxed">
                    You will be redirected to Stripe to pay securely. Card data never touches our servers.
                  </p>
                  <button
                    type="button"
                    disabled={loading || plansLoading || !selectedPlan}
                    onClick={handleStripeCheckout}
                    className="w-full py-3 rounded-xl bg-primary-400 text-white text-sm font-bold hover:bg-primary-500 disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {loading ? t('billing.processing') : (
                      <>
                        <CreditCard className="w-4 h-4" />
                        {t('billing.subscribe')} with Stripe — ${checkoutTotal.toFixed(2)}
                      </>
                    )}
                  </button>
                  <p className="text-xs text-center text-slate-400 flex items-center justify-center gap-1">
                    <Lock className="w-3 h-3" />
                    {t('billing.pciNote')}
                  </p>
                </div>
              </PageCard>
            </div>
          ) : null}
        </PageScaffold>
      </div>

      {viewInvoice && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/40">
          <PageCard className="w-full max-w-md relative">
            <button
              type="button"
              onClick={() => setViewInvoice(null)}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-8 h-8 text-primary-500" />
              <div>
                <p className="text-xs text-slate-400 uppercase font-bold">Invoice</p>
                <p className="font-bold">{viewInvoice.id}</p>
              </div>
            </div>
            <Button
              variant="primary"
              className="w-full mt-6"
              onClick={() => downloadInvoice(viewInvoice)}
            >
              <Download className="w-4 h-4" />
              {t('billing.downloadReceipt')}
            </Button>
          </PageCard>
        </div>
      )}
    </PageAmbient>
  )
}

export default MentorBilling
