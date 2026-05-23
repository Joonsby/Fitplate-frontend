import { useState } from "react";
import { generateMealPlanFromApi } from "../api/mealPlanApi";
import type {
  AIMealPlanResponse,
  GoalType,
  MealPlan,
  NutritionTarget,
  UserProfile,
} from "../types/fitplate";

const SESSION_KEY = "fitplate_aiMealPlanResponse";

function loadFromSession(): AIMealPlanResponse | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as AIMealPlanResponse) : null;
  } catch {
    return null;
  }
}

function saveToSession(response: AIMealPlanResponse | null): void {
  if (response == null) {
    sessionStorage.removeItem(SESSION_KEY);
  } else {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(response));
  }
}

interface UseAiMealPlanParams {
  profile: UserProfile;
  goal: GoalType;
}

export function useAiMealPlan({ profile, goal }: UseAiMealPlanParams) {
  const [aiMealPlanResponse, setAiMealPlanResponse] =
    useState<AIMealPlanResponse | null>(loadFromSession);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const setAndSave = (response: AIMealPlanResponse | null) => {
    saveToSession(response);
    setAiMealPlanResponse(response);
  };

  const generateAiMealPlan = async (
    mealPlan: MealPlan,
    target: NutritionTarget,
  ) => {
    setIsAiLoading(true);
    setAiError(null);
    setAndSave(null);

    try {
      const response = await generateMealPlanFromApi({
        profile,
        goal,
        durationDays: mealPlan.durationDays,
        targetCalories: target.calories,
      });

      setAndSave(response);

      return response;
    } catch (error) {
      console.error("AI 식단 생성 실패:", error);
      setAiError(
        error instanceof Error
          ? error.message
          : "AI 식단 생성 중 알 수 없는 오류가 발생했습니다.",
      );

      return null;
    } finally {
      setIsAiLoading(false);
    }
  };

  const resetAiMealPlan = () => {
    setAndSave(null);
    setAiError(null);
    setIsAiLoading(false);
  };

  const restoreAiMealPlan = (response: AIMealPlanResponse | null) => {
    setAndSave(response);
    setAiError(null);
    setIsAiLoading(false);
  };

  return {
    aiMealPlanResponse,
    isAiLoading,
    aiError,
    generateAiMealPlan,
    resetAiMealPlan,
    restoreAiMealPlan,
  };
}