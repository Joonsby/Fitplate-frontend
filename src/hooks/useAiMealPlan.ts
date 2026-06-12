// ResultPage 복원에 필요한 AI 식단 스냅샷을 메모리에서 관리하는 훅입니다.
import { useState } from "react";
import { generateMealPlanFromApi } from "../api/mealPlanApi";
import type {
  AIMealPlanResponse,
  GoalType,
  MealPlan,
  NutritionTarget,
  PlanDuration,
  ResultSnapshot,
  UserProfile,
} from "../types/fitplate";

interface UseAiMealPlanParams {
  profile: UserProfile;
  goal: GoalType;
  nutritionTarget: NutritionTarget;
  planDuration: PlanDuration;
}

export function useAiMealPlan({ profile, goal, nutritionTarget, planDuration }: UseAiMealPlanParams) {
  const [resultSnapshot, setResultSnapshot] = useState<ResultSnapshot | null>(null);
  // UI 상태(로딩/에러 게이팅)용 별도 상태 — 스냅샷과 분리해 로딩·에러 화면이 정상 작동하도록 합니다.
  const [aiMealPlanResponse, setAiMealPlanResponse] = useState<AIMealPlanResponse | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const generateAiMealPlan = async (mealPlan: MealPlan) => {
    setIsAiLoading(true);
    setAiError(null);
    setAiMealPlanResponse(null); // 로딩 스피너 표시를 위해 null로 초기화

    try {
      const response = await generateMealPlanFromApi({
        profile,
        goal,
        durationDays: mealPlan.durationDays,
      });

      const snapshot: ResultSnapshot = {
        profile,
        goal,
        nutritionTarget,
        planDuration,
        mealPlan,
        aiMealPlanResponse: response.aiMealPlanResponse,
      };      
      setResultSnapshot(snapshot);
      setAiMealPlanResponse(response.aiMealPlanResponse);

      return response.aiMealPlanResponse;
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

  // 저장된 식단 보기 등으로 덮였던 aiMealPlanResponse를 현재 스냅샷 기준으로 복원합니다.
  const resetAiMealPlan = () => {
    setAiMealPlanResponse(resultSnapshot?.aiMealPlanResponse ?? null);
    setAiError(null);
    setIsAiLoading(false);
  };

  // 저장된 식단 보기 전용입니다. resultSnapshot은 건드리지 않아 신선한 스냅샷이 보존됩니다.
  const restoreAiMealPlan = (response: AIMealPlanResponse | null) => {
    setAiMealPlanResponse(response);
    setAiError(null);
    setIsAiLoading(false);
  };

  return {
    resultSnapshot,
    aiMealPlanResponse,
    isAiLoading,
    aiError,
    generateAiMealPlan,
    resetAiMealPlan,
    restoreAiMealPlan,
  };
}
