import { useState } from "react";
import { Toast } from "@toss/tds-mobile";
import { useNavigate } from "react-router-dom";
import { ResultScreen } from "../components/ResultScreen";
import {
  addMealPlanFavorite,
  createSavedMealPlan,
  deleteMealPlanFavorite,
} from "../api/mealPlanStorageApi";
import type {
  AIMealPlanResponse,
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
  durationDays: PlanDuration;
  nutritionTarget: NutritionTarget;
  selectedMealPlan: MealPlan;
  viewingSavedMealPlan: SavedMealPlan | null;
  favoriteFoods: FavoriteFood[];
  setFavoriteFoods: React.Dispatch<React.SetStateAction<FavoriteFood[]>>;
  setSavedMealPlans: React.Dispatch<React.SetStateAction<SavedMealPlan[]>>;
  resultSnapshot: ResultSnapshot | null;
  aiResponse: AIMealPlanResponse | null;
  aiError: string | null;
  isAiLoading: boolean;
  generateAiMealPlan: (
    mealPlan: MealPlan,
  ) => Promise<AIMealPlanResponse | null>;
  onBack: () => void;
}

export function ResultPage({
  profile,
  goal,
  durationDays,
  nutritionTarget,
  selectedMealPlan,
  viewingSavedMealPlan,
  favoriteFoods,
  setFavoriteFoods,
  setSavedMealPlans,
  resultSnapshot,
  aiResponse,
  aiError,
  isAiLoading,
  generateAiMealPlan,
  onBack,
}: ResultPageProps) {
  const navigate = useNavigate();
  const [toastOpen, setToastOpen] = useState(false);
  const [toastText, setToastText] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "info">("info");

  const showToast = (text: string, type: "success" | "error" | "info" = "info") => {
    setToastText(text);
    setToastType(type);
    setToastOpen(true);
  };

  // 저장된 식단 보기 → viewingSavedMealPlan 우선, 신선한 결과 → sessionStorage 스냅샷 우선, 최후 fallback → React 상태
  const resultProfile = viewingSavedMealPlan?.profile ?? resultSnapshot?.profile ?? profile;
  const resultGoal = viewingSavedMealPlan?.goal ?? resultSnapshot?.goal ?? goal;
  const resultTarget = viewingSavedMealPlan?.target ?? resultSnapshot?.nutritionTarget ?? nutritionTarget;
  const resultMealPlan = viewingSavedMealPlan?.mealPlan ?? resultSnapshot?.mealPlan ?? selectedMealPlan;
  const resultAiResponse =
    viewingSavedMealPlan?.aiResponse ?? aiResponse;

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
        durationDays,
        mealPlan: resultMealPlan,
        aiResponse: resultAiResponse ?? undefined,
      });

      setSavedMealPlans((currentSavedMealPlans) => [
        savedMealPlan,
        ...currentSavedMealPlans.filter((plan) => plan.id !== savedMealPlan.id),
      ]);

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
    const id = viewingSavedMealPlan?.id ?? resultMealPlan.id;

    const existingFavoriteFood = favoriteFoods.find(
      (favoriteFood) => favoriteFood.name === food.name,
    );

    try {
      if (existingFavoriteFood != null) {
        await deleteMealPlanFavorite(id);

        setFavoriteFoods((currentFavoriteFoods) =>
          currentFavoriteFoods.filter(
            (favoriteFood) => favoriteFood.name !== food.name,
          ),
        );

        return;
      }

      const favoriteFood = await addMealPlanFavorite({ id, food });

      setFavoriteFoods((currentFavoriteFoods) => [
        favoriteFood,
        ...currentFavoriteFoods.filter(
          (currentFavoriteFood) => currentFavoriteFood.name !== food.name,
        ),
      ]);
    } catch (error) {
      console.error("즐겨찾기 변경 실패:", error);
      alert(
        error instanceof Error
          ? error.message
          : "즐겨찾기 변경 중 알 수 없는 오류가 발생했습니다.",
      );
    }
  };

  return (
    <>
      <Toast
        position="top"
        open={toastOpen}
        text={toastText}
        leftAddon={
          toastType === "success"
            ? <Toast.Lottie src="https://static.toss.im/lotties-common/check-green-spot.json" />
            : toastType === "error"
            ? <Toast.Icon name="icon-dynamicIntelli-X-red" />
            : undefined
        }
        duration={3000}
        onClose={() => setToastOpen(false)}
      />
      <ResultScreen
      aiError={aiError}
      aiResponse={resultAiResponse}
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
      onRestart={() => navigate("/")}
    />
    </>
  );
}