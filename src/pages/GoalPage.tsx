// 목표 선택 페이지 — 목표 선택 후 AI 식단 생성을 시작하는 페이지
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getGenerationQuota } from "../api/mealPlanApi";
import type { GenerationQuota } from "../api/mealPlanApi";
import { GoalSelector } from "../components/forms/GoalSelector";
import { calculateNutritionTarget } from "../utils/nutritionCalculator";
import type {
  GenerationStatus,
  GoalType,
  MealPlan,
  UserProfile,
} from "../types/fitplate";

interface GoalPageProps {
  profile: UserProfile;
  goal: GoalType;
  isOnboarding: boolean;
  onGoalChange: (goal: GoalType) => void;
  onGeneratedStart: () => void;
  generateAiMealPlan: () => Promise<MealPlan | null>;
  generationStatus: GenerationStatus;
  markGenerating: () => void;
  isAdLoaded: boolean;
  showAd: (onComplete?: (wasWatched: boolean) => void) => void;
}

export function GoalPage({
  profile,
  goal,
  isOnboarding,
  onGoalChange,
  onGeneratedStart,
  generateAiMealPlan,
  generationStatus,
  markGenerating,
  isAdLoaded,
  showAd,
}: GoalPageProps) {
  const navigate = useNavigate();
  // 못 불러오면 null 로 두고, 광고를 보여주는 기존 흐름대로 간다
  const [quota, setQuota] = useState<GenerationQuota | null>(null);

  useEffect(() => {
    let active = true;
    getGenerationQuota()
      .then((result) => {
        if (active) setQuota(result);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  const goalCalories = {
    lose: calculateNutritionTarget(profile, "lose").calories,
    maintain: calculateNutritionTarget(profile, "maintain").calories,
    gain: calculateNutritionTarget(profile, "gain").calories,
  };

  const doGenerate = async () => {
    onGeneratedStart();
    navigate("/result");
    await generateAiMealPlan();
  };

  return (
    <GoalSelector
      selectedGoal={goal}
      goalCalories={goalCalories}
      isOnboarding={isOnboarding}
      onGoalChange={onGoalChange}
      onNext={() => void doGenerate()}
      generationStatus={generationStatus}
      onStartGenerating={markGenerating}
      isAdLoaded={isAdLoaded}
      showAd={showAd}
      quota={quota}
    />
  );
}
