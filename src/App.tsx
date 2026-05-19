import { Button, Top } from "@toss/tds-mobile";
import { useState } from "react";
import "./App.css";
import logoImage from "./assets/images/logo.png";
import { FavoriteFoodsScreen } from "./components/FavoriteFoodsScreen";
import { GoalSelector } from "./components/GoalSelector";
import { ResultScreen } from "./components/ResultScreen";
import { SavedMealPlansScreen } from "./components/SavedMealPlansScreen";
import { UserProfileForm } from "./components/UserProfileForm";
import type {
  AIMealPlanResponse,
  FavoriteFood,
  GoalType,
  MealFood,
  MealPlan,
  NutritionTarget,
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
import { mockGenerateMealPlan } from "./utils/mockGenerateMealPlan";
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
  const [profile, setProfile] = useState<UserProfile>({
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

  // mock AI 응답 상태입니다.
  // 실제 API를 붙일 때도 이 세 가지 상태(응답/로딩/에러)를 그대로 재사용할 수 있습니다.
  const [aiMealPlanResponse, setAiMealPlanResponse] =
    useState<AIMealPlanResponse | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // 결과 화면에서 보여줄 칼로리와 탄단지 계산값입니다.
  const nutritionTarget = calculateNutritionTarget(profile, goal);

  // 목표 칼로리와 선택 기간에 가장 가까운 기간 식단을 선택합니다.
  const selectedMealPlan = selectClosestMealPlan(
    nutritionTarget.calories,
    planDuration,
  );

  const generateMockAiResult = async (
    mealPlan: MealPlan,
    target: NutritionTarget,
  ) => {
    setIsAiLoading(true);
    setAiError(null);
    setAiMealPlanResponse(null);

    try {
      const response = await mockGenerateMealPlan({ mealPlan, target });
      setAiMealPlanResponse(response);
    } catch (error) {
      setAiError(
        error instanceof Error
          ? error.message
          : "mock AI 식단 생성 중 알 수 없는 오류가 발생했습니다.",
      );
    } finally {
      setIsAiLoading(false);
    }
  };

  const openGeneratedResult = () => {
    setViewingSavedMealPlan(null);
    setStep("result");
    void generateMockAiResult(selectedMealPlan, nutritionTarget);
  };

  const openSavedPlans = () => {
    setViewingSavedMealPlan(null);
    setStep("savedPlans");
  };

  const openFavoriteFoods = () => {
    setViewingSavedMealPlan(null);
    setStep("favoriteFoods");
  };

  const handleSaveCurrentMealPlan = () => {
    const nextSavedMealPlans = saveMealPlan({
      profile,
      goal,
      target: nutritionTarget,
      planDuration,
      mealPlan: selectedMealPlan,
      aiMealPlanResponse: aiMealPlanResponse ?? undefined,
    });

    setSavedMealPlans(nextSavedMealPlans);
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
    setAiMealPlanResponse(savedMealPlan.aiMealPlanResponse ?? null);
    setAiError(null);
    setIsAiLoading(false);
    setStep("result");
  };

  const handleToggleFavoriteFood = (food: MealFood) => {
    setFavoriteFoods(toggleFavoriteFood(food));
  };

  const handleDeleteFavoriteFood = (id: string) => {
    setFavoriteFoods(deleteFavoriteFood(id));
  };

  const handleDurationChange = (duration: PlanDuration) => {
    setPlanDuration(duration);
    const nextMealPlan = selectClosestMealPlan(nutritionTarget.calories, duration);
    void generateMockAiResult(nextMealPlan, nutritionTarget);
  };

  const resultProfile = viewingSavedMealPlan?.profile ?? profile;
  const resultGoal = viewingSavedMealPlan?.goal ?? goal;
  const resultTarget = viewingSavedMealPlan?.target ?? nutritionTarget;
  const resultMealPlan = viewingSavedMealPlan?.mealPlan ?? selectedMealPlan;
  const resultPlanDuration =
    viewingSavedMealPlan?.planDuration ?? planDuration;
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
        <Button variant="weak" onClick={openSavedPlans}>
          저장된 식단
        </Button>
        <Button variant="weak" onClick={openFavoriteFoods}>
          즐겨찾기 음식
        </Button>
      </div>

      {step === "profile" ? (
        <UserProfileForm
          profile={profile}
          onChange={setProfile}
          onNext={() => setStep("goal")}
        />
      ) : null}

      {step === "goal" ? (
        <GoalSelector
          selectedGoal={goal}
          onBack={() => setStep("profile")}
          onChange={setGoal}
          onNext={openGeneratedResult}
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
          planDuration={resultPlanDuration}
          profile={resultProfile}
          savedAt={viewingSavedMealPlan?.savedAt}
          target={resultTarget}
          onBack={() => setStep(viewingSavedMealPlan ? "savedPlans" : "goal")}
          onDurationChange={handleDurationChange}
          onFavoriteFoodToggle={handleToggleFavoriteFood}
          onRetryAiGenerate={() =>
            void generateMockAiResult(resultMealPlan, resultTarget)
          }
          onRestart={() => {
            setViewingSavedMealPlan(null);
            setStep("profile");
          }}
          onSave={
            viewingSavedMealPlan == null ? handleSaveCurrentMealPlan : undefined
          }
        />
      ) : null}
    </main>
  );
}

export default App;
