import { useState } from "react";
import type { GoalType, UserProfile } from "../types/fitplate";
import { calculateNutritionTarget } from "../utils/nutritionCalculator";

export function useMealPlanSelection() {
  const [profile, setProfile] = useState<UserProfile>({
    height: 170,
    weight: 68,
    age: 30,
    gender: "male",
  });

  const [goal, setGoal] = useState<GoalType>("maintain");

  const nutritionTarget = calculateNutritionTarget(profile, goal);

  return {
    profile,
    setProfile,
    goal,
    setGoal,
    nutritionTarget,
  };
}
