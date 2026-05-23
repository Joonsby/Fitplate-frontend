import { useState } from "react";
import type { SavedMealPlan } from "../types/fitplate";

export function useSavedMealPlans() {
  const [savedMealPlans, setSavedMealPlans] = useState<SavedMealPlan[]>([]);
  const [viewingSavedMealPlan, setViewingSavedMealPlan] =
    useState<SavedMealPlan | null>(null);

  const clearViewingSavedMealPlan = () => {
    setViewingSavedMealPlan(null);
  };

  return {
    savedMealPlans,
    setSavedMealPlans,
    viewingSavedMealPlan,
    setViewingSavedMealPlan,
    clearViewingSavedMealPlan,
  };
}