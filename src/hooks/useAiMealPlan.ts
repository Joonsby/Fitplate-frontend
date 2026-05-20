import { useState } from "react";
import { generateMealPlanFromApi } from "../api/mealPlanApi";
import type {
  AIMealPlanResponse,
  GoalType,
  MealPlan,
  NutritionTarget,
  UserProfile,
} from "../types/fitplate";

interface UseAiMealPlanParams {
  profile: UserProfile;
  goal: GoalType;
}

export function useAiMealPlan({ profile, goal }: UseAiMealPlanParams) {
  const [aiMealPlanResponse, setAiMealPlanResponse] =
    useState<AIMealPlanResponse | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const generateAiMealPlan = async (
    mealPlan: MealPlan,
    target: NutritionTarget,
  ) => {
    setIsAiLoading(true);
    setAiError(null);
    setAiMealPlanResponse(null);

    try {
      const response = await generateMealPlanFromApi({
        profile,
        goal,
        durationDays: mealPlan.durationDays,
        targetCalories: target.calories,
      });

      setAiMealPlanResponse(response);
    } catch (error) {
      console.error("AI 식단 생성 실패:", error);
      setAiError(
        error instanceof Error
          ? error.message
          : "AI 식단 생성 중 알 수 없는 오류가 발생했습니다.",
      );
    } finally {
      setIsAiLoading(false);
    }
  };

  const resetAiMealPlan = () => {
    setAiMealPlanResponse(null);
    setAiError(null);
    setIsAiLoading(false);
  };

  const restoreAiMealPlan = (response: AIMealPlanResponse | null) => {
    setAiMealPlanResponse(response);
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