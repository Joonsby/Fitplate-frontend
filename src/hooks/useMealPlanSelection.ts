import { useState } from "react";
import type { GoalType, PlanDuration, UserProfile } from "../types/fitplate";
import { calculateNutritionTarget } from "../utils/nutritionCalculator";
import { selectClosestMealPlan } from "../utils/mealPlanSelector";

export function useMealPlanSelection() {
  const [profile] = useState<UserProfile>({
    heightCm: 170,
    weightKg: 68,
    age: 30,
    gender: "male",
  });

  const [goal, setGoal] = useState<GoalType>("maintain");
  const [durationDays, setDurationDays] = useState<PlanDuration>(3);

  const nutritionTarget = calculateNutritionTarget(profile, goal);

  const selectedMealPlan = selectClosestMealPlan(
    nutritionTarget.calories,
    durationDays,
  );

  return {
    profile,
    goal,
    setGoal,
    durationDays,
    setDurationDays,
    nutritionTarget,
    selectedMealPlan,
  };
}