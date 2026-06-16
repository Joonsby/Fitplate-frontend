import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { login } from "./api/authApi";
import { getSavedMealPlans } from "./api/mealPlanStorageApi";
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
import { Loader, Result, Asset } from "@toss/tds-mobile";

type LoginStatus = "loading" | "success" | "error";

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loginStatus, setLoginStatus] = useState<LoginStatus>("loading");  

  const checkLogin = useCallback(async () => {
    setLoginStatus("loading");

    try{
      const data = await login();
      sessionStorage.setItem("fitplate_access_token", data.accessToken);
      setLoginStatus("success");
    } catch (error) {
      console.error("[Login] 실패", error);
      setLoginStatus("error");
    }
  }, []);

  useEffect(() => {
    checkLogin();
  }, [checkLogin]);

  const {
    profile,
    setProfile,
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
    resultSnapshot,
    isAiLoading,
    aiError,
    generateAiMealPlan,
    resetAiMealPlan,
  } = useAiMealPlan({ profile, goal, nutritionTarget, planDuration });

  if (loginStatus === "loading") {
    return (
      <main className="appShell" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>        
        <Loader size="large" label="로그인 중..." />
      </main>
    );
  }

  if (loginStatus === "error") {
    return (
      <main className="appShell" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px" }}>
        <Result
          figure={<Asset.Icon name="icn-info-line" frameShape={Asset.frameShape.CleanH24} />}
          title="로그인 실패"
          description={`로그인에 실패했습니다 다시 시도해주세요`}
          button={<Result.Button onClick={checkLogin}>재시도</Result.Button>}
        />        
      </main>
    );
  }

  const isResultPage = location.pathname === "/result";

  const goToSavedPlans = async () => {
    clearViewingSavedMealPlan();
    resetAiMealPlan();

    try {
      const savedMealPlans = await getSavedMealPlans();
      setSavedMealPlans(savedMealPlans);
    } catch (error) {
      console.error("저장된 식단 목록 조회 실패:", error);
    }

    navigate("/saved-plans", { replace: location.pathname === "/saved-plans" });
  };

  const goToFavoriteFoods = () => {
    clearViewingSavedMealPlan();
    resetAiMealPlan();
    navigate("/favorite-foods", { replace: location.pathname === "/favorite-foods" });
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
        <Route path="/" element={<HomePage profile={profile} onProfileSave={setProfile} />} />
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
              resultSnapshot={resultSnapshot}
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