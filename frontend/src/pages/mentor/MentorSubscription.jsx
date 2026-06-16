import { Link } from 'react-router-dom'
import { Crown, Check, Sparkles, CreditCard, Info, AlertCircle } from 'lucide-react'
import { PageScaffold, PageCard, PageAmbient } from '@/components'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import clsx from 'clsx'
import { useTranslation } from '@/i18n'
import { useMentorSubscription, useSubscriptionPlans } from '@/hooks'
import {
  getStatusLabel,
  formatBillingDate,
  SUBSCRIPTION_STATUS,
} from '../../utils/mentorSubscription'
import { formatPlanPrice, getPlanDurationLabel } from '../../utils/subscriptionPlans'

const FREE_FEATURES = (t) => [
  t('subscription.basicProfile'),
  t('subscription.searchProvince'),
  t('subscription.directContact'),
]

const PREMIUM_FEATURES = (t) => [
  t('subscription.pinnedSearch'),
  t('subscription.featuredPremium'),
  t('subscription.highlightedCard'),
  t('subscription.priorityMessaging'),
]

const MentorSubscription = () => {
  const { t } = useTranslation()
  const { subscription, isPremium } = useMentorSubscription()
  const { paidPlans, loading, error, refresh } = useSubscriptionPlans()

  const freePlan = {
    id: 'free',
    name: t('subscription.free'),
    price: 0,
    description: t('subscription.freeDesc'),
    features: FREE_FEATURES(t),
    premium: false,
  }

  const displayPlans = [
    freePlan,
    ...paidPlans.map((plan) => ({
      id: plan.subscription_Plan_id,
      subscriptionPlanId: plan.subscription_Plan_id,
      name: plan.name,
      price: Number(plan.price),
      description: plan.description || t('subscription.premiumDesc'),
      features: PREMIUM_FEATURES(t),
      premium: true,
      durationLabel: getPlanDurationLabel(plan),
    })),
  ]

  return (
    <PageAmbient variant="mentor" className="space-y-6">
      <PageScaffold
        title={t('subscription.title')}
        subtitle={t('subscription.subtitle')}
      >
        {error && (
          <PageCard variant="alert" className="mb-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-amber-900">{error}</p>
              <Button variant="outline" size="sm" className="mt-2" onClick={refresh}>
                Retry
              </Button>
            </div>
          </PageCard>
        )}

        {isPremium && (
          <PageCard className="bg-emerald-50/80 border-emerald-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-emerald-600" />
                <p className="text-sm font-semibold text-emerald-900">
                  {getStatusLabel(subscription)}
                </p>
              </div>
              {subscription.status === SUBSCRIPTION_STATUS.CANCELING && (
                <p className="text-xs text-emerald-800 mt-1">
                  {t('subscription.accessUntil').replace('{{date}}', formatBillingDate(subscription.currentPeriodEnd))}
                </p>
              )}
              {subscription.billingAnchorDay && (
                <p className="text-xs text-slate-600 mt-1">
                  {t('subscription.billingAnchor').replace('{{day}}', subscription.billingAnchorDay)}
                </p>
              )}
            </div>
            <Link to="/mentor/billing">
              <Button variant="outline" size="sm">
                <CreditCard className="w-4 h-4" />
                {t('subscription.billingInvoices')}
              </Button>
            </Link>
          </PageCard>
        )}

        <PageCard className="bg-slate-50/80 border-slate-200/80">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-slate-600 leading-relaxed max-w-xl">
              {t('subscription.paymentNote')}
              {loading ? ' Loading plans from database…' : paidPlans.length ? ` ${paidPlans.length} plan(s) available.` : ' No paid plans in database yet.'}
            </p>
          </div>
        </PageCard>

        {loading ? (
          <PageCard>
            <p className="text-sm text-slate-600">Loading subscription plans…</p>
          </PageCard>
        ) : (
          <div
            className={clsx(
              'grid gap-6 lg:gap-8 w-full max-w-5xl',
              displayPlans.length > 2 ? 'md:grid-cols-2 lg:grid-cols-3' : 'md:grid-cols-2'
            )}
          >
            {displayPlans.map((plan) => {
              const isCurrent = plan.premium ? isPremium : !isPremium
              return (
                <PageCard
                  key={plan.id}
                  className={clsx(
                    'relative',
                    plan.premium && 'ring-2 ring-primary-200 bg-primary-50/30',
                    isCurrent && !plan.premium && 'ring-2 ring-slate-200'
                  )}
                >
                  {plan.premium && (
                    <Badge variant="primary" size="sm" className="absolute top-4 right-4">
                      <Crown className="w-3 h-3" />
                      {t('subscription.recommended')}
                    </Badge>
                  )}
                  {isCurrent && (
                    <Badge variant="success" size="sm" className="absolute top-4 left-4">
                      {t('subscription.currentPlan')}
                    </Badge>
                  )}
                  <div className="flex items-baseline gap-2 mb-2 mt-6 flex-wrap">
                    <h3 className="text-lg font-bold text-slate-800">{plan.name}</h3>
                    <p className="text-2xl font-extrabold text-primary-600">
                      {plan.premium ? (
                        <>
                          ${formatPlanPrice(plan)}
                          <span className="text-sm font-medium text-slate-400">{plan.durationLabel}</span>
                        </>
                      ) : (
                        <>
                          $0
                          <span className="text-sm font-medium text-slate-400">/mo</span>
                        </>
                      )}
                    </p>
                  </div>
                  <p className="text-sm text-slate-600 mb-4">{plan.description}</p>
                  <ul className="space-y-2 mb-6">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-slate-600">
                        <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  {plan.premium ? (
                    isPremium ? (
                      <Link to="/mentor/billing">
                        <Button variant="secondary" className="w-full">
                          <CreditCard className="w-4 h-4" />
                          {t('subscription.manageBilling')}
                        </Button>
                      </Link>
                    ) : (
                      <Link to={`/mentor/billing?plan=${plan.subscriptionPlanId}`}>
                        <Button variant="primary" className="w-full">
                          <Sparkles className="w-4 h-4" />
                          {t('subscription.continueCheckout')}
                        </Button>
                      </Link>
                    )
                  ) : (
                    <Button variant="secondary" className="w-full" disabled={isCurrent}>
                      {isCurrent ? t('subscription.currentPlan') : t('subscription.included')}
                    </Button>
                  )}
                </PageCard>
              )
            })}
          </div>
        )}

        {!loading && paidPlans.length === 0 && (
          <PageCard className="border-amber-200 bg-amber-50/50">
            <p className="text-sm text-amber-900">
              No paid plans found in the database. Add rows to the <code>subscription_Plan</code> table
              or enable <code>GET /api/v1/stripe/plans</code> on the backend.
            </p>
          </PageCard>
        )}
      </PageScaffold>
    </PageAmbient>
  )
}

export default MentorSubscription
