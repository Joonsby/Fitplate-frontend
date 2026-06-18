// 목표 선택 페이지 — 목표/기간 선택 후 AI 식단 생성을 시작하는 페이지
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ConfirmDialog } from "@toss/tds-mobile";
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
  const location = useLocation();
  const isFromResult = (location.state as { from?: string } | null)?.from === "/result";
  const [confirmOpen, setConfirmOpen] = useState(false);

  const goToGeneratedResult = async () => {
    onGeneratedStart();
    navigate("/result");
    await generateAiMealPlan(selectedMealPlan);
  };

  const handleNextClick = () => {
    if (isFromResult) {
      setConfirmOpen(true);
    } else {
      void goToGeneratedResult();
    }
  };

  return (
    <>
      <ConfirmDialog
        open={confirmOpen}
        title="새 식단 생성"
        description="새 식단을 생성하면 현재 저장되지 않은 식단 결과는 복구할 수 없습니다. 계속하시겠습니까?"
        confirmButton={
          <ConfirmDialog.ConfirmButton
            onClick={() => {
              setConfirmOpen(false);
              void goToGeneratedResult();
            }}
          >
            확인
          </ConfirmDialog.ConfirmButton>
        }
        cancelButton={
          <ConfirmDialog.CancelButton onClick={() => setConfirmOpen(false)}>
            취소
          </ConfirmDialog.CancelButton>
        }
        onClose={() => setConfirmOpen(false)}
      />
      <GoalSelector
        selectedGoal={goal}
        selectedDuration={planDuration}
        onBack={onBack}
        onGoalChange={onGoalChange}
        onDurationChange={onDurationChange}
        onNext={handleNextClick}
      />
    </>
  );
}
