// ResultPage 복원에 필요한 스냅샷을 sessionStorage에 저장하고 불러오는 훅입니다.
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

const SNAPSHOT_KEY = "fitplate_result_snapshot";

function loadSnapshot(): ResultSnapshot | null {
  try {
    const raw = sessionStorage.getItem(SNAPSHOT_KEY);
    return raw ? (JSON.parse(raw) as ResultSnapshot) : null;
  } catch {
    return null;
  }
}

function saveSnapshot(snapshot: ResultSnapshot): void {
  sessionStorage.setItem(SNAPSHOT_KEY, JSON.stringify(snapshot));
}

interface UseAiMealPlanParams {
  profile: UserProfile;
  goal: GoalType;
  nutritionTarget: NutritionTarget;
  durationDays: PlanDuration;
}

<<<<<<< HEAD
export function useAiMealPlan({ profile, goal, nutritionTarget, durationDays }: UseAiMealPlanParams) {
  const [resultSnapshot, setResultSnapshot] = useState<ResultSnapshot | null>(null);
  // UI 상태(로딩/에러 게이팅)용 별도 상태 — 스냅샷과 분리해 로딩·에러 화면이 정상 작동하도록 합니다.
  const [aiResponse, setAiResponse] = useState<AIMealPlanResponse | null>(null);
=======
export function useAiMealPlan({ profile, goal, nutritionTarget, planDuration }: UseAiMealPlanParams) {
  const [resultSnapshot, setResultSnapshot] = useState<ResultSnapshot | null>(loadSnapshot);
  // UI 상태(로딩/에러 게이팅)용 별도 상태 — 스냅샷과 분리해 로딩·에러 화면이 정상 작동하도록 합니다.
  const [aiMealPlanResponse, setAiMealPlanResponse] = useState<AIMealPlanResponse | null>(
    () => loadSnapshot()?.aiMealPlanResponse ?? null,
  );
>>>>>>> parent of 6d2a8c2 (feat : 저장된 식단 전체 가져오기 기능까지 완료)
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const generateAiMealPlan = async (mealPlan: MealPlan) => {
    setIsAiLoading(true);
    setAiError(null);
    setAiResponse(null); // 로딩 스피너 표시를 위해 null로 초기화

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
        durationDays,
        mealPlan,
<<<<<<< HEAD
        aiResponse: response.aiResponse,
      };
=======
        aiMealPlanResponse: response.aiMealPlanResponse,
      };
      saveSnapshot(snapshot);
>>>>>>> parent of 6d2a8c2 (feat : 저장된 식단 전체 가져오기 기능까지 완료)
      setResultSnapshot(snapshot);
      setAiResponse(response.aiResponse);

      return response.aiResponse;
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

<<<<<<< HEAD
  // 저장된 식단 보기 등으로 덮였던 aiResponse를 현재 스냅샷 기준으로 복원합니다.
  const resetAiMealPlan = () => {
    setAiResponse(resultSnapshot?.aiResponse ?? null);
=======
  // sessionStorage에서 스냅샷을 복원합니다. null로 초기화하지 않아 뒤로가기 후에도 데이터가 유지됩니다.
  const resetAiMealPlan = () => {
    const snapshot = loadSnapshot();
    setResultSnapshot(snapshot);
    setAiMealPlanResponse(snapshot?.aiMealPlanResponse ?? null);
>>>>>>> parent of 6d2a8c2 (feat : 저장된 식단 전체 가져오기 기능까지 완료)
    setAiError(null);
    setIsAiLoading(false);
  };

  // 저장된 식단 보기 전용입니다. sessionStorage는 건드리지 않아 신선한 스냅샷이 보존됩니다.
  const restoreAiMealPlan = (response: AIMealPlanResponse | null) => {
    setAiResponse(response);
    setAiError(null);
    setIsAiLoading(false);
  };

  return {
    resultSnapshot,
    aiResponse,
    isAiLoading,
    aiError,
    generateAiMealPlan,
    resetAiMealPlan,
    restoreAiMealPlan,
  };
}
