export function isPaidPlan(plan) {
  return Number(plan?.price) > 0
}

/** Split API rows into free (price 0) and paid plans from `subscription_Plan` table. */
export function partitionPlans(plans = []) {
  const paidPlans = plans.filter(isPaidPlan)
  const freePlans = plans.filter((plan) => !isPaidPlan(plan))
  return { paidPlans, freePlans }
}

export function formatPlanPrice(plan) {
  return Number(plan?.price ?? 0).toFixed(2)
}

export function getPlanDurationLabel(plan) {
  const days = Number(plan?.duration_day)
  if (Number.isInteger(days) && days > 0) {
    return days === 30 ? '/mo' : ` / ${days} days`
  }
  return '/mo'
}
