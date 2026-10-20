// AI 식단 결과(생성 중·실패·완성·빈 상태)를 한 화면에서 분기해 보여줍니다.
import "../../styles/layout.css";
import "./ResultScreen.css";
import { useNavigate } from "react-router-dom";
import { GOAL_LABELS } from "../../types/fitplate";
import { ScreenSectionHeader } from "../common/ScreenSectionHeader";
import { EmptyState } from "../common/EmptyState";
import { NutritionPanel } from "../common/NutritionPanel";
import { Button } from "../common/Button";
import { PlateIcon } from "../common/Icons";
import { AiMealPlanPanel } from "../result/AiMealPlanPanel";
import { AiMealPlanFailureScreen } from "../result/AiMealPlanFailureScreen";
import { extractAiResponseFromMealPlan } from "../../utils/mealPlanMerger";
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
  isSaving: boolean;
  aiError: string | null;
  savedAt?: string;
  showEmptyState: boolean;
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
  showEmptyState,
  onFavoriteFoodToggle,
  onRetryAiGenerate,
  onBack,
  onGoalReselect,
  onRestart,
}: ResultScreenProps) {
  const navigate = useNavigate();
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
  const aiMealPlan = hasAiData ? extractAiResponseFromMealPlan(mealPlan) : null;
  const shouldShowFallbackFailure = !isAiLoading && aiError != null && !hasAiData;

  if (showEmptyState) {
    return (
      <section className="screen">
        <ScreenSectionHeader
          title="만든 식단"
          description="AI가 만든 식단을 여기에서 확인할 수 있어요."
        />
        <EmptyState
          icon={<PlateIcon />}
          title="아직 만든 식단이 없어요"
          description="목표를 고르면 AI가 하루 식단을 만들어 드려요."
        >
          <Button block size="medium" onClick={() => navigate("/")}>
            새 식단 만들기
          </Button>
        </EmptyState>
      </section>
    );
  }

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
          aiMealPlan={aiMealPlan}
          favoriteFoodNames={favoriteFoodNames}
          onFavoriteFoodToggle={onFavoriteFoodToggle}
          onRetryAiGenerate={onRetryAiGenerate}
        />
      ) : null}

      {!isAiLoading && hasAiData ? (
        <>
          {aiError == null ? (
            <>
              <ScreenSectionHeader
                step={isSavedView ? `${savedDate} 저장` : "AI 추천 식단"}
                title={`${GOAL_LABELS[goal]} 식단`}
                description={`${profile.height}cm · ${profile.weight}kg 기준, 하루 ${mealPlan.targetCalories.toLocaleString()} kcal에 맞췄어요.`}
              />
              <NutritionPanel target={target} />
            </>
          ) : null}
          <AiMealPlanPanel
            aiError={aiError}
            isAiLoading={isAiLoading}
            target={target}
            aiMealPlan={aiMealPlan}
            favoriteFoodNames={favoriteFoodNames}
            onFavoriteFoodToggle={onFavoriteFoodToggle}
            onRetryAiGenerate={onRetryAiGenerate}
          />
        </>
      ) : null}

      {!isAiLoading ? (
        isSavedView ? (
          <Button variant="ghost" block onClick={onBack}>
            목록으로
          </Button>
        ) : (
          <div className="buttonRow">
            <Button variant="secondary" size="medium" onClick={onGoalReselect}>
              목표 다시 선택
            </Button>
            <Button variant="ghost" size="medium" onClick={onRestart}>
              홈으로
            </Button>
          </div>
        )
      ) : null}
    </section>
  );
}
