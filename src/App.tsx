import { useState } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { Button, Top } from "@toss/tds-mobile";
import "./App.css";
import logoImage from "./assets/images/logo.png";
import { FavoriteFoodsScreen } from "./components/FavoriteFoodsScreen";
import { GoalSelector } from "./components/GoalSelector";
import { ResultScreen } from "./components/ResultScreen";
import { SavedMealPlansScreen } from "./components/SavedMealPlansScreen";
import { UserProfileForm } from "./components/UserProfileForm";
import { useAiMealPlan } from "./hooks/useAiMealPlan";
import {
  addMealPlanFavorite,
  createSavedMealPlan,
  deleteMealPlanFavorite,
  deleteSavedMealPlanById,
} from "./api/mealPlanStorageApi";
import type {
  FavoriteFood,
  GoalType,
  MealFood,
  PlanDuration,
  SavedMealPlan,
  UserProfile,
} from "./types/fitplate";
import { selectClosestMealPlan } from "./utils/mealPlanSelector";
import { calculateNutritionTarget } from "./utils/nutritionCalculator";


function App() {

  // 신체정보 입력값을 저장하는 state입니다.
  // 아직 프로필 조회 API가 없어서 브라우저 메모리에만 보관됩니다.
  const [profile] = useState<UserProfile>({
    heightCm: 170,
    weightKg: 68,
    age: 30,
    gender: "male",
  });

  // 목표 선택값을 저장하는 state입니다.
  const [goal, setGoal] = useState<GoalType>("maintain");

  // 결과 화면에서 선택하는 식단 기간입니다.
  const [planDuration, setPlanDuration] = useState<PlanDuration>(3);

  const [savedMealPlans, setSavedMealPlans] =
    useState<SavedMealPlan[]>([]);

  const [favoriteFoods, setFavoriteFoods] = useState<FavoriteFood[]>([]);

  // 저장 목록에서 "다시 보기"를 누른 식단입니다.
  const [viewingSavedMealPlan, setViewingSavedMealPlan] =
    useState<SavedMealPlan | null>(null);

    // 결과 화면에서 보여줄 칼로리와 탄단지 계산값입니다.
  const nutritionTarget = calculateNutritionTarget(profile, goal);

  // 목표 칼로리와 선택 기간에 가장 가까운 기간 식단을 선택합니다.
  const selectedMealPlan = selectClosestMealPlan(
    nutritionTarget.calories,
    planDuration,
  );

  const {
    aiMealPlanResponse,
    isAiLoading,
    aiError,
    generateAiMealPlan,
    resetAiMealPlan,
    restoreAiMealPlan,
  } = useAiMealPlan({ profile, goal });

  const navigate = useNavigate();

  const location = useLocation();

  const isResultPage = location.pathname === "/result";

  const resultMealPlanId = location.pathname.startsWith("/result/")
  ? location.pathname.replace("/result/", "")
  : null;

  const routeSavedMealPlan =
  resultMealPlanId == null
    ? null
    : savedMealPlans.find((plan) => plan.id === resultMealPlanId) ?? null;

  const goToGeneratedResult = async () => {
    setViewingSavedMealPlan(null);
    navigate("/result");    

    await generateAiMealPlan(selectedMealPlan, nutritionTarget);
  };

  const goToSavedPlans = () => {
    setViewingSavedMealPlan(null);
    resetAiMealPlan();
    navigate("/saved-plans");
  };

  const goToFavoriteFoods = () => {
    setViewingSavedMealPlan(null);
    resetAiMealPlan();
    navigate("/favorite-foods");
  };

  const handleSaveMealPlan = async () => {
    if (viewingSavedMealPlan != null) {
      alert("이미 저장된 식단입니다.");
      return;
    }

    try {
      const savedMealPlan = await createSavedMealPlan({
        profile: resultProfile,
        goal: resultGoal,
        target: resultTarget,
        planDuration,
        mealPlan: resultMealPlan,
        aiMealPlanResponse: resultAiMealPlanResponse ?? undefined,
      });

      setSavedMealPlans((currentSavedMealPlans) => [
        savedMealPlan,
        ...currentSavedMealPlans.filter((plan) => plan.id !== savedMealPlan.id),
      ]);
    } catch (error) {
      console.error("식단 저장 실패:", error);
      alert(
        error instanceof Error
          ? error.message
          : "식단 저장 중 알 수 없는 오류가 발생했습니다.",
      );
    }
  };

  const handleDeleteSavedMealPlan = async (id: string) => {
    try {
      await deleteSavedMealPlanById(id);
    } catch (error) {
      console.error("식단 삭제 실패:", error);
      alert(
        error instanceof Error
          ? error.message
          : "식단 삭제 중 알 수 없는 오류가 발생했습니다.",
      );
      return;
    }

    setSavedMealPlans((currentSavedMealPlans) =>
      currentSavedMealPlans.filter((savedMealPlan) => savedMealPlan.id !== id),
    );

    if (viewingSavedMealPlan?.id === id) {
      setViewingSavedMealPlan(null);
    }
  };

  const handleViewSavedMealPlan = (savedMealPlan: SavedMealPlan) => {
    setViewingSavedMealPlan(savedMealPlan);
    restoreAiMealPlan(savedMealPlan.aiMealPlanResponse ?? null);
    navigate(`/result/${savedMealPlan.id}`);
  };

  const handleToggleFavoriteFood = async (food: MealFood) => {
    const mealPlanId = activeSavedMealPlan?.id ?? resultMealPlan.id;
    const existingFavoriteFood = favoriteFoods.find(
      (favoriteFood) => favoriteFood.name === food.name,
    );

    try {
      if (existingFavoriteFood != null) {
        await deleteMealPlanFavorite(mealPlanId);
        setFavoriteFoods((currentFavoriteFoods) =>
          currentFavoriteFoods.filter(
            (favoriteFood) => favoriteFood.name !== food.name,
          ),
        );
        return;
      }

      const favoriteFood = await addMealPlanFavorite({ mealPlanId, food });

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

  const handleDeleteFavoriteFood = async (id: string) => {
    const mealPlanId = id.includes(":") ? id.split(":")[0] : resultMealPlan.id;

    try {
      await deleteMealPlanFavorite(mealPlanId);
    } catch (error) {
      console.error("즐겨찾기 삭제 실패:", error);
      alert(
        error instanceof Error
          ? error.message
          : "즐겨찾기 삭제 중 알 수 없는 오류가 발생했습니다.",
      );
      return;
    }

    setFavoriteFoods((currentFavoriteFoods) =>
      currentFavoriteFoods.filter((favoriteFood) => favoriteFood.id !== id),
    );
  };

  const onBack = () => {
    navigate(-1);
  }

  const activeSavedMealPlan = viewingSavedMealPlan ?? routeSavedMealPlan;
  const resultProfile = activeSavedMealPlan?.profile ?? profile;
  const resultGoal = activeSavedMealPlan?.goal ?? goal;
  const resultTarget = activeSavedMealPlan?.target ?? nutritionTarget;
  const resultMealPlan = activeSavedMealPlan?.mealPlan ?? selectedMealPlan;
  const resultAiMealPlanResponse = activeSavedMealPlan?.aiMealPlanResponse ?? aiMealPlanResponse;
  const resultScreen = (
    <ResultScreen
      aiError={aiError}
      aiMealPlanResponse={resultAiMealPlanResponse}
      favoriteFoods={favoriteFoods}
      goal={resultGoal}
      isAiLoading={isAiLoading}
      isSavedView={activeSavedMealPlan != null}
      mealPlan={resultMealPlan}
      profile={resultProfile}
      savedAt={activeSavedMealPlan?.savedAt}
      target={resultTarget}
      onLoginRequired={() => alert("로그인 기능은 아직 구현되지 않았습니다.")}
      onSaveMealPlan={() => void handleSaveMealPlan()}
      onFavoriteFoodToggle={handleToggleFavoriteFood}
      onRetryAiGenerate={() =>
        void generateAiMealPlan(resultMealPlan, resultTarget)
      }
      onBack={onBack}
      onRestart={() => {navigate("/")}}
    />
  );

  return (
    <main className="appShell">
      <Top
        title={
          <div className="appTopTitle">
            <img className="appLogo" src={logoImage} alt="fitplate" />
          </div>
        }
        subtitleBottom={
          <div className="appTopSubtitle">
            신체정보와 목표로 하루 식단 기준을 확인하세요
          </div>
        }
      />
      {!(isResultPage && isAiLoading) && (
        <div className="topShortcutGrid">
          <Button color="primary" variant="weak" onClick={goToSavedPlans}>
            저장된 식단
          </Button>
          <Button color="primary" variant="weak" onClick={goToFavoriteFoods}>
            즐겨찾기 음식
          </Button>
        </div>
      )}      
      <Routes>
        <Route
          path="/"
          element={
            <UserProfileForm
              profile={profile}
              onNext={() => navigate("/goal")}
            />
          }
        />

        <Route
          path="/goal"
          element={
            <GoalSelector
              selectedGoal={goal}
              selectedDuration={planDuration}
              onBack={onBack}
              onGoalChange={setGoal}
              onDurationChange={setPlanDuration}
              onNext={goToGeneratedResult}
            />
          }
        />

        <Route path="/result" element={resultScreen} />

        <Route
          path="/result/:mealPlanId"
          element={resultScreen}
        />

        <Route
          path="/saved-plans"
          element={
            <SavedMealPlansScreen
              savedMealPlans={savedMealPlans}
              onBack={onBack}
              onDelete={handleDeleteSavedMealPlan}
              onView={handleViewSavedMealPlan}
            />
          }
        />

        <Route
          path="/favorite-foods"
          element={
            <FavoriteFoodsScreen
              favoriteFoods={favoriteFoods}
              onBack={onBack}
              onDelete={handleDeleteFavoriteFood}
            />
          }
        />
      </Routes>      
    </main>
  );
}

export default App;
