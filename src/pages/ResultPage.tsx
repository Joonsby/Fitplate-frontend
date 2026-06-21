import { useToast } from "../hooks/useToast";
import { useNavigate, useLocation } from "react-router-dom";
import { ResultScreen } from "../components/screens/ResultScreen";
import { toggleFavoriteFood } from "../api/favoriteFoodsApi";
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

interface ResultPageProps {
  profile: UserProfile;
  goal: GoalType;
  nutritionTarget: NutritionTarget;
  selectedMealPlan: MealPlan;
  viewingSavedMealPlan: SavedMealPlan | null;
  favoriteFoods: FavoriteFood[];
  setFavoriteFoods: React.Dispatch<React.SetStateAction<FavoriteFood[]>>;
  resultSnapshot: ResultSnapshot | null;
  aiError: string | null;
  isAiLoading: boolean;
  generateAiMealPlan: (mealPlan: MealPlan) => Promise<MealPlan | null>;
  onBack: () => void;
}

type ResultSource = "savedMealPlan" | "favoriteFood";

export function ResultPage({
  profile,
  goal,
  nutritionTarget,
  selectedMealPlan,
  viewingSavedMealPlan,
  favoriteFoods,
  setFavoriteFoods,
  resultSnapshot,
  aiError,
  isAiLoading,
  generateAiMealPlan,
  onBack,
}: ResultPageProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast, toastElement } = useToast();

  // source는 navigate() 호출 시 state로 주입되며, 히스토리 엔트리별로 독립적으로 관리됨.
  // 뒤로가기로 진입하면 해당 엔트리의 state를 읽으므로 source가 없어 session으로 분기됨.
  const source = (location.state as { source?: ResultSource } | null)?.source;
  const isSavedView = source === "savedMealPlan" || source === "favoriteFood";
  const dbData = isSavedView ? viewingSavedMealPlan : null;

  const resultProfile = dbData?.profile ?? resultSnapshot?.profile ?? profile;
  const resultGoal = dbData?.goal ?? resultSnapshot?.goal ?? goal;
  const resultTarget = dbData?.target ?? resultSnapshot?.nutritionTarget ?? nutritionTarget;
  const resultMealPlan = dbData?.mealPlan ?? resultSnapshot?.mealPlan ?? selectedMealPlan;  

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
        onRetryAiGenerate={() => void generateAiMealPlan(resultMealPlan)}
        onBack={onBack}
        onGoalReselect={() => navigate("/goal", { state: { from: "/result" } })}
        onRestart={() => navigate("/")}
      />
    </>
  );
}