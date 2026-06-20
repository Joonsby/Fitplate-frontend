// 목표 선택 페이지 — 목표/기간 선택 후 AI 식단 생성을 시작하는 페이지
import { useNavigate } from "react-router-dom";
import { GoalSelector } from "../components/forms/GoalSelector";
import type {
  GoalType,
  MealPlan,
  NutritionTarget,
  PlanDuration,
} from "../types/fitplate";

interface GoalPageProps {
  goal: GoalType;
  planDuration: PlanDuration;
  selectedMealPlan: MealPlan;
  nutritionTarget: NutritionTarget;
  onGoalChange: (goal: GoalType) => void;
  onDurationChange: (duration: PlanDuration) => void;
  onBack: () => void;
  onGeneratedStart: () => void;
  generateAiMealPlan: (mealPlan: MealPlan) => Promise<MealPlan | null>;
}

export function GoalPage({
  goal,
  planDuration,
  selectedMealPlan,
  onGoalChange,
  onDurationChange,
  onBack,
  onGeneratedStart,
  generateAiMealPlan,
}: GoalPageProps) {
  const navigate = useNavigate();

  const handleNext = async () => {
    onGeneratedStart();
    navigate("/result");
    await generateAiMealPlan(selectedMealPlan);
  };

  return (
    <GoalSelector
      selectedGoal={goal}
      selectedDuration={planDuration}
      onBack={onBack}
      onGoalChange={onGoalChange}
      onDurationChange={onDurationChange}
      onNext={() => void handleNext()}
    />
  );
}
