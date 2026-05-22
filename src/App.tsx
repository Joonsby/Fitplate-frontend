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
import type {
  FavoriteFood,
  GoalType,
  MealFood,
  PlanDuration,
  SavedMealPlan,
  UserProfile,
} from "./types/fitplate";
import {
  deleteFavoriteFood,
  getFavoriteFoods,
  sortFavoriteFoods,
  toggleFavoriteFood,
} from "./utils/favoriteFoodStorage";
import { selectClosestMealPlan } from "./utils/mealPlanSelector";
import { calculateNutritionTarget } from "./utils/nutritionCalculator";
import {
  deleteSavedMealPlan,
  getSavedMealPlans,
  saveMealPlan,
} from "./utils/savedMealPlanStorage";


function App() {

  // 신체정보 입력값을 저장하는 state입니다.
  // API, DB, localStorage 없이 브라우저 메모리에만 보관됩니다.
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

  // localStorage에서 읽어온 저장 식단 목록입니다.
  const [savedMealPlans, setSavedMealPlans] =
    useState<SavedMealPlan[]>(getSavedMealPlans);

  // localStorage에서 읽어온 즐겨찾기 음식 목록입니다.
  const [favoriteFoods, setFavoriteFoods] = useState<FavoriteFood[]>(() =>
    sortFavoriteFoods(getFavoriteFoods()),
  );

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

    const response = await generateAiMealPlan(selectedMealPlan, nutritionTarget);

    const nextSavedMealPlans = saveMealPlan({
      profile,
      goal,
      target: nutritionTarget,
      planDuration,
      mealPlan: selectedMealPlan,
      aiMealPlanResponse: response ?? undefined,
    });

    const latestSavedMealPlan = nextSavedMealPlans[0];

    navigate(`/result/${latestSavedMealPlan.id}`);


    setSavedMealPlans(nextSavedMealPlans);
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

  const handleDeleteSavedMealPlan = (id: string) => {
    const nextSavedMealPlans = deleteSavedMealPlan(id);

    setSavedMealPlans(nextSavedMealPlans);

    if (viewingSavedMealPlan?.id === id) {
      setViewingSavedMealPlan(null);
    }
  };

  const handleViewSavedMealPlan = (savedMealPlan: SavedMealPlan) => {
    setViewingSavedMealPlan(savedMealPlan);
    restoreAiMealPlan(savedMealPlan.aiMealPlanResponse ?? null);
    navigate(`/result/${savedMealPlan.id}`);
  };

  const handleToggleFavoriteFood = (food: MealFood) => {
    setFavoriteFoods(toggleFavoriteFood(food));
  };

  const handleDeleteFavoriteFood = (id: string) => {
    setFavoriteFoods(deleteFavoriteFood(id));
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

        <Route
          path="/result/:mealPlanId"
          element={
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
              onSaveMealPlan={() => {
                if (viewingSavedMealPlan) {
                  alert("이미 저장된 식단입니다.");
                  return;
                }
              }}
              onFavoriteFoodToggle={handleToggleFavoriteFood}
              onRetryAiGenerate={() =>
                void generateAiMealPlan(resultMealPlan, resultTarget)
              }
              onBack={onBack}
              onRestart={() => {navigate("/")}}          
            />
          }
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
