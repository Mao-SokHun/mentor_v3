export const MONTHLY_PRICE = 29
export const ANNUAL_DISCOUNT_PERCENT = 17
export const ANNUAL_PRICE = Math.round(MONTHLY_PRICE * 12 * (1 - ANNUAL_DISCOUNT_PERCENT / 100))
export const PREMIUM_PRICE = MONTHLY_PRICE

export const SUBSCRIPTION_STATUS = {
  ACTIVE: 'active',
  TRIALING: 'trialing',
  PAST_DUE: 'past_due',
  CANCELING: 'canceling',
  CANCELED: 'canceled',
}

export const defaultSubscriptionState = () => ({
  plan: 'free',
  status: null,
  billingInterval: 'monthly',
  subscribedAt: null,
  billingAnchorDay: null,
  currentPeriodStart: null,
  currentPeriodEnd: null,
  nextBilling: null,
  cancelAtPeriodEnd: false,
  canceledAt: null,
  cardLast4: null,
  paymentFailures: 0,
  lastPaymentFailedAt: null,
  gracePeriodEndsAt: null,
  scheduledChange: null,
  trialEndsAt: null,
  invoices: [],
})

const toDate = (iso) => {
  if (!iso) return null
  return new Date(iso.length === 10 ? `${iso}T12:00:00` : iso)
}

export const getIntervalPrice = (interval) =>
  interval === 'annual' ? ANNUAL_PRICE : MONTHLY_PRICE

export const getMonthlyEquivalent = (interval) =>
  interval === 'annual' ? (ANNUAL_PRICE / 12).toFixed(2) : MONTHLY_PRICE.toFixed(2)

/** Normalize API payload into UI subscription shape. */
export const normalizeSubscription = (parsed) => {
  const base = defaultSubscriptionState()
  if (!parsed || typeof parsed !== 'object') return base
  return { ...base, ...parsed }
}

export const hasPremiumAccess = (sub = defaultSubscriptionState()) => {
  if (sub.plan !== 'premium') return false
  if (sub.status === SUBSCRIPTION_STATUS.CANCELED) return false

  const now = new Date()
  const periodEnd = toDate(sub.currentPeriodEnd)

  if (periodEnd && now > periodEnd && sub.status === SUBSCRIPTION_STATUS.CANCELING) {
    return false
  }

  if (sub.status === SUBSCRIPTION_STATUS.PAST_DUE) {
    const graceEnd = toDate(sub.gracePeriodEndsAt)
    if (graceEnd && now > graceEnd) return false
  }

  return [
    SUBSCRIPTION_STATUS.ACTIVE,
    SUBSCRIPTION_STATUS.TRIALING,
    SUBSCRIPTION_STATUS.PAST_DUE,
    SUBSCRIPTION_STATUS.CANCELING,
  ].includes(sub.status)
}

export const calculateProration = (sub, newInterval) => {
  if (sub.plan !== 'premium' || !sub.currentPeriodEnd) {
    return { credit: 0, charge: getIntervalPrice(newInterval), dueToday: getIntervalPrice(newInterval) }
  }

  const now = new Date()
  const periodEnd = toDate(sub.currentPeriodEnd)
  const periodStart = toDate(sub.currentPeriodStart) || now
  const totalMs = periodEnd - periodStart
  const remainingMs = Math.max(0, periodEnd - now)
  const ratio = totalMs > 0 ? remainingMs / totalMs : 0

  const oldPrice = getIntervalPrice(sub.billingInterval)
  const newPrice = getIntervalPrice(newInterval)
  const credit = Math.round(oldPrice * ratio * 100) / 100
  const newCharge = Math.round(newPrice * ratio * 100) / 100
  const dueToday = Math.max(0, Math.round((newCharge - credit) * 100) / 100)

  return { credit, charge: newCharge, dueToday, newPrice, oldPrice }
}

export const getStatusLabel = (sub) => {
  if (sub.plan === 'free') return 'Free plan'
  switch (sub.status) {
    case SUBSCRIPTION_STATUS.TRIALING:
      return 'Free trial'
    case SUBSCRIPTION_STATUS.PAST_DUE:
      return 'Payment issue'
    case SUBSCRIPTION_STATUS.CANCELING:
      return 'Canceling at period end'
    case SUBSCRIPTION_STATUS.CANCELED:
      return 'Canceled'
    default:
      return 'Active'
  }
}

export const formatBillingDate = (iso) => {
  if (!iso) return '—'
  return toDate(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export const downloadInvoice = (invoice, companyName = 'Rok Kru Platform') => {
  const lines = [
    `${companyName.toUpperCase()} — TAX INVOICE / RECEIPT`,
    '================================',
    `Invoice ID: ${invoice.id}`,
    `Issue date: ${invoice.date}`,
    `Status: ${(invoice.status || 'paid').toUpperCase()}`,
    '',
    `Bill to: Teacher account`,
    `Description: ${invoice.description}`,
    `Service period: ${invoice.periodStart} → ${invoice.periodEnd}`,
    invoice.billingInterval ? `Billing cycle: ${invoice.billingInterval}` : '',
    '',
    `Amount: $${Number(invoice.amount).toFixed(2)} USD`,
    '',
    'Payment processed securely. For billing questions: billing@rokkru.com',
    'Rok Kru · Phnom Penh, Cambodia',
  ].filter(Boolean)
  const blob = new Blob([lines.join('\n')], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${invoice.id}.txt`
  a.click()
  URL.revokeObjectURL(url)
}
