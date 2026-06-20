// ResultPage 복원에 필요한 AI 식단 스냅샷을 메모리에서 관리하는 훅입니다.
import { useState, useEffect } from "react";
import { generateMealPlanFromApi } from "../api/mealPlanApi";
import { mergeMealPlanWithAi } from "../utils/mealPlanMerger";
import type {
  GoalType,
  MealPlan,
  NutritionTarget,
  PlanDuration,
  ResultSnapshot,
  UserProfile,
} from "../types/fitplate";

const SESSION_KEY = "fitplate_result_snapshot";

function loadSnapshot(): ResultSnapshot | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw != null ? (JSON.parse(raw) as ResultSnapshot) : null;
  } catch {
    return null;
  }
}

function saveSnapshot(snapshot: ResultSnapshot | null): void {
  try {
    if (snapshot == null) {
      sessionStorage.removeItem(SESSION_KEY);
    } else {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(snapshot));
    }
  } catch {
    // sessionStorage 용량 초과 등 예외 무시
  }
}

interface UseAiMealPlanParams {
  profile: UserProfile;
  goal: GoalType;
  nutritionTarget: NutritionTarget;
  planDuration: PlanDuration;
}

export function useAiMealPlan({ profile, goal, nutritionTarget, planDuration }: UseAiMealPlanParams) {
  const [resultSnapshot, setResultSnapshot] = useState<ResultSnapshot | null>(
    () => loadSnapshot(),
  );
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const markGenerating = () => setIsGenerating(true);

  useEffect(() => {
    saveSnapshot(resultSnapshot);
  }, [resultSnapshot]);

  const generateAiMealPlan = async (mealPlan: MealPlan) => {
    setIsGenerating(true);
    setIsAiLoading(true);
    setAiError(null);

    try {
      const response = await generateMealPlanFromApi({
        profile,
        goal,
        durationDays: mealPlan.durationDays,
      });

      const mergedMealPlan = mergeMealPlanWithAi(mealPlan, response.aiMealPlanResponse);

      const snapshot: ResultSnapshot = {
        profile,
        goal,
        nutritionTarget,
        planDuration,
        mealPlan: mergedMealPlan,
      };
      setResultSnapshot(snapshot);

      return mergedMealPlan;
    } catch (error) {
      console.error("AI 식단 생성 실패:", error);
      setAiError(
        error instanceof Error
          ? error.message
          : "AI 식단 생성 중 알 수 없는 오류가 발생했습니다.",
      );
      setIsGenerating(false);

      return null;
    } finally {
      setIsAiLoading(false);
    }
  };

  const resetAiMealPlan = () => {
    setAiError(null);
    setIsAiLoading(false);
    setIsGenerating(false);
  };

  return {
    resultSnapshot,
    isAiLoading,
    isGenerating,
    markGenerating,
    aiError,
    generateAiMealPlan,
    resetAiMealPlan,
  };
}
