import { apiRequest } from '../core/api'
import { ENDPOINTS } from '../core/endpoints'
import { normalizeSubscription } from '@/utils/mentorSubscription'

function unwrap(json) {
  return normalizeSubscription(json?.data ?? json)
}

export async function fetchCurrentSubscription() {
  const json = await apiRequest(ENDPOINTS.stripe.current)
  return unwrap(json)
}

export async function fetchPlans() {
  const json = await apiRequest(ENDPOINTS.stripe.plans, { auth: false })
  return Array.isArray(json) ? json : (json?.data ?? [])
}

export async function createCheckoutSession({ subscriptionPlanId }) {
  const origin = window.location.origin
  const json = await apiRequest(ENDPOINTS.stripe.createCheckout, {
    method: 'POST',
    body: JSON.stringify({
      subscription_plan_id: subscriptionPlanId,
      success_url: `${origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/payment/cancel`,
    }),
  })
  return json
}

export async function getCheckoutSession(sessionId) {
  return apiRequest(ENDPOINTS.stripe.session(sessionId))
}
