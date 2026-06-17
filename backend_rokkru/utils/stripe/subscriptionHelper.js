import Subscription from '../../models/subscriptionModel.js';
import SubscriptionPlan from '../../models/subscriptionPlanModel.js';

const DEFAULT_PLAN_DURATION_DAYS = 30;

export function getPlanDurationDays(plan) {
  const duration = plan.duration_day;
  const parsedDuration = Number(duration);

  if (Number.isInteger(parsedDuration) && parsedDuration > 0) {
    return parsedDuration;
  }

  return DEFAULT_PLAN_DURATION_DAYS;
}

export async function activateSubscription({ userId, subscriptionPlanId, userTypeId }) {
  const plan = await SubscriptionPlan.findByPk(subscriptionPlanId);
  if (!plan) {
    throw new Error(`Subscription plan ${subscriptionPlanId} not found`);
  }

  const durationDays = getPlanDurationDays(plan);
  const startDate = new Date();
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + durationDays);

  const existing = await Subscription.findOne({ where: { user_id: userId } });

  if (existing) {
    existing.subscription_plan_id = subscriptionPlanId;
    existing.start_date = startDate;
    existing.end_date = endDate;
    if (userTypeId) {
      existing.user_type_id = userTypeId;
    }
    await existing.save();
    return existing;
  }

  return Subscription.create({
    subscription_plan_id: subscriptionPlanId,
    user_id: userId,
    user_type_id: userTypeId,
    start_date: startDate,
    end_date: endDate,
  });
}
