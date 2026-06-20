// ResultPage 복원에 필요한 AI 식단 스냅샷을 메모리에서 관리하는 훅입니다.
import { useState, useEffect, useRef } from "react";
import { generateMealPlanFromApi } from "../api/mealPlanApi";
import { mergeMealPlanWithAi } from "../utils/mealPlanMerger";
import type {
  GenerationStatus,
  GoalType,
  MealPlan,
  NutritionTarget,
  PlanDuration,
  ResultSnapshot,
  UserProfile,
} from "../types/fitplate";

const SESSION_KEY = "fitplate_result_snapshot";
const GENERATION_STATUS_KEY = "mealPlanGenerationStatus";

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

  const generateAiMealPlan = async (mealPlan: MealPlan) => {
    if (isInFlightRef.current) return null;
    isInFlightRef.current = true;
    saveGenerationStatus("generating");
    setGenerationStatus("generating");
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
      saveGenerationStatus("idle");
      setGenerationStatus("idle");
      sessionStorage.removeItem("adRewardAvailable");

      return mergedMealPlan;
    } catch (error) {
      console.error("AI 식단 생성 실패:", error);
      saveGenerationStatus("failed");
      setGenerationStatus("failed");
      setAiError(
        error instanceof Error
          ? error.message
          : "AI 식단 생성 중 알 수 없는 오류가 발생했습니다.",
      );

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
