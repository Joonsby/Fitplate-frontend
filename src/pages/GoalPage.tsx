// 목표 선택 페이지 — 목표 선택 후 AI 식단 생성을 시작하는 페이지
import { useNavigate } from "react-router-dom";
import { GoalSelector } from "../components/forms/GoalSelector";
import type {
  GenerationStatus,
  GoalType,
  MealPlan,
} from "../types/fitplate";

interface GoalPageProps {
  goal: GoalType;
  onGoalChange: (goal: GoalType) => void;
  onBack: () => void;
  onGeneratedStart: () => void;
  generateAiMealPlan: () => Promise<MealPlan | null>;
  generationStatus: GenerationStatus;
  markGenerating: () => void;
}

export function GoalPage({
  goal,
  onGoalChange,
  onBack,
  onGeneratedStart,
  generateAiMealPlan,
  generationStatus,
  markGenerating,
}: GoalPageProps) {
  const navigate = useNavigate();

  const doGenerate = async () => {
    onGeneratedStart();
    navigate("/result");
    await generateAiMealPlan();
  };

  return (
    <GoalSelector
      selectedGoal={goal}
      onBack={onBack}
      onGoalChange={onGoalChange}
      onNext={() => void doGenerate()}
      generationStatus={generationStatus}
      onStartGenerating={markGenerating}
    />
  );
}
