import { useState, useEffect, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import {
  defaultSubscriptionState,
  hasPremiumAccess,
  normalizeSubscription,
} from '../../utils/mentorSubscription'
import { fetchCurrentSubscription } from '../../services/platform/subscriptionService'

/** Keeps billing/subscription UI in sync with Stripe backend API. */
export const useMentorSubscription = () => {
  const location = useLocation()
  const [subscription, setSubscription] = useState(defaultSubscriptionState)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchCurrentSubscription()
      setSubscription(normalizeSubscription(data))
    } catch (err) {
      setError(err?.message || 'Failed to load subscription')
      setSubscription(defaultSubscriptionState())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [location.pathname, refresh])

  return {
    subscription,
    isPremium: hasPremiumAccess(subscription),
    hasSubscription: subscription.plan === 'premium',
    loading,
    error,
    refresh,
    setSubscription,
  }
}

export default useMentorSubscription
