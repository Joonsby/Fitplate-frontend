import { useCallback, useEffect, useRef, useState } from "react";
import { useToast } from "../hooks/useToast";
import { useLocation } from "react-router-dom";
import { ResultScreen } from "../components/screens/ResultScreen";
import { toggleFavoriteFood } from "../api/favoriteFoodsApi";
import { regenerateMeal, replaceMealPlanFood, suggestFoodAlternatives } from "../api/mealPlanEditApi";
import { ConfirmDialog } from "../components/common/ConfirmDialog";
import type { FoodPosition } from "../api/mealPlanEditApi";
import { FoodSwapSheet } from "../components/result/FoodSwapSheet";
import { MealScheduleCard } from "../components/result/MealScheduleCard";
import type { MealType } from "../api/mealIntakeApi";
import { formatDateLabel, todayString } from "../utils/date";
import type {
  AIFood,
  FavoriteFood,
  GoalType,
  MealFood,
  MealPlan,
  NutritionTarget,
  ResultSnapshot,
  SavedMealPlan,
  UserProfile,
} from "../types/fitplate";

const EMPTY_MEAL_PLAN: MealPlan = {
  id: "empty",
  targetCalories: 0,
  durationDays: 0,
  averageCalories: 0,
  days: [],
};

interface ResultPageProps {
  profile: UserProfile;
  goal: GoalType;
  nutritionTarget: NutritionTarget;
  viewingSavedMealPlan: SavedMealPlan | null;
  favoriteFoods: FavoriteFood[];
  setFavoriteFoods: React.Dispatch<React.SetStateAction<FavoriteFood[]>>;
  resultSnapshot: ResultSnapshot | null;
  aiError: string | null;
  isAiLoading: boolean;
  generateAiMealPlan: () => Promise<MealPlan | null>;
  onMealPlanReplaced: (savedMealPlan: SavedMealPlan) => void;
  onToggleMealIntake: (mealPlanId: string, mealType: MealType, eaten: boolean) => Promise<boolean>;
  onSchedule: (mealPlanId: string, planDate: string | null, replace: boolean) => Promise<SavedMealPlan>;
  onRename: (mealPlanId: string, title: string | null) => Promise<void>;
  onCopy: (mealPlanId: string, planDate: string, replace: boolean) => Promise<SavedMealPlan>;
  // 기록 탭에서 날짜를 고르고 넘어왔으면 그 날짜를 기본값으로 쓴다
  defaultScheduleDate: string | null;
}

const MEAL_LABELS: Record<FoodPosition["mealType"], string> = {
  breakfast: "아침",
  lunch: "점심",
  dinner: "저녁",
};

type ResultSource = "savedMealPlan" | "favoriteFood";

function toFavoriteFood(food: MealFood, favoriteFoodId: number): FavoriteFood {
  return {
    favoriteFoodId,
    name: food.name,
    amount: food.amount,
    calories: food.calories,
    carbohydrate: food.carbohydrate ?? 0,
    protein: food.protein ?? 0,
    fat: food.fat ?? 0,
    shoppingCategory: food.shoppingCategory,
    shoppingKeyword: food.shoppingKeyword ?? "",
    sourceFoodId: food.id,
    createdAt: new Date().toISOString(),
  };
}

export function ResultPage({
  profile,
  goal,
  nutritionTarget,
  viewingSavedMealPlan,
  favoriteFoods,
  setFavoriteFoods,
  resultSnapshot,
  aiError,
  isAiLoading,
  generateAiMealPlan,
  onMealPlanReplaced,
  onToggleMealIntake,
  onSchedule,
  onRename,
  onCopy,
  defaultScheduleDate,
}: ResultPageProps) {
  const location = useLocation();
  const { showToast, toastElement } = useToast();
  const pendingFavoriteNamesRef = useRef(new Set<string>());
  const [swapTarget, setSwapTarget] = useState<{ position: FoodPosition; food: AIFood } | null>(null);
  const [regenerateTarget, setRegenerateTarget] = useState<FoodPosition["mealType"] | null>(null);
  const [regeneratingMealType, setRegeneratingMealType] = useState<FoodPosition["mealType"] | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // source는 navigate() 호출 시 state로 주입되며, 히스토리 엔트리별로 독립적으로 관리됨.
  // 뒤로가기로 진입하면 해당 엔트리의 state를 읽으므로 source가 없어 session으로 분기됨.
  const source = (location.state as { source?: ResultSource } | null)?.source;
  const isSavedView = source === "savedMealPlan" || source === "favoriteFood";
  const dbData = isSavedView ? viewingSavedMealPlan : null;

  const resultProfile = dbData?.profile ?? resultSnapshot?.profile ?? profile;
  const resultGoal = dbData?.goal ?? resultSnapshot?.goal ?? goal;
  const resultTarget = dbData?.target ?? resultSnapshot?.nutritionTarget ?? nutritionTarget;
  const resultMealPlan = dbData?.mealPlan ?? resultSnapshot?.mealPlan ?? EMPTY_MEAL_PLAN;
  // 서버에 저장된 식단만 음식을 바꿀 수 있다
  const mealPlanId = isSavedView ? dbData?.id : resultSnapshot?.mealPlanId;
  const planDate = (isSavedView ? dbData?.planDate : resultSnapshot?.planDate) ?? null;
  const intakeEnabled = mealPlanId != null && planDate != null && planDate <= todayString();
  const hasEatenMeal = resultMealPlan.days[0]?.meals.some((meal) => meal.eaten) ?? false;
  const planTitle = (isSavedView ? dbData?.title : resultSnapshot?.title) ?? null;

  const loadAlternatives = useCallback(
    async (excludeNames: string[]) => {
      if (mealPlanId == null || swapTarget == null) return [];
      const result = await suggestFoodAlternatives(mealPlanId, swapTarget.position, excludeNames);
      return result.alternatives;
    },
    [mealPlanId, swapTarget],
  );

  const handleRegenerateMeal = async () => {
    const mealType = regenerateTarget;
    setRegenerateTarget(null);
    if (mealPlanId == null || mealType == null || regeneratingMealType != null) return;
    setRegeneratingMealType(mealType);
    try {
      onMealPlanReplaced(await regenerateMeal(mealPlanId, mealType));
      showToast(`${MEAL_LABELS[mealType]}을 새로 만들었어요.`, "success");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "끼니를 다시 만들지 못했어요.", "error");
    } finally {
      setRegeneratingMealType(null);
    }
  };

  const handleConfirmSwap = async (food: AIFood) => {
    if (mealPlanId == null || swapTarget == null) return;
    const saved = await replaceMealPlanFood(mealPlanId, swapTarget.position, food);
    onMealPlanReplaced(saved);
    setSwapTarget(null);
  };

  // 화면을 먼저 바꾸고 서버 응답으로 맞춘다. 응답 전 같은 음식을 다시 누르면 무시한다.
  const handleToggleFavoriteFood = async (food: MealFood) => {
    if (pendingFavoriteNamesRef.current.has(food.name)) return;
    pendingFavoriteNamesRef.current.add(food.name);

    const existing = favoriteFoods.find((f) => f.name === food.name);
    const withoutFood = (current: FavoriteFood[]) =>
      current.filter((f) => f.name !== food.name);

    setFavoriteFoods((current) =>
      existing ? withoutFood(current) : [toFavoriteFood(food, -Date.now()), ...withoutFood(current)],
    );

    try {
      const result = await toggleFavoriteFood(food);
      setFavoriteFoods((current) =>
        result.action === "ADDED"
          ? [toFavoriteFood(food, result.favoriteFoodId), ...withoutFood(current)]
          : withoutFood(current),
      );
    } catch (error) {
      setFavoriteFoods((current) =>
        existing ? [existing, ...withoutFood(current)] : withoutFood(current),
      );
      console.error("즐겨찾기 변경 실패:", error);
      showToast(
        error instanceof Error
          ? error.message
          : "즐겨찾기 변경 중 알 수 없는 오류가 발생했습니다.",
        "error",
      );
    } finally {
      pendingFavoriteNamesRef.current.delete(food.name);
    }
  };

  const hasSessionData = resultSnapshot != null;
  const showEmptyState = !isSavedView && !hasSessionData && !isAiLoading;
  const sessionAiError = !isSavedView ? (resultSnapshot?.aiError ?? null) : null;
  const effectiveAiError = aiError ?? sessionAiError;

  return (
    <>
      {toastElement}
      <ResultScreen
        aiError={effectiveAiError}
        favoriteFoods={favoriteFoods}
        goal={resultGoal}
        isAiLoading={isAiLoading}
        isSavedView={isSavedView}
        mealPlan={resultMealPlan}
        profile={resultProfile}
        allergies={profile.allergyFoodCategories}
        planTitle={planTitle}
        planDate={planDate}
        onRenameTitle={
          mealPlanId != null && planTitle != null ? (title) => onRename(mealPlanId, title) : undefined
        }
        savedAt={dbData?.savedAt}
        target={resultTarget}
        showEmptyState={showEmptyState}
        onFavoriteFoodToggle={handleToggleFavoriteFood}
        onRetryAiGenerate={() => void generateAiMealPlan()}
        onFoodSwap={
          mealPlanId != null ? (position, food) => setSwapTarget({ position, food }) : undefined
        }
        onMealRegenerate={mealPlanId != null ? setRegenerateTarget : undefined}
        regeneratingMealType={regeneratingMealType}
        intakeEnabled={intakeEnabled}
        onMealIntakeToggle={
          mealPlanId != null
            ? (mealType, eaten) => void onToggleMealIntake(mealPlanId, mealType, eaten)
            : undefined
        }
        scheduleCard={
          mealPlanId != null ? (
            <MealScheduleCard
              key={`${mealPlanId}-${planDate ?? "none"}`}
              planDate={planDate}
              hasEatenMeal={hasEatenMeal}
              defaultDate={defaultScheduleDate}
              onSchedule={(date, replace) => onSchedule(mealPlanId, date, replace)}
              onCopy={async (date, replace) => {
                await onCopy(mealPlanId, date, replace);
                showToast(`${formatDateLabel(date)} 식단으로 복사했어요. 저장 식단에서 볼 수 있어요.`, "success");
              }}
              onError={(message) => showToast(message, "error")}
            />
          ) : null
        }
      />
      <ConfirmDialog
        open={regenerateTarget != null}
        title={`${regenerateTarget ? MEAL_LABELS[regenerateTarget] : ""}을 다시 만들까요?`}
        description="AI가 비슷한 칼로리와 영양소로 새 음식 조합을 짜요. 지금 음식은 사라져요."
        confirmLabel="다시 만들기"
        confirmVariant="primary"
        onConfirm={() => void handleRegenerateMeal()}
        onCancel={() => setRegenerateTarget(null)}
      />
      {swapTarget != null ? (
        <FoodSwapSheet
          original={swapTarget.food}
          mealLabel={MEAL_LABELS[swapTarget.position.mealType]}
          loadAlternatives={loadAlternatives}
          onConfirm={handleConfirmSwap}
          onClose={() => setSwapTarget(null)}
        />
      ) : null}
    </>
  );
}
