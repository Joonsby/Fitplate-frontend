import { useNavigate } from "react-router-dom";
import { GoalSelector } from "../components/GoalSelector";
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

  const goToGeneratedResult = async () => {
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
      onNext={goToGeneratedResult}
    />
  );
}