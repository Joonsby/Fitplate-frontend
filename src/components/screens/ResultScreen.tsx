import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, ConfirmDialog, Post } from "@toss/tds-mobile";
import { GOAL_LABELS } from "../../types/fitplate";
import { ScreenSectionHeader } from "../common/ScreenSectionHeader";
import { EmptyState } from "../common/EmptyState";
import { NutritionPanel } from "../common/NutritionPanel";
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
  isSaved: boolean;
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
  isSaved,
  isSaving,
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
  const [restartConfirmOpen, setRestartConfirmOpen] = useState(false);
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
          title="생성된 식단"
          description="AI 식단 결과를 확인할 수 있어요."
          step="3단계"
        />
        <div className="savedMealPlansContent">
          <EmptyState
            title="아직 생성된 식단이 없어요"
            description="프로필 정보를 입력하면 목표에 맞는 AI 식단을 만들어 드릴게요."
          />
          <Button variant="weak" onClick={() => navigate('/')}>
            식단 생성하기
          </Button>
        </div>        
      </section>
    );
  }

  return (
    <>
      <ConfirmDialog
        open={restartConfirmOpen}
        title={<ConfirmDialog.Title>처음부터</ConfirmDialog.Title>}
        description={
          <ConfirmDialog.Description>
            {'저장되지 않은 현재 식단은 사라집니다.\n처음부터 다시 시작하시겠습니까?'}
          </ConfirmDialog.Description>
        }
        cancelButton={<ConfirmDialog.CancelButton onClick={() => setRestartConfirmOpen(false)}>취소</ConfirmDialog.CancelButton>}
        confirmButton={<ConfirmDialog.ConfirmButton onClick={() => { setRestartConfirmOpen(false); onRestart(); }}>시작</ConfirmDialog.ConfirmButton>}
        onClose={() => setRestartConfirmOpen(false)}
      />
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
                aiMealPlan={aiMealPlan}
                favoriteFoodNames={favoriteFoodNames}
                onFavoriteFoodToggle={onFavoriteFoodToggle}
                onRetryAiGenerate={onRetryAiGenerate}
              />
            </div>
          </section>
        </>
      ) : null}

      {!isAiLoading ? (        
          <div className="buttonRow">
            <Button variant="weak" onClick={isSavedView ? onBack : onGoalReselect}>
              {isSavedView ? "목록으로" : "목표 다시 선택"}
            </Button>
            <Button
              variant="weak"
              onClick={() => {
                if (!isSavedView && hasAiData && !isSaved) {
                  setRestartConfirmOpen(true);
                  return;
                }
                onRestart();
              }}
            >
              처음부터
            </Button>
          </div>        
      ) : null}
    </section>
    </>
  );
}
