import { Link } from 'react-router-dom'
import { XCircle } from 'lucide-react'
import { PageAmbient, PageCard, PageScaffold } from '@/components'
import Button from '../../components/ui/Button'

const PaymentCancel = () => (
  <PageAmbient variant="mentor" className="max-w-lg mx-auto">
    <PageScaffold title="Payment canceled" subtitle="No charge was made">
      <PageCard className="text-center space-y-4">
        <XCircle className="w-12 h-12 text-slate-400 mx-auto" />
        <p className="text-sm text-slate-600">
          You canceled Stripe checkout. You can try again anytime.
        </p>
        <Link to="/mentor/subscription">
          <Button variant="primary" className="w-full">
            Back to plans
          </Button>
        </Link>
      </PageCard>
    </PageScaffold>
  </PageAmbient>
)

export default PaymentCancel
