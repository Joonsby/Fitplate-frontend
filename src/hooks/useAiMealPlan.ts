// ResultPage 복원에 필요한 AI 식단 스냅샷을 메모리에서 관리하는 훅입니다.
import { useState, useEffect, useRef } from "react";
import { generateMealPlanFromApi } from "../api/mealPlanApi";
import { buildMealPlanFromAiResponse } from "../utils/mealPlanMerger";
import type {
  GenerationStatus,
  GoalType,
  MealPlan,
  NutritionTarget,
  ResultSnapshot,
  UserProfile,
} from "../types/fitplate";

const SESSION_KEY = "fitplate_result_snapshot";
const GENERATION_STATUS_KEY = "mealPlanGenerationStatus";
const SESSION_AI_REQUEST_KEY = "fitplate_ai_request_params";

function saveAiRequestParams(profile: UserProfile, goal: GoalType): void {
  try {
    sessionStorage.setItem(SESSION_AI_REQUEST_KEY, JSON.stringify({ profile, goal }));
  } catch {
    // ignore
  }
}

function loadAiRequestParams(): { profile: UserProfile; goal: GoalType } | null {
  try {
    const raw = sessionStorage.getItem(SESSION_AI_REQUEST_KEY);
    return raw != null ? (JSON.parse(raw) as { profile: UserProfile; goal: GoalType }) : null;
  } catch {
    return null;
  }
}

export function clearAiRequestParams(): void {
  sessionStorage.removeItem(SESSION_AI_REQUEST_KEY);
}

function loadGenerationStatus(): GenerationStatus {
  const raw = sessionStorage.getItem(GENERATION_STATUS_KEY);
  if (raw === "generating" || raw === "failed") return raw;
  return "idle";
}

function saveGenerationStatus(status: GenerationStatus): void {
  sessionStorage.setItem(GENERATION_STATUS_KEY, status);
}

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

const EMPTY_MEAL_PLAN: MealPlan = {
  id: "empty",
  targetCalories: 0,
  durationDays: 0,
  averageCalories: 0,
  days: [],
};

interface UseAiMealPlanParams {
  profile: UserProfile;
  goal: GoalType;
  nutritionTarget: NutritionTarget;
}

export function useAiMealPlan({ profile, goal, nutritionTarget }: UseAiMealPlanParams) {
  const [resultSnapshot, setResultSnapshot] = useState<ResultSnapshot | null>(
    () => loadSnapshot(),
  );
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [generationStatus, setGenerationStatus] = useState<GenerationStatus>(() => loadGenerationStatus());
  const [aiError, setAiError] = useState<string | null>(null);
  const isInFlightRef = useRef(false);

  const markGenerating = () => {
    saveGenerationStatus("generating");
    setGenerationStatus("generating");
  };

  useEffect(() => {
    saveSnapshot(resultSnapshot);
  }, [resultSnapshot]);

  const generateAiMealPlan = async () => {
    if (isInFlightRef.current) return null;
    isInFlightRef.current = true;
    saveGenerationStatus("generating");
    setGenerationStatus("generating");
    setIsAiLoading(true);
    setAiError(null);

    // 세션에 저장된 요청 파라미터가 있으면 사용(재시도), 없으면 현재 값 저장(최초 요청)
    const savedParams = loadAiRequestParams();
    const requestProfile = savedParams?.profile ?? profile;
    const requestGoal = savedParams?.goal ?? goal;
    if (savedParams == null) {
      saveAiRequestParams(profile, goal);
    }

    try {
      const response = await generateMealPlanFromApi({
        profile: requestProfile,
        goal: requestGoal,
      });

      const mealPlan = buildMealPlanFromAiResponse(
        response.aiMealPlanResponse,
        response.targetCalories,
      );

      const snapshot: ResultSnapshot = {
        profile: requestProfile,
        goal: requestGoal,
        nutritionTarget,
        mealPlan,
      };
      setResultSnapshot(snapshot);
      saveGenerationStatus("idle");
      setGenerationStatus("idle");
      sessionStorage.removeItem("adRewardAvailable");
      clearAiRequestParams();

      return mealPlan;
    } catch (error) {
      console.error("AI 식단 생성 실패:", error);
      const errorMessage = error instanceof Error
        ? error.message
        : "AI 식단 생성 중 알 수 없는 오류가 발생했습니다.";
      saveGenerationStatus("failed");
      setGenerationStatus("failed");
      setAiError(errorMessage);

      const failureSnapshot: ResultSnapshot = {
        profile: requestProfile,
        goal: requestGoal,
        nutritionTarget,
        mealPlan: EMPTY_MEAL_PLAN,
        aiError: errorMessage,
      };
      setResultSnapshot(failureSnapshot);

      return null;
    } finally {
      isInFlightRef.current = false;
      setIsAiLoading(false);
    }
  };

  const resetAiMealPlan = () => {
    isInFlightRef.current = false;
    setAiError(null);
    setIsAiLoading(false);
  };

  return {
    resultSnapshot,
    isAiLoading,
    generationStatus,
    markGenerating,
    aiError,
    generateAiMealPlan,
    resetAiMealPlan,
  };
}
