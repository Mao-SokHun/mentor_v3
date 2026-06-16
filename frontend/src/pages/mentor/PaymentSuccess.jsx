import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CheckCircle, AlertCircle } from 'lucide-react'
import { PageAmbient, PageCard, PageScaffold } from '@/components'
import Button from '../../components/ui/Button'
import { getCheckoutSession } from '@/services/platform/subscriptionService'
import { useMentorSubscription } from '@/hooks'

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const { refresh } = useMentorSubscription()
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!sessionId) {
      setStatus('error')
      setError('Missing payment session.')
      return
    }

    getCheckoutSession(sessionId)
      .then(async (data) => {
        if (data.status === 'paid') {
          await refresh()
          setStatus('success')
        } else {
          setStatus('pending')
        }
      })
      .catch((err) => {
        setStatus('error')
        setError(err?.message || 'Could not verify payment')
      })
  }, [sessionId, refresh])

  return (
    <PageAmbient variant="mentor" className="max-w-lg mx-auto">
      <PageScaffold title="Payment" subtitle="Stripe checkout result">
        <PageCard className="text-center space-y-4">
          {status === 'loading' && (
            <p className="text-sm text-slate-600">Verifying your payment…</p>
          )}

          {status === 'success' && (
            <>
              <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
              <p className="text-lg font-bold text-slate-800">Payment successful</p>
              <p className="text-sm text-slate-600">
                Your mentor premium subscription is now active.
              </p>
              <Link to="/mentor/billing">
                <Button variant="primary" className="w-full mt-2">
                  View billing
                </Button>
              </Link>
            </>
          )}

          {status === 'pending' && (
            <>
              <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
              <p className="text-lg font-bold text-slate-800">Payment pending</p>
              <p className="text-sm text-slate-600">
                Stripe is still processing. Refresh billing in a moment.
              </p>
              <Link to="/mentor/billing">
                <Button variant="outline" className="w-full mt-2">
                  Go to billing
                </Button>
              </Link>
            </>
          )}

          {status === 'error' && (
            <>
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
              <p className="text-lg font-bold text-slate-800">Verification failed</p>
              <p className="text-sm text-slate-600">{error}</p>
              <Link to="/mentor/subscription">
                <Button variant="outline" className="w-full mt-2">
                  Back to plans
                </Button>
              </Link>
            </>
          )}
        </PageCard>
      </PageScaffold>
    </PageAmbient>
  )
}

export default PaymentSuccess
