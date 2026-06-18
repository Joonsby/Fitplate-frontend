import { useState } from "react";
import { useToast } from "../hooks/useToast";
import { useNavigate } from "react-router-dom";
import { ConfirmDialog } from "@toss/tds-mobile";
import { ResultScreen } from "../components/screens/ResultScreen";
import { createSavedMealPlan } from "../api/mealPlanStorageApi";
import { toggleFavoriteFood } from "../api/favoriteFoodsApi";
import type {
  FavoriteFood,
  GoalType,
  MealFood,
  MealPlan,
  NutritionTarget,
  PlanDuration,
  ResultSnapshot,
  SavedMealPlan,
  UserProfile,
} from "../types/fitplate";

interface ResultPageProps {
  profile: UserProfile;
  goal: GoalType;
  planDuration: PlanDuration;
  nutritionTarget: NutritionTarget;
  selectedMealPlan: MealPlan;
  viewingSavedMealPlan: SavedMealPlan | null;
  favoriteFoods: FavoriteFood[];
  setFavoriteFoods: React.Dispatch<React.SetStateAction<FavoriteFood[]>>;
  setSavedMealPlans: React.Dispatch<React.SetStateAction<SavedMealPlan[]>>;
  resultSnapshot: ResultSnapshot | null;
  aiError: string | null;
  isAiLoading: boolean;
  isMealPlanSaved: boolean;
  setIsMealPlanSaved: React.Dispatch<React.SetStateAction<boolean>>;
  generateAiMealPlan: (mealPlan: MealPlan) => Promise<MealPlan | null>;
  onBack: () => void;
}

export function ResultPage({
  profile,
  goal,
  planDuration,
  nutritionTarget,
  selectedMealPlan,
  viewingSavedMealPlan,
  favoriteFoods,
  setFavoriteFoods,
  setSavedMealPlans,
  resultSnapshot,
  aiError,
  isAiLoading,
  isMealPlanSaved,
  setIsMealPlanSaved,
  generateAiMealPlan,
  onBack,
}: ResultPageProps) {
  const navigate = useNavigate();
  const { showToast, toastElement } = useToast();
  const [confirmRestartOpen, setConfirmRestartOpen] = useState(false);

  // 저장된 식단 보기 → viewingSavedMealPlan 우선, 신선한 결과 → 스냅샷 우선, 최후 fallback → React 상태
  const resultProfile = viewingSavedMealPlan?.profile ?? resultSnapshot?.profile ?? profile;
  const resultGoal = viewingSavedMealPlan?.goal ?? resultSnapshot?.goal ?? goal;
  const resultTarget = viewingSavedMealPlan?.target ?? resultSnapshot?.nutritionTarget ?? nutritionTarget;
  const resultMealPlan = viewingSavedMealPlan?.mealPlan ?? resultSnapshot?.mealPlan ?? selectedMealPlan;

  const handleSaveMealPlan = async () => {
    if (viewingSavedMealPlan != null) {
      showToast("이미 저장된 식단입니다.");
      return;
    }

    try {
      const savedMealPlan = await createSavedMealPlan({
        profile: resultProfile,
        goal: resultGoal,
        target: resultTarget,
        planDuration,
        mealPlan: resultMealPlan,
      });

      setSavedMealPlans((currentSavedMealPlans) => [
        savedMealPlan,
        ...currentSavedMealPlans.filter((plan) => plan.id !== savedMealPlan.id),
      ]);

      setIsMealPlanSaved(true);
      showToast("식단을 저장했습니다.", "success");
    } catch (error) {
      console.error("식단 저장 실패:", error);
      showToast(
        error instanceof Error
          ? error.message
          : "식단 저장 중 알 수 없는 오류가 발생했습니다.",
        "error",
      );
    }
  };

  const handleToggleFavoriteFood = async (food: MealFood) => {
    try {
      const result = await toggleFavoriteFood(food);

      if (result.action === "ADDED") {
        const now = new Date().toISOString();
        setFavoriteFoods((current) => [
          {
            favoriteFoodId: result.favoriteFoodId,
            name: food.name,
            amount: food.amount,
            calories: food.calories,
            carbohydrate: food.carbohydrate ?? 0,
            protein: food.protein ?? 0,
            fat: food.fat ?? 0,
            shoppingCategory: food.shoppingCategory,
            shoppingKeyword: food.shoppingKeyword ?? "",
            sourceFoodId: food.id,
            createdAt: now,
          },
          ...current.filter((f) => f.name !== food.name),
        ]);
      } else {
        setFavoriteFoods((current) =>
          current.filter((f) => f.name !== food.name),
        );
      }
    } catch (error) {
      console.error("즐겨찾기 변경 실패:", error);
      showToast(
        error instanceof Error
          ? error.message
          : "즐겨찾기 변경 중 알 수 없는 오류가 발생했습니다.",
        "error",
      );
    }
  };

  return (
    <>
      {toastElement}
      <ConfirmDialog
        open={confirmRestartOpen}
        title="처음부터 시작"
        description="처음부터 다시 시작하면 저장하지 않은 현재 식단 결과는 복구할 수 없습니다. 계속하시겠습니까?"
        confirmButton={
          <ConfirmDialog.ConfirmButton
            onClick={() => {
              setConfirmRestartOpen(false);
              setIsMealPlanSaved(false);
              navigate("/");
            }}
          >
            확인
          </ConfirmDialog.ConfirmButton>
        }
        cancelButton={
          <ConfirmDialog.CancelButton onClick={() => setConfirmRestartOpen(false)}>
            취소
          </ConfirmDialog.CancelButton>
        }
        onClose={() => setConfirmRestartOpen(false)}
      />
      <ResultScreen
      aiError={aiError}
      favoriteFoods={favoriteFoods}
      goal={resultGoal}
      isAiLoading={isAiLoading}
      isSavedView={viewingSavedMealPlan != null}
      mealPlan={resultMealPlan}
      profile={resultProfile}
      savedAt={viewingSavedMealPlan?.savedAt}
      target={resultTarget}
      onLoginRequired={() => showToast("로그인 기능은 아직 구현되지 않았습니다.")}
      onSaveMealPlan={handleSaveMealPlan}
      onFavoriteFoodToggle={handleToggleFavoriteFood}
      onRetryAiGenerate={() =>
        void generateAiMealPlan(resultMealPlan)
      }
      onBack={onBack}
      onGoalReselect={() => navigate("/goal", { state: { from: "/result" } })}
      onRestart={() => {
        if (isMealPlanSaved) {
          setIsMealPlanSaved(false);
          navigate("/");
        } else {
          setConfirmRestartOpen(true);
        }
      }}
    />
    </>
  );
}