import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useRef} from "react";
import { appLogin } from "@apps-in-toss/web-framework";
import "./App.css";
import { AppTopTitle } from "./components/AppTopTitle";
import { HomePage } from "./pages/HomePage";
import { GoalPage } from "./pages/GoalPage";
import { ResultPage } from "./pages/ResultPage";
import { SavedMealPlansPage } from "./pages/SavedMealPlansPage";
import { FavoriteFoodsPage } from "./pages/FavoriteFoodsPage";
import { useAiMealPlan } from "./hooks/useAiMealPlan";
import { useMealPlanSelection } from "./hooks/useMealPlanSelection";
import { useSavedMealPlans } from "./hooks/useSavedMealPlans";
import { useFavoriteFoods } from "./hooks/useFavoriteFoods";

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const hasRunRef = useRef(false);

  useEffect(() => {
    if (hasRunRef.current) return;
    hasRunRef.current = true;

    async function checkLogin() {
      try {
        const { authorizationCode, referrer } = await appLogin();

        const response = await fetch("http://localhost:8080/api/auth/toss-login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ authorizationCode, referrer }),
        });

        if (!response.ok) {
          throw new Error(`로그인 실패: ${response.status}`);
        }

      } catch (error) {
        console.error("[TossLogin] 실패", error);
      }
    }

    checkLogin();
  }, []);

  const {
    profile,
    goal,
    setGoal,
    planDuration,
    setPlanDuration,
    nutritionTarget,
    selectedMealPlan,
  } = useMealPlanSelection();

  const {
    savedMealPlans,
    setSavedMealPlans,
    viewingSavedMealPlan,
    setViewingSavedMealPlan,
    clearViewingSavedMealPlan,
  } = useSavedMealPlans();

  const { favoriteFoods, setFavoriteFoods } = useFavoriteFoods();

  const {
    aiMealPlanResponse,
    isAiLoading,
    aiError,
    generateAiMealPlan,
    resetAiMealPlan,
    restoreAiMealPlan,
  } = useAiMealPlan({ profile, goal });

  const isResultPage = location.pathname === "/result";

  const goToSavedPlans = () => {
    clearViewingSavedMealPlan();
    resetAiMealPlan();
    navigate("/saved-plans");
  };

  const goToFavoriteFoods = () => {
    clearViewingSavedMealPlan();
    resetAiMealPlan();
    navigate("/favorite-foods");
  };

  const onBack = () => {
    navigate(-1);
  };

  return (
    <main className="appShell">
      <AppTopTitle
        isResultPage={isResultPage}
        isAiLoading={isAiLoading}
        onSavedPlansClick={goToSavedPlans}
        onFavoriteFoodsClick={goToFavoriteFoods}
      />

      <Routes>
        <Route path="/" element={<HomePage profile={profile} />} />
        <Route
          path="/goal"
          element={
            <GoalPage
              goal={goal}
              planDuration={planDuration}
              selectedMealPlan={selectedMealPlan}
              nutritionTarget={nutritionTarget}
              onGoalChange={setGoal}
              onDurationChange={setPlanDuration}
              onBack={onBack}
              onGeneratedStart={clearViewingSavedMealPlan}
              generateAiMealPlan={generateAiMealPlan}
            />
          }
        />
        <Route
          path="/result"
          element={
            <ResultPage
              profile={profile}
              goal={goal}
              planDuration={planDuration}
              nutritionTarget={nutritionTarget}
              selectedMealPlan={selectedMealPlan}
              viewingSavedMealPlan={viewingSavedMealPlan}
              favoriteFoods={favoriteFoods}
              setFavoriteFoods={setFavoriteFoods}
              setSavedMealPlans={setSavedMealPlans}
              aiMealPlanResponse={aiMealPlanResponse}
              aiError={aiError}
              isAiLoading={isAiLoading}
              generateAiMealPlan={generateAiMealPlan}
              onBack={onBack}
            />
          }
        />
        <Route
          path="/saved-plans"
          element={
            <SavedMealPlansPage
              savedMealPlans={savedMealPlans}
              setSavedMealPlans={setSavedMealPlans}
              setViewingSavedMealPlan={setViewingSavedMealPlan}
              restoreAiMealPlan={restoreAiMealPlan}
              onBack={onBack}
            />
          }
        />
        <Route
          path="/favorite-foods"
          element={
            <FavoriteFoodsPage
              favoriteFoods={favoriteFoods}
              setFavoriteFoods={setFavoriteFoods}
              fallbackMealPlanId={selectedMealPlan.id}
              onBack={onBack}
            />
          }
        />
      </Routes>
    </main>
  );
}

export default App;