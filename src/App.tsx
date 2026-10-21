import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState, useCallback, useRef } from "react";
import { login, getMyUserProfile } from "./api/authApi";
import { saveAccessToken } from "./api/authToken";
import { getSavedMealPlans, renameSavedMealPlan } from "./api/mealPlanStorageApi";
import { getFavoriteFoods } from "./api/favoriteFoodsApi";
import "./App.css";
import { AppTopTitle } from "./components/common/AppTopTitle";
import { AppBottomNav } from "./components/common/AppBottomNav";
import type { BottomNavTab } from "./components/common/AppBottomNav";
import { Button } from "./components/common/Button";
import { Spinner } from "./components/common/Spinner";
import { AlertIcon } from "./components/common/Icons";
import { UserProfileForm } from "./components/forms/UserProfileForm";
import { HomePage } from "./pages/HomePage";
import { ProfilePage } from "./pages/ProfilePage";
import { GoalPage } from "./pages/GoalPage";
import { ResultPage } from "./pages/ResultPage";
import { SavedMealPlansPage } from "./pages/SavedMealPlansPage";
import { FavoriteFoodsPage } from "./pages/FavoriteFoodsPage";
import { IntroPage } from "./pages/IntroPage";
import { RecordsPage } from "./pages/RecordsPage";
import { copyMealPlan, scheduleMealPlan, setMealIntake } from "./api/mealIntakeApi";
import type { MealType } from "./api/mealIntakeApi";
import { withMealEaten } from "./utils/mealPlanMerger";
import { useAiMealPlan, clearAiRequestParams } from "./hooks/useAiMealPlan";
import { useMealPlanSelection } from "./hooks/useMealPlanSelection";
import { useSavedMealPlans } from "./hooks/useSavedMealPlans";
import { useFavoriteFoods } from "./hooks/useFavoriteFoods";
import { useToast } from "./hooks/useToast";
import { useBlockBack } from "./hooks/useBlockBack";
import { useFullScreenAd } from "./ads/useFullScreenAd";
import type { MealPlan, SavedMealPlan } from "./types/fitplate";
type LoginStatus = "intro" | "loading" | "success" | "error";

const TAB_PATHS: Record<BottomNavTab, string> = {
  create: "/",
  records: "/records",
  saved: "/saved-plans",
  favorites: "/favorite-foods",
  profile: "/profile",
};

// 홈이 아닌 탭끼리는 스택 교체 — 돌아가기가 탭 사이 이력을 밟지 않고 홈으로 오도록
const SUB_TAB_PATHS = ["/records", "/saved-plans", "/favorite-foods", "/profile"];

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loginStatus, setLoginStatus] = useState<LoginStatus>("intro");
  const [isLoadingSavedMealPlans, setIsLoadingSavedMealPlans] = useState(false);
  const [isLoadingFavoriteFoods, setIsLoadingFavoriteFoods] = useState(true);
  // 서버 프로필이 있거나 온보딩에서 한 번 입력했으면 true — 처음 쓰는 사람만 빈칸으로 시작
  const [hasEnteredProfile, setHasEnteredProfile] = useState(false);
  const isNavigatingRef = useRef(false);
  // 같은 끼니 섭취 체크를 응답 전에 또 보내지 않도록 막는다
  const pendingIntakeRef = useRef(new Set<string>());
  // 기록 탭에서 「저장 식단에서 고르기」로 넘어왔을 때 지정할 날짜
  const [pendingScheduleDate, setPendingScheduleDate] = useState<string | null>(null);
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
  // showToast 는 상태 setter 만 쓰므로 처음 만든 함수를 계속 써도 안전하다
  const showRecordError = useCallback((message: string) => showToast(message, "error"), []); // eslint-disable-line react-hooks/exhaustive-deps

  const refreshSavedMealPlans = useCallback(() => {
    getSavedMealPlans()
      .then(setSavedMealPlans)
      .catch((err) => console.error("저장된 식단 목록 조회 실패:", err));
  }, [setSavedMealPlans]);

  const checkLogin = useCallback(async () => {
    setLoginStatus("loading");

    try{
      const data = await login();
      saveAccessToken(data.accessToken);

      const userProfile = await getMyUserProfile();
      if (userProfile !== null) {
        setProfile(userProfile);
        setHasEnteredProfile(true);
      } else {
        // 프로필이 없으면 처음 쓰는 사용자 — 탭 없이 온보딩부터 시작
        navigate("/onboarding", { replace: true });
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
      refreshSavedMealPlans();
    } catch (error) {
      console.error("[Login] 실패", error);
      setLoginStatus("error");
    }
  }, [setProfile, setFavoriteFoods, refreshSavedMealPlans, navigate]);

  useEffect(() => {
    window.history.scrollRestoration = 'manual';
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const {
    resultSnapshot,
    updateResultSnapshot,
    isAiLoading,
    generationStatus,
    markGenerating,
    aiError,
    generateAiMealPlan,
    resetAiMealPlan,
  } = useAiMealPlan({ profile, goal, nutritionTarget });
  // 광고는 생성과 동시에 띄우고 결과 화면으로 넘어가므로, 목표 화면이 사라져도 살아 있도록 여기서 관리한다
  const { isAdLoaded, showAd } = useFullScreenAd();
  // 식단을 만드는 동안에는 화면을 벗어나지 못하게 한다
  useBlockBack(isAiLoading);

  const handleGenerationSuccess = () => {
    clearAiRequestParams();
    showToast("식단이 완성됐어요. 저장 식단에도 보관했어요.", "success");
    refreshSavedMealPlans();
    navigate("/result");
  };

  const handleGenerationError = () => {
    showToast("식단 생성에 실패했습니다. 광고 없이 다시 생성할 수 있습니다.", "error");
    navigate("/result");
  };

  const generateAiMealPlanWithEvents = async () => {
    try {
      const result = await generateAiMealPlan();
      if (result !== null) {
        handleGenerationSuccess();
      } else {
        handleGenerationError();
      }
      return result;
    } catch {
      handleGenerationError();
      return null;
    }
  };


  if (loginStatus === "intro") {
    return <IntroPage onStart={checkLogin} />;
  }

  if (loginStatus === "loading") {
    return (
      <main className="appCenter">
        <Spinner size={64} label="로그인하고 있어요" />
      </main>
    );
  }

  if (loginStatus === "error") {
    return (
      <main className="appCenter">
        <span className="appCenterIcon" aria-hidden="true">
          <AlertIcon />
        </span>
        <h1>로그인하지 못했어요</h1>
        <p>잠시 후 다시 시도해 주세요.</p>
        <Button size="medium" onClick={checkLogin}>
          다시 시도
        </Button>
      </main>
    );
  }

  const path = location.pathname;
  const resultSource = (location.state as { source?: string } | null)?.source;
  const isResultPage = path === "/result";
  const isSavedResult =
    isResultPage && (resultSource === "savedMealPlan" || resultSource === "favoriteFood");
  const isFlowPage = path.startsWith("/onboarding") || path === "/goal";
  const showBottomNav = !isFlowPage && !(isResultPage && isAiLoading);
  const isSubTabPage = SUB_TAB_PATHS.includes(path);

  const activeTab: BottomNavTab | null =
    path === "/" ? "create"
    : path === "/records" ? "records"
    : path === "/saved-plans" ? "saved"
    : path === "/favorite-foods" ? "favorites"
    : path === "/profile" ? "profile"
    : isResultPage ? (isSavedResult ? "saved" : "create")
    : null;

  const goToSavedPlans = async () => {
    if (isNavigatingRef.current) return;
    isNavigatingRef.current = true;

    clearViewingSavedMealPlan();
    resetAiMealPlan();
    navigate("/saved-plans", { replace: isSubTabPage });

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
    navigate("/favorite-foods", { replace: isSubTabPage });
  };

  const handleTabClick = (tab: BottomNavTab) => {
    if (TAB_PATHS[tab] === path) return;
    if (tab === "saved") {
      void goToSavedPlans();
      return;
    }
    if (tab === "favorites") {
      goToFavoriteFoods();
      return;
    }
    clearViewingSavedMealPlan();
    navigate(TAB_PATHS[tab], { replace: isSubTabPage });
  };

  const viewSavedMealPlan = (savedMealPlan: SavedMealPlan) => {
    setViewingSavedMealPlan(savedMealPlan);
    navigate("/result", { state: { source: "savedMealPlan" } });
  };

  const onBack = () => {
    navigate(-1);
  };

  // 서버에서 받은 식단을 저장 목록·보고 있는 식단·방금 만든 결과에 모두 반영한다
  const handleMealPlanReplaced = (saved: SavedMealPlan) => {
    setSavedMealPlans((current) => current.map((plan) => (plan.id === saved.id ? saved : plan)));
    setViewingSavedMealPlan((current) => (current?.id === saved.id ? saved : current));
    updateResultSnapshot((current) =>
      current.mealPlanId === saved.id
        ? {
            ...current,
            mealPlan: saved.mealPlan,
            planDate: saved.planDate,
            title: saved.title,
            titleCustomized: saved.titleCustomized,
          }
        : current,
    );
  };

  const updateMealPlanById = (mealPlanId: string, updater: (mealPlan: MealPlan) => MealPlan) => {
    setSavedMealPlans((current) =>
      current.map((plan) => (plan.id === mealPlanId ? { ...plan, mealPlan: updater(plan.mealPlan) } : plan)),
    );
    setViewingSavedMealPlan((current) =>
      current?.id === mealPlanId ? { ...current, mealPlan: updater(current.mealPlan) } : current,
    );
    updateResultSnapshot((current) =>
      current.mealPlanId === mealPlanId ? { ...current, mealPlan: updater(current.mealPlan) } : current,
    );
  };

  // 섭취 체크: 화면을 먼저 바꾸고, 실패하면 되돌린다. 응답 전 같은 끼니를 다시 누르면 무시한다.
  const toggleMealIntake = async (mealPlanId: string, mealType: MealType, eaten: boolean): Promise<boolean> => {
    const key = `${mealPlanId}:${mealType}`;
    if (pendingIntakeRef.current.has(key)) return false;
    pendingIntakeRef.current.add(key);
    updateMealPlanById(mealPlanId, (mealPlan) => withMealEaten(mealPlan, mealType, eaten));
    try {
      handleMealPlanReplaced(await setMealIntake(mealPlanId, mealType, eaten));
      return true;
    } catch (error) {
      updateMealPlanById(mealPlanId, (mealPlan) => withMealEaten(mealPlan, mealType, !eaten));
      showToast(error instanceof Error ? error.message : "섭취 기록을 저장하지 못했어요.", "error");
      return false;
    } finally {
      pendingIntakeRef.current.delete(key);
    }
  };

  // 같은 음식의 새 식단을 다른 날짜에 넣는다. 그날 다른 식단이 있으면 HttpError(code=DATE_TAKEN) 가 그대로 올라간다.
  const copyForDate = async (mealPlanId: string, planDate: string, replace: boolean) => {
    const copied = await copyMealPlan(mealPlanId, planDate, replace);
    setPendingScheduleDate(null);
    refreshSavedMealPlans();
    return copied;
  };

  const renameMealPlan = async (mealPlanId: string, title: string | null) => {
    handleMealPlanReplaced(await renameSavedMealPlan(mealPlanId, title));
  };

  // 날짜 지정. 같은 날짜에 다른 식단이 있으면 HttpError(code=DATE_TAKEN) 가 그대로 올라간다.
  const scheduleForDate = async (mealPlanId: string, planDate: string | null, replace: boolean) => {
    const saved = await scheduleMealPlan(mealPlanId, planDate, replace);
    handleMealPlanReplaced(saved);
    setPendingScheduleDate(null);
    // 다른 식단의 날짜가 풀렸을 수 있어 목록을 다시 읽는다
    refreshSavedMealPlans();
    return saved;
  };

  const openSavedMealPlanById = async (mealPlanId: string) => {
    const found = savedMealPlans.find((plan) => plan.id === mealPlanId);
    if (found) {
      viewSavedMealPlan(found);
      return;
    }
    try {
      const fetched = await getSavedMealPlans();
      setSavedMealPlans(fetched);
      const plan = fetched.find((item) => item.id === mealPlanId);
      if (plan) viewSavedMealPlan(plan);
    } catch {
      showToast("식단을 불러오지 못했어요.", "error");
    }
  };

  const topBar =
    isResultPage && isAiLoading ? null
    : path === "/onboarding/goal" ? <AppTopTitle onBack={onBack} />
    : path === "/goal" ? <AppTopTitle onBack={onBack} title="새 식단 만들기" />
    : isSavedResult ? <AppTopTitle onBack={onBack} title="저장한 식단" />
    : <AppTopTitle />;

  const goalPage = (
    <GoalPage
      profile={profile}
      goal={goal}
      isOnboarding={path === "/onboarding/goal"}
      onGoalChange={setGoal}
      onGeneratedStart={clearViewingSavedMealPlan}
      generateAiMealPlan={generateAiMealPlanWithEvents}
      generationStatus={generationStatus}
      markGenerating={markGenerating}
      isAdLoaded={isAdLoaded}
      showAd={showAd}
    />
  );

  return (
    <main className={`appShell${showBottomNav ? " appShell--withBottomNav" : ""}`}>
      {toastElement}
      {topBar}

      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              profile={profile}
              savedMealPlans={savedMealPlans}
              onCreate={() => navigate("/goal")}
              onEditProfile={() => navigate("/profile")}
              onViewSavedMealPlan={viewSavedMealPlan}
              onViewAllSavedMealPlans={() => void goToSavedPlans()}
            />
          }
        />
        <Route
          path="/onboarding"
          element={
            <UserProfileForm
              profile={profile}
              startEmpty={!hasEnteredProfile}
              onProfileSave={(nextProfile) => {
                setProfile(nextProfile);
                setHasEnteredProfile(true);
              }}
              onNext={() => navigate("/onboarding/goal")}
            />
          }
        />
        <Route path="/onboarding/goal" element={goalPage} />
        <Route path="/goal" element={goalPage} />
        <Route
          path="/profile"
          element={
            <ProfilePage
              profile={profile}
              onProfileSaved={(saved) => {
                setProfile(saved);
                setHasEnteredProfile(true);
                showToast("내 정보를 저장했어요.", "success");
              }}
              onError={(message) => showToast(message, "error")}
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
              onMealPlanReplaced={handleMealPlanReplaced}
              onToggleMealIntake={toggleMealIntake}
              onSchedule={scheduleForDate}
              onRename={renameMealPlan}
              onCopy={copyForDate}
              defaultScheduleDate={pendingScheduleDate}
            />
          }
        />
        <Route
          path="/records"
          element={
            <RecordsPage
              onToggleMealIntake={toggleMealIntake}
              onOpenMealPlan={(mealPlanId) => void openSavedMealPlanById(mealPlanId)}
              onPickPlanForDate={(date) => {
                setPendingScheduleDate(date);
                void goToSavedPlans();
              }}
              onCreate={() => handleTabClick("create")}
              onError={showRecordError}
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
              onCreate={() => handleTabClick("create")}
              pendingScheduleDate={pendingScheduleDate}
              onCancelPendingSchedule={() => setPendingScheduleDate(null)}
              onRename={renameMealPlan}
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
            />
          }
        />
      </Routes>
      {showBottomNav ? (
        <AppBottomNav activeTab={activeTab} onTabClick={handleTabClick} />
      ) : null}
    </main>
  );
}

export default App;
