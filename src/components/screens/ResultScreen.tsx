// 결과 화면 컴포넌트입니다. 규칙 기반 식단과 AI 응답을 함께 보여줍니다.
import { Button, Post } from "@toss/tds-mobile";
import { GOAL_LABELS } from "../../types/fitplate";
import { ScreenSectionHeader } from "../common/ScreenSectionHeader";
import { NutritionPanel } from "../common/NutritionPanel";
import { AiMealPlanPanel } from "../result/AiMealPlanPanel";
import { AiMealPlanFailureScreen } from "../result/AiMealPlanFailureScreen";
import { DayMealSwiper } from "../result/DayMealSwiper";
import { ShoppingListSection } from "../result/ShoppingListSection";
import { aggregateShoppingList } from "../../utils/shoppingListAggregator";
import type {
  FavoriteFood,
  GoalType,
  MealFood,
  MealPlan,
  NutritionTarget,
  UserProfile,
} from "../../types/fitplate";

export interface ResultScreenProps {
  profile: UserProfile;
  goal: GoalType;
  target: NutritionTarget;
  mealPlan: MealPlan;
  favoriteFoods: FavoriteFood[];
  isSavedView: boolean;
  isAiLoading: boolean;
  aiError: string | null;
  savedAt?: string;    
  onFavoriteFoodToggle: (food: MealFood) => void;
  onRetryAiGenerate: () => void;
  onBack: () => void;
  onGoalReselect: () => void;
  onRestart: () => void;
}

export function ResultScreen({
  aiError,
  favoriteFoods,
  goal,
  isAiLoading,
  isSavedView,
  mealPlan,
  profile,
  savedAt,
  target,
  onFavoriteFoodToggle,
  onRetryAiGenerate,  
  onBack,
  onGoalReselect,
  onRestart,
}: ResultScreenProps) {
  const shoppingList = aggregateShoppingList(mealPlan);
  const favoriteFoodNames = new Set(
    favoriteFoods.map((favoriteFood) => favoriteFood.name),
  );
  const savedDate =
    savedAt == null
      ? null
      : new Date(savedAt).toLocaleString("ko-KR", {
          dateStyle: "medium",
          timeStyle: "short",
        });

  const hasAiData = mealPlan.days.length > 0 && mealPlan.days[0].meals[0]?.name != null;
  const shouldShowFallbackFailure = !isAiLoading && aiError != null && !hasAiData;

  return (
    <section className="screen">
      {shouldShowFallbackFailure ? (
        <AiMealPlanFailureScreen
          aiError={aiError}
          target={target}
          onRetryAiGenerate={onRetryAiGenerate}
        />
      ) : null}

      {!shouldShowFallbackFailure && isAiLoading ? (
        <AiMealPlanPanel
          aiError={aiError}
          isAiLoading={isAiLoading}
          target={target}
          mealPlan={mealPlan}
          onRetryAiGenerate={onRetryAiGenerate}
        />
      ) : null}

      {!isAiLoading && hasAiData ? (
        <>
          {aiError == null ? (
            <ScreenSectionHeader
              description={`${profile.height}cm, ${profile.weight}kg 기준 목표와 가장 가까운 ${mealPlan.targetCalories.toLocaleString()}kcal 식단입니다.`}
              step={isSavedView ? "저장된 식단" : "3단계"}
              title={`${GOAL_LABELS[goal]} 결과`}
            >
              {savedDate ? (
                <Post.H3 color="#3182f6" typography="t7" className="savedAtText">저장 날짜: {savedDate}</Post.H3>
              ) : null}
            </ScreenSectionHeader>
          ) : null}

          <section className="mealPlanSummary">
            <div className="mealPlanSummaryInner">
              {aiError == null ? (
                <div className="nutritionSummary">
                  <NutritionPanel target={target} />                  
                </div>
              ) : null}

              <AiMealPlanPanel
                aiError={aiError}
                isAiLoading={isAiLoading}
                target={target}
                mealPlan={mealPlan}
                onRetryAiGenerate={onRetryAiGenerate}
              />

              {aiError == null ? (
                <>
                  <DayMealSwiper
                    days={mealPlan.days}
                    favoriteFoodNames={favoriteFoodNames}
                    onFavoriteFoodToggle={onFavoriteFoodToggle}
                  />

                  <ShoppingListSection
                    shoppingList={shoppingList}
                    favoriteFoodNames={favoriteFoodNames}
                    onFavoriteFoodToggle={onFavoriteFoodToggle}
                  />
                </>
              ) : null}
            </div>
          </section>
        </>
      ) : null}

      {!isAiLoading ? (
        <div className="buttonRow">
          <Button variant="weak" onClick={isSavedView ? onBack : onGoalReselect}>
            {isSavedView ? "목록으로" : "목표 다시 선택"}
          </Button>
          <Button variant="weak" onClick={onRestart}>
            처음부터
          </Button>
        </div>
      ) : null}
    </section>
  );
}
