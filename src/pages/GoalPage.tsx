// 목표 선택 페이지 — 목표 선택 후 AI 식단 생성을 시작하는 페이지
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getGenerationQuota } from "../api/mealPlanApi";
import { getSavedMealPlans } from "../api/mealPlanStorageApi";
import { firstFreeDate, todayString } from "../utils/date";
import type { GenerationQuota } from "../api/mealPlanApi";
import { GoalSelector } from "../components/forms/GoalSelector";
import { calculateNutritionTarget } from "../utils/nutritionCalculator";
import type {
  GenerationStatus,
  GoalType,
  MealPlan,
  PlanSchedule,
  UserProfile,
} from "../types/fitplate";

interface GoalPageProps {
  profile: UserProfile;
  goal: GoalType;
  isOnboarding: boolean;
  onGoalChange: (goal: GoalType) => void;
  onGeneratedStart: () => void;
  generateAiMealPlan: (schedule?: PlanSchedule | null) => Promise<MealPlan | null>;
  // 기록 탭 등에서 날짜를 정하고 들어왔으면 그 날짜
  requestedPlanDate: string | null;
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
  requestedPlanDate,
  generationStatus,
  markGenerating,
  isAdLoaded,
  showAd,
}: GoalPageProps) {
  const navigate = useNavigate();
  // 못 불러오면 null 로 두고, 광고를 보여주는 기존 흐름대로 간다
  const [quota, setQuota] = useState<GenerationQuota | null>(null);
  const [takenDates, setTakenDates] = useState<ReadonlySet<string>>(new Set());
  const [planDate, setPlanDate] = useState<string | null>(requestedPlanDate ?? todayString());
  const [dateTouched, setDateTouched] = useState(requestedPlanDate != null);

  // 날짜가 정해진 식단을 읽어, 사용자가 고르기 전이면 비어 있는 가장 가까운 날을 기본으로 둔다
  useEffect(() => {
    let active = true;
    getSavedMealPlans()
      .then((plans) => {
        if (!active) return;
        const taken = new Set(plans.map((plan) => plan.planDate).filter((date): date is string => date != null));
        setTakenDates(taken);
        if (!dateTouched) setPlanDate(firstFreeDate(taken));
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
    // 처음 한 번만 읽는다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const doGenerate = async (replaceDate: boolean) => {
    onGeneratedStart();
    navigate("/result");
    await generateAiMealPlan({ planDate, replaceDate });
  };

  return (
    <GoalSelector
      selectedGoal={goal}
      goalCalories={goalCalories}
      isOnboarding={isOnboarding}
      onGoalChange={onGoalChange}
      onNext={(replaceDate) => void doGenerate(replaceDate)}
      planDate={planDate}
      takenDates={takenDates}
      onPlanDateChange={(next) => {
        setDateTouched(true);
        setPlanDate(next);
      }}
      generationStatus={generationStatus}
      onStartGenerating={markGenerating}
      isAdLoaded={isAdLoaded}
      showAd={showAd}
      quota={quota}
    />
  );
}
