// 목표 선택 페이지 — 목표 선택 후 AI 식단 생성을 시작하는 페이지
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ConfirmDialog } from "@toss/tds-mobile";
import { GoalSelector } from "../components/forms/GoalSelector";
import type {
  GenerationStatus,
  GoalType,
  MealPlan,
  ResultSnapshot,
} from "../types/fitplate";

interface GoalPageProps {
  goal: GoalType;
  onGoalChange: (goal: GoalType) => void;
  onBack: () => void;
  onGeneratedStart: () => void;
  generateAiMealPlan: () => Promise<MealPlan | null>;
  generationStatus: GenerationStatus;
  markGenerating: () => void;
  resultSnapshot: ResultSnapshot | null;
  isSaved: boolean;
}

export function GoalPage({
  goal,
  onGoalChange,
  onBack,
  onGeneratedStart,
  generateAiMealPlan,
  generationStatus,
  markGenerating,
  resultSnapshot,
  isSaved,
}: GoalPageProps) {
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const doGenerate = async () => {
    onGeneratedStart();
    navigate("/result");
    await generateAiMealPlan();
  };

  const handleNext = () => {
    const hasAiData =
      resultSnapshot != null &&
      resultSnapshot.mealPlan.days.length > 0 &&
      resultSnapshot.mealPlan.days[0].meals[0]?.name != null;

    if (hasAiData && !isSaved) {
      setConfirmOpen(true);
      return;
    }

    void doGenerate();
  };

  return (
    <>
      <ConfirmDialog
        open={confirmOpen}
        title={<ConfirmDialog.Title>새 식단 생성</ConfirmDialog.Title>}
        description={
          <ConfirmDialog.Description>
            {'저장되지 않은 현재 식단은 사라집니다.\n새로운 식단을 생성하시겠습니까?'}
          </ConfirmDialog.Description>
        }
        cancelButton={<ConfirmDialog.CancelButton onClick={() => setConfirmOpen(false)}>취소</ConfirmDialog.CancelButton>}
        confirmButton={<ConfirmDialog.ConfirmButton onClick={() => { setConfirmOpen(false); void doGenerate(); }}>생성</ConfirmDialog.ConfirmButton>}
        onClose={() => setConfirmOpen(false)}
      />
      <GoalSelector
        selectedGoal={goal}
        onBack={onBack}
        onGoalChange={onGoalChange}
        onNext={handleNext}
        generationStatus={generationStatus}
        onStartGenerating={markGenerating}
      />
    </>
  );
}
