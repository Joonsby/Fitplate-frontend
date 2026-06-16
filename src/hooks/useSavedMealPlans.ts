import { useState, useEffect } from "react";
import type { SavedMealPlan } from "../types/fitplate";

const SESSION_KEYS = {
  savedMealPlans: "fitplate_saved_meal_plans",
  viewingSavedMealPlan: "fitplate_viewing_saved_meal_plan",
} as const;

function loadFromSession<T>(key: string): T | null {
  try {
    const raw = sessionStorage.getItem(key);
    return raw != null ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function saveToSession(key: string, value: unknown): void {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    // sessionStorage 용량 초과 등 예외 무시
  }
}

export function useSavedMealPlans() {
  const [savedMealPlans, setSavedMealPlans] = useState<SavedMealPlan[]>(
    () => loadFromSession<SavedMealPlan[]>(SESSION_KEYS.savedMealPlans) ?? [],
  );
  const [viewingSavedMealPlan, setViewingSavedMealPlan] =
    useState<SavedMealPlan | null>(
      () => loadFromSession<SavedMealPlan>(SESSION_KEYS.viewingSavedMealPlan),
    );

  useEffect(() => {
    saveToSession(SESSION_KEYS.savedMealPlans, savedMealPlans);
  }, [savedMealPlans]);

  useEffect(() => {
    if (viewingSavedMealPlan == null) {
      sessionStorage.removeItem(SESSION_KEYS.viewingSavedMealPlan);
    } else {
      saveToSession(SESSION_KEYS.viewingSavedMealPlan, viewingSavedMealPlan);
    }
  }, [viewingSavedMealPlan]);

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
