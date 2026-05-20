import { Button, Top } from "@toss/tds-mobile";
import { useState } from "react";
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

type Step = "profile" | "goal" | "result" | "savedPlans" | "favoriteFoods";

function App() {
  // 현재 어떤 화면을 보여줄지 관리하는 state입니다.
  // 별도 라우터나 상태관리 라이브러리 없이 MVP 흐름만 단순하게 처리합니다.
  const [step, setStep] = useState<Step>("profile");

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

  const goToGeneratedResult = async () => {
    setViewingSavedMealPlan(null);
    setStep("result");

    const response = await generateAiMealPlan(selectedMealPlan, nutritionTarget);

    const nextSavedMealPlans = saveMealPlan({
      profile,
      goal,
      target: nutritionTarget,
      planDuration,
      mealPlan: selectedMealPlan,
      aiMealPlanResponse: response ?? undefined,
    });

    setSavedMealPlans(nextSavedMealPlans);
  };

  const goToSavedPlans = () => {
    setViewingSavedMealPlan(null);
    resetAiMealPlan();
    setStep("savedPlans");
  };

  const goToFavoriteFoods = () => {
    setViewingSavedMealPlan(null);
    resetAiMealPlan();
    setStep("favoriteFoods");
  };

  const handleDeleteSavedMealPlan = (id: string) => {
    const nextSavedMealPlans = deleteSavedMealPlan(id);

    setSavedMealPlans(nextSavedMealPlans);

    if (viewingSavedMealPlan?.id === id) {
      setViewingSavedMealPlan(null);
      setStep("savedPlans");
    }
  };

  const handleViewSavedMealPlan = (savedMealPlan: SavedMealPlan) => {
    setViewingSavedMealPlan(savedMealPlan);
    restoreAiMealPlan(savedMealPlan.aiMealPlanResponse ?? null);
    setStep("result");
  };

  const handleToggleFavoriteFood = (food: MealFood) => {
    setFavoriteFoods(toggleFavoriteFood(food));
  };

  const handleDeleteFavoriteFood = (id: string) => {
    setFavoriteFoods(deleteFavoriteFood(id));
  };

  const resultProfile = viewingSavedMealPlan?.profile ?? profile;
  const resultGoal = viewingSavedMealPlan?.goal ?? goal;
  const resultTarget = viewingSavedMealPlan?.target ?? nutritionTarget;
  const resultMealPlan = viewingSavedMealPlan?.mealPlan ?? selectedMealPlan;  
  const resultAiMealPlanResponse =
    viewingSavedMealPlan?.aiMealPlanResponse ?? aiMealPlanResponse;

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

      <div className="topShortcutGrid">
        <Button color="primary" variant="weak" onClick={goToSavedPlans}>
          저장된 식단
        </Button>
        <Button color="primary" variant="weak" onClick={goToFavoriteFoods}>
          즐겨찾기 음식
        </Button>
      </div>

      {step === "profile" ? (
        <UserProfileForm
          profile={profile}
          onNext={() => setStep("goal")}
        />
      ) : null}

      {step === "goal" ? (
        <GoalSelector
          selectedGoal={goal}
          selectedDuration={planDuration}
          onBack={() => setStep("profile")}
          onGoalChange={setGoal}
          onDurationChange={setPlanDuration}
          onNext={goToGeneratedResult}
        />
      ) : null}

      {step === "savedPlans" ? (
        <SavedMealPlansScreen
          savedMealPlans={savedMealPlans}
          onBack={() => setStep("profile")}
          onDelete={handleDeleteSavedMealPlan}
          onView={handleViewSavedMealPlan}
        />
      ) : null}

      {step === "favoriteFoods" ? (
        <FavoriteFoodsScreen
          favoriteFoods={favoriteFoods}
          onBack={() => setStep("profile")}
          onDelete={handleDeleteFavoriteFood}
        />
      ) : null}

      {step === "result" ? (
        <ResultScreen
          aiError={aiError}
          aiMealPlanResponse={resultAiMealPlanResponse}
          favoriteFoods={favoriteFoods}
          goal={resultGoal}
          isAiLoading={isAiLoading}
          isSavedView={viewingSavedMealPlan != null}
          mealPlan={resultMealPlan}          
          profile={resultProfile}
          savedAt={viewingSavedMealPlan?.savedAt}
          target={resultTarget}
          onBack={() => setStep(viewingSavedMealPlan ? "savedPlans" : "goal")}          
          onFavoriteFoodToggle={handleToggleFavoriteFood}
          onRetryAiGenerate={() =>
            void generateAiMealPlan(resultMealPlan, resultTarget)
          }
          onRestart={() => {
            setViewingSavedMealPlan(null);
            resetAiMealPlan();
            setStep("profile");
          }}          
        />
      ) : null}
    </main>
  );
}

export default App;
