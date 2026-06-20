import { useToast } from "../hooks/useToast";
import { useNavigate } from "react-router-dom";
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
  const { showToast, toastElement } = useToast();

  // 저장된 식단 보기 → viewingSavedMealPlan 우선, 신선한 결과 → 스냅샷 우선, 최후 fallback → React 상태
  const resultProfile = viewingSavedMealPlan?.profile ?? resultSnapshot?.profile ?? profile;
  const resultGoal = viewingSavedMealPlan?.goal ?? resultSnapshot?.goal ?? goal;
  const resultTarget = viewingSavedMealPlan?.target ?? resultSnapshot?.nutritionTarget ?? nutritionTarget;
  const resultMealPlan = viewingSavedMealPlan?.mealPlan ?? resultSnapshot?.mealPlan ?? selectedMealPlan;  

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

  return (
    <>
      {toastElement}
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
      onFavoriteFoodToggle={handleToggleFavoriteFood}
      onRetryAiGenerate={() =>
        void generateAiMealPlan(resultMealPlan)
      }
      onBack={onBack}
      onGoalReselect={() => navigate("/goal", { state: { from: "/result" } })}
      onRestart={() => navigate("/")}
    />
    </>
  );
}