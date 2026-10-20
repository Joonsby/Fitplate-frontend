// 목표 선택 페이지 — 목표 선택 후 AI 식단 생성을 시작하는 페이지
import { useNavigate } from "react-router-dom";
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
}: GoalPageProps) {
  const navigate = useNavigate();

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
    />
  );
}
