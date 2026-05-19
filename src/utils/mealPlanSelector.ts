import { MEAL_PLANS } from "../data/mealPlans";
import type { MealPlan, PlanDuration } from "../types/fitplate";

// 사용자의 목표 칼로리와 선택한 기간에 맞는 더미 식단을 선택합니다.
// 같은 기간의 식단 중 목표 칼로리와 가장 가까운 식단을 반환합니다.
export function selectClosestMealPlan(
  targetCalories: number,
  durationDays: PlanDuration,
): MealPlan {
  const safeTargetCalories =
    Number.isFinite(targetCalories) && targetCalories > 0 ? targetCalories : 2000;
  const plansByDuration = MEAL_PLANS.filter(
    (plan) => plan.durationDays === durationDays,
  );

  return plansByDuration.reduce((closestPlan, currentPlan) => {
    const closestGap = Math.abs(closestPlan.targetCalories - safeTargetCalories);
    const currentGap = Math.abs(currentPlan.targetCalories - safeTargetCalories);

    return currentGap < closestGap ? currentPlan : closestPlan;
  });
}
