import { useState, useEffect, useCallback, useMemo } from 'react'
import { fetchPlans } from '@/services/platform/subscriptionService'
import { partitionPlans } from '@/utils/subscriptionPlans'

export const useSubscriptionPlans = () => {
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const rows = await fetchPlans()
      setPlans(Array.isArray(rows) ? rows : [])
    } catch (err) {
      setError(err?.message || 'Failed to load subscription plans')
      setPlans([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const { paidPlans, freePlans } = useMemo(() => partitionPlans(plans), [plans])

  const getPlanById = useCallback(
    (planId) => {
      if (planId == null || planId === '') return null
      return plans.find((plan) => String(plan.subscription_Plan_id) === String(planId)) ?? null
    },
    [plans]
  )

  return {
    plans,
    paidPlans,
    freePlans,
    loading,
    error,
    refresh,
    getPlanById,
  }
}

export default useSubscriptionPlans
