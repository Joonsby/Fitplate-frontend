import { useEffect, useState } from "react";
import { useToast } from "../hooks/useToast";
import { useNavigate, useLocation } from "react-router-dom";
import { ResultScreen } from "../components/screens/ResultScreen";
import { toggleFavoriteFood } from "../api/favoriteFoodsApi";
import { saveMealPlan } from "../api/mealPlanStorageApi";
import { HttpError } from "../api/httpClient";
import { extractAiResponseFromMealPlan } from "../utils/mealPlanMerger";
import type {
  FavoriteFood,
  GoalType,
  MealFood,
  MealPlan,
  NutritionTarget,
  ResultSnapshot,
  SavedMealPlan,
  UserProfile,
} from "../types/fitplate";

const EMPTY_MEAL_PLAN: MealPlan = {
  id: "empty",
  targetCalories: 0,
  durationDays: 0,
  averageCalories: 0,
  days: [],
};

interface ResultPageProps {
  profile: UserProfile;
  goal: GoalType;
  nutritionTarget: NutritionTarget;
  viewingSavedMealPlan: SavedMealPlan | null;
  favoriteFoods: FavoriteFood[];
  setFavoriteFoods: React.Dispatch<React.SetStateAction<FavoriteFood[]>>;
  resultSnapshot: ResultSnapshot | null;
  aiError: string | null;
  isAiLoading: boolean;
  generateAiMealPlan: () => Promise<MealPlan | null>;
  isSaved: boolean;
  onSaved: () => void;
  onBack: () => void;
}

type ResultSource = "savedMealPlan" | "favoriteFood";

export function ResultPage({
  profile,
  goal,
  nutritionTarget,
  viewingSavedMealPlan,
  favoriteFoods,
  setFavoriteFoods,
  resultSnapshot,
  aiError,
  isAiLoading,
  generateAiMealPlan,
  isSaved,
  onSaved,
  onBack,
}: ResultPageProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast, toastElement } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // source는 navigate() 호출 시 state로 주입되며, 히스토리 엔트리별로 독립적으로 관리됨.
  // 뒤로가기로 진입하면 해당 엔트리의 state를 읽으므로 source가 없어 session으로 분기됨.
  const source = (location.state as { source?: ResultSource } | null)?.source;
  const isSavedView = source === "savedMealPlan" || source === "favoriteFood";
  const dbData = isSavedView ? viewingSavedMealPlan : null;

  const resultProfile = dbData?.profile ?? resultSnapshot?.profile ?? profile;
  const resultGoal = dbData?.goal ?? resultSnapshot?.goal ?? goal;
  const resultTarget = dbData?.target ?? resultSnapshot?.nutritionTarget ?? nutritionTarget;
  const resultMealPlan = dbData?.mealPlan ?? resultSnapshot?.mealPlan ?? EMPTY_MEAL_PLAN;

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
        showToast(`${food.name}을 즐겨찾는 음식에 추가하였습니다.`, "success");
      } else {
        setFavoriteFoods((current) =>
          current.filter((f) => f.name !== food.name),
        );
        showToast(`${food.name}을 즐겨찾는 음식에서 삭제하였습니다.`, "error");
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

  const handleSaveMealPlan = async () => {
    setIsSaving(true);
    const aiMealPlanResponse = extractAiResponseFromMealPlan(resultMealPlan);
    try {
      await saveMealPlan({
        profile: resultProfile,
        goal: resultGoal,
        target: resultTarget,
        aiMealPlanResponse,
      });
      onSaved();
      showToast("식단이 저장되었습니다.", "success");
    } catch (error) {
      if (error instanceof HttpError && error.status === 409) {
        showToast("이미 저장된 식단입니다.", "error");
      } else {
        showToast(
          error instanceof Error ? error.message : "식단 저장 중 알 수 없는 오류가 발생했습니다.",
          "error",
        );
      }
    } finally {
      setIsSaving(false);
    }
  };

  const hasSessionData = resultSnapshot != null;
  const showEmptyState = !isSavedView && !hasSessionData && !isAiLoading;
  const sessionAiError = !isSavedView ? (resultSnapshot?.aiError ?? null) : null;
  const effectiveAiError = aiError ?? sessionAiError;

  return (
    <>
      {toastElement}
      <ResultScreen
        aiError={effectiveAiError}
        favoriteFoods={favoriteFoods}
        goal={resultGoal}
        isAiLoading={isAiLoading}
        isSavedView={isSavedView}
        mealPlan={resultMealPlan}
        profile={resultProfile}
        savedAt={dbData?.savedAt}
        target={resultTarget}
        showEmptyState={showEmptyState}
        onFavoriteFoodToggle={handleToggleFavoriteFood}
        isSaved={isSaved}
        isSaving={isSaving}
        onRetryAiGenerate={() => void generateAiMealPlan()}
        onSaveMealPlan={handleSaveMealPlan}
        onBack={onBack}
        onGoalReselect={() => navigate("/goal", { state: { from: "/result" } })}
        onRestart={() => navigate("/")}
      />
    </>
  );
}
