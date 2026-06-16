import { Link } from 'react-router-dom'
import { AlertCircle, Crown } from 'lucide-react'
import { SUBSCRIPTION_STATUS, formatBillingDate } from '@/utils/mentorSubscription'

const SubscriptionAlerts = ({ subscription, onResume }) => {
  if (!subscription || subscription.plan === 'free') return null

  if (subscription.status === SUBSCRIPTION_STATUS.PAST_DUE) {
    return (
      <div className="bg-amber-50 border-b border-amber-100 px-5 py-3 flex items-center gap-3 text-sm">
        <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
        <p className="text-amber-800 flex-1">
          Payment failed — access continues until{' '}
          <strong>{formatBillingDate(subscription.gracePeriodEndsAt)}</strong>.
        </p>
        <Link
          to="/mentor/billing"
          className="text-xs font-bold text-amber-700 hover:text-amber-900 underline"
        >
          Update card
        </Link>
      </div>
    )
  }

  if (subscription.status === SUBSCRIPTION_STATUS.CANCELING) {
    return (
      <div className="bg-slate-50 border-b border-slate-100 px-5 py-3 flex items-center gap-3 text-sm">
        <Crown className="w-4 h-4 text-slate-400 flex-shrink-0" />
        <p className="text-slate-600 flex-1">
          Premium ends {formatBillingDate(subscription.currentPeriodEnd)}.
        </p>
        {onResume && (
          <button
            type="button"
            onClick={onResume}
            className="text-xs font-bold text-primary-600 hover:text-primary-800 underline"
          >
            Resume
          </button>
        )}
      </div>
    )
  }

  return null
}

export default SubscriptionAlerts
