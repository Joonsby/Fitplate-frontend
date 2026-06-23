import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState, useCallback, useRef } from "react";
import { login, getMyUserProfile } from "./api/authApi";
import { saveAccessToken } from "./api/authToken";
import { getSavedMealPlans } from "./api/mealPlanStorageApi";
import { getFavoriteFoods } from "./api/favoriteFoodsApi";
import "./App.css";
import { AppTopTitle } from "./components/common/AppTopTitle";
import { HomePage } from "./pages/HomePage";
import { GoalPage } from "./pages/GoalPage";
import { ResultPage } from "./pages/ResultPage";
import { SavedMealPlansPage } from "./pages/SavedMealPlansPage";
import { FavoriteFoodsPage } from "./pages/FavoriteFoodsPage";
import { useAiMealPlan, clearAiRequestParams } from "./hooks/useAiMealPlan";
import { useMealPlanSelection } from "./hooks/useMealPlanSelection";
import { useSavedMealPlans } from "./hooks/useSavedMealPlans";
import { useFavoriteFoods } from "./hooks/useFavoriteFoods";
import { useToast } from "./hooks/useToast";
import { Loader, Result, Asset } from "@toss/tds-mobile";
type LoginStatus = "loading" | "success" | "error";

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loginStatus, setLoginStatus] = useState<LoginStatus>("loading");
  const [isLoadingSavedMealPlans, setIsLoadingSavedMealPlans] = useState(false);
  const [isLoadingFavoriteFoods, setIsLoadingFavoriteFoods] = useState(true);
  const isNavigatingRef = useRef(false);
  const [isSaved, setIsSaved] = useState(false);

  const {
    profile,
    setProfile,
    goal,
    setGoal,
    nutritionTarget,
  } = useMealPlanSelection();

  const {
    savedMealPlans,
    setSavedMealPlans,
    viewingSavedMealPlan,
    setViewingSavedMealPlan,
    clearViewingSavedMealPlan,
  } = useSavedMealPlans();

  const { favoriteFoods, setFavoriteFoods } = useFavoriteFoods();

  const { showToast, toastElement } = useToast();

  const checkLogin = useCallback(async () => {
    setLoginStatus("loading");

    try{
      const data = await login();
      saveAccessToken(data.accessToken);

      const userProfile = await getMyUserProfile();
      if (userProfile !== null) {
        setProfile(userProfile);
      }

      setLoginStatus("success");

      getFavoriteFoods()
        .then((foods) => {
          setFavoriteFoods(foods);
          setIsLoadingFavoriteFoods(false);
        })
        .catch((err) => {
          console.error("즐겨찾기 목록 조회 실패:", err);
          showToast("즐겨찾기 목록을 불러오지 못했습니다.", "error");
          setIsLoadingFavoriteFoods(false);
        });
    } catch (error) {
      console.error("[Login] 실패", error);
      setLoginStatus("error");
    }
  }, [setProfile, setFavoriteFoods]);

  useEffect(() => {
    window.history.scrollRestoration = 'manual';
  }, []);

  useEffect(() => {
    checkLogin();
  }, [checkLogin]);

  const {
    resultSnapshot,
    isAiLoading,
    generationStatus,
    markGenerating,
    aiError,
    generateAiMealPlan,
    resetAiMealPlan,
  } = useAiMealPlan({ profile, goal, nutritionTarget });

  const handleGenerationSuccess = () => {
    clearAiRequestParams();
    showToast("식단 생성이 완료되었습니다. 저장된 식단 메뉴에서 확인해 주세요.", "success");
  };

  const handleGenerationError = () => {
    showToast("식단 생성에 실패했습니다. 광고 없이 다시 생성할 수 있습니다.", "error");
  };

  const generateAiMealPlanWithEvents = async () => {
    const result = await generateAiMealPlan();
    if (result !== null) {
      handleGenerationSuccess();
    } else {
      handleGenerationError();
    }
    return result;
  };


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

  // 두 페이지 간 이동은 스택 교체 — 돌아가기가 이 둘 사이 이력을 밟지 않도록
  const isMainMenuPage = ["/saved-plans", "/favorite-foods"].includes(location.pathname);

  const goToSavedPlans = async () => {
    if (isNavigatingRef.current) return;
    isNavigatingRef.current = true;

    clearViewingSavedMealPlan();
    resetAiMealPlan();
    navigate("/saved-plans", { replace: isMainMenuPage });

    const isFirstLoad = savedMealPlans.length === 0;
    if (isFirstLoad) setIsLoadingSavedMealPlans(true);

    try {
      const fetched = await getSavedMealPlans();
      setSavedMealPlans(fetched);
    } catch (error) {
      console.error("저장된 식단 목록 조회 실패:", error);
      showToast("저장된 식단 목록을 불러오지 못했습니다.", "error");
    }

    if (isFirstLoad) setIsLoadingSavedMealPlans(false);
    isNavigatingRef.current = false;
  };

  const goToFavoriteFoods = () => {
    clearViewingSavedMealPlan();
    resetAiMealPlan();
    navigate("/favorite-foods", { replace: isMainMenuPage });
  };

  const onBack = () => {
    navigate(-1);
  };

  

  return (
    <main className="appShell">
      {toastElement}
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
              onGoalChange={setGoal}
              onBack={onBack}
              onGeneratedStart={() => {
                clearViewingSavedMealPlan();
                setIsSaved(false);
              }}
              generateAiMealPlan={generateAiMealPlanWithEvents}
              generationStatus={generationStatus}
              markGenerating={markGenerating}
              resultSnapshot={resultSnapshot}
              isSaved={isSaved}
            />
          }
        />
        <Route
          path="/result"
          element={
            <ResultPage
              profile={profile}
              goal={goal}
              nutritionTarget={nutritionTarget}
              viewingSavedMealPlan={viewingSavedMealPlan}
              favoriteFoods={favoriteFoods}
              setFavoriteFoods={setFavoriteFoods}
              resultSnapshot={resultSnapshot}
              aiError={aiError}
              isAiLoading={isAiLoading}
              generateAiMealPlan={generateAiMealPlanWithEvents}
              isSaved={isSaved}
              onSaved={() => setIsSaved(true)}
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
              isLoading={isLoadingSavedMealPlans}
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
              isLoading={isLoadingFavoriteFoods}
              onBack={onBack}
            />
          }
        />
      </Routes>
    </main>
  );
}

export default App;