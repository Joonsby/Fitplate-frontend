import { useNavigate } from "react-router-dom";
import { GoalSelector } from "../components/GoalSelector";
import type {
  AIMealPlanResponse,
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
  generateAiMealPlan: (
    mealPlan: MealPlan,
    target: NutritionTarget,
  ) => Promise<AIMealPlanResponse | null>;
}

export function GoalPage({
  goal,
  planDuration,
  selectedMealPlan,
  nutritionTarget,
  onGoalChange,
  onDurationChange,
  onBack,
  onGeneratedStart,
  generateAiMealPlan,
}: GoalPageProps) {
  const navigate = useNavigate();

  const goToGeneratedResult = async () => {
    onGeneratedStart();
    navigate("/result");

    await generateAiMealPlan(selectedMealPlan, nutritionTarget);
  };

  return (
    <GoalSelector
      selectedGoal={goal}
      selectedDuration={planDuration}
      onBack={onBack}
      onGoalChange={onGoalChange}
      onDurationChange={onDurationChange}
      onNext={goToGeneratedResult}
    />
  );
}