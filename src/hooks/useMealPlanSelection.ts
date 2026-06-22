import { useState } from "react";
import type { GoalType, PlanDuration, UserProfile } from "../types/fitplate";
import { calculateNutritionTarget } from "../utils/nutritionCalculator";
import { selectClosestMealPlan } from "../utils/mealPlanSelector";

export function useMealPlanSelection() {
  const [profile, setProfile] = useState<UserProfile>({
    height: 170,
    weight: 68,
    age: 30,
    bmi: 0,
    gender: "male",
  });

  const [goal, setGoal] = useState<GoalType>("maintain");
  const [planDuration, setPlanDuration] = useState<PlanDuration>(3);

  const nutritionTarget = calculateNutritionTarget(profile, goal);

  const selectedMealPlan = selectClosestMealPlan(
    nutritionTarget.calories,
    planDuration,
  );

  return {
    profile,
    setProfile,
    goal,
    setGoal,
    planDuration,
    setPlanDuration,
    nutritionTarget,
    selectedMealPlan,
  };
}