// AI 식단 결과(생성 중·실패·완성·빈 상태)를 한 화면에서 분기해 보여줍니다.
import "../../styles/layout.css";
import "./ResultScreen.css";
import { useNavigate } from "react-router-dom";
import { useRef, useState } from "react";
import type { ReactNode } from "react";
import { FOOD_CATEGORY_LABELS, GOAL_LABELS } from "../../types/fitplate";
import { ScreenSectionHeader } from "../common/ScreenSectionHeader";
import { EmptyState } from "../common/EmptyState";
import { NutritionPanel } from "../common/NutritionPanel";
import { Button } from "../common/Button";
import { AlertIcon, PencilIcon, PlateIcon } from "../common/Icons";
import { TextInputSheet } from "../common/TextInputSheet";
import { formatDateLabel, todayString } from "../../utils/date";
import { AiMealPlanPanel } from "../result/AiMealPlanPanel";
import { AiMealPlanFailureScreen } from "../result/AiMealPlanFailureScreen";
import { extractAiResponseFromMealPlan } from "../../utils/mealPlanMerger";
import type { FoodPosition } from "../../api/mealPlanEditApi";
import type {
  AIFood,
  FavoriteFood,
  FoodCategory,
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
  showEmptyState: boolean;
  onFavoriteFoodToggle: (food: MealFood) => void;
  onRetryAiGenerate: () => void;
  onFoodSwap?: (position: FoodPosition, food: AIFood) => void;
  onMealRegenerate?: (mealType: FoodPosition["mealType"]) => void;
  regeneratingMealType?: FoodPosition["mealType"] | null;
  intakeEnabled?: boolean;
  onMealIntakeToggle?: (mealType: FoodPosition["mealType"], eaten: boolean) => void;
  // 영양 요약 아래, 끼니 목록 위에 놓을 카드 (식단 날짜 지정 등)
  scheduleCard?: ReactNode;
  // 지금 설정된 알레르기 분류. 있으면 성분표 확인 안내를 보여준다
  allergies?: FoodCategory[];
  // 저장된 식단 이름. 없으면 목표로 제목을 만든다
  planTitle?: string | null;
  // 있으면 제목 옆 연필 버튼으로 이름 변경 모달을 연다. 실패하면 예외를 던진다
  onRenameTitle?: (title: string) => Promise<void>;
  // 이 식단을 먹는 날짜 (YYYY-MM-DD)
  planDate?: string | null;
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
  onFoodSwap,
  onMealRegenerate,
  regeneratingMealType,
  intakeEnabled,
  onMealIntakeToggle,
  scheduleCard,
  allergies = [],
  planTitle,
  onRenameTitle,
  planDate = null,
}: ResultScreenProps) {
  const navigate = useNavigate();
  const [isRenaming, setIsRenaming] = useState(false);
  const renameButtonRef = useRef<HTMLButtonElement>(null);
  const favoriteFoodNames = new Set(
    favoriteFoods.map((favoriteFood) => favoriteFood.name),
  );
  const savedDate =
    savedAt == null
      ? null
      : new Date(savedAt).toLocaleDateString("ko-KR", { dateStyle: "medium" });
  const planDateLabel =
    planDate == null ? null : planDate === todayString() ? "오늘 먹는 식단" : `${formatDateLabel(planDate)} 식단`;
  const headerStep = [planDateLabel, isSavedView ? `${savedDate} 저장` : "AI 추천 식단"]
    .filter(Boolean)
    .join(" · ");

  const displayTitle = planTitle ?? `${GOAL_LABELS[goal]} 식단`;
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
              <header className="sectionHeader resultHeader">
                <div className="sectionHeaderStep">{headerStep}</div>
                <div className="resultTitleRow">
                  <h1>{displayTitle}</h1>
                  {onRenameTitle ? (
                    <button
                      ref={renameButtonRef}
                      type="button"
                      className="resultTitleEdit"
                      aria-label="식단 이름 변경"
                      aria-haspopup="dialog"
                      onClick={() => setIsRenaming(true)}
                    >
                      <PencilIcon />
                    </button>
                  ) : null}
                </div>
                <p>{`${profile.height}cm · ${profile.weight}kg 기준, 하루 ${mealPlan.targetCalories.toLocaleString()} kcal에 맞췄어요.`}</p>
              </header>
              {isRenaming && onRenameTitle ? (
                <TextInputSheet
                  title="식단 이름 변경"
                  label="식단 이름"
                  initialValue={displayTitle}
                  maxLength={30}
                  onSave={onRenameTitle}
                  onClose={() => {
                    setIsRenaming(false);
                    renameButtonRef.current?.focus({ focusVisible: false } as FocusOptions);
                  }}
                />
              ) : null}
              <NutritionPanel target={target} />
              {allergies.length > 0 ? (
                <div className="allergyNotice" role="note">
                  <AlertIcon aria-hidden="true" />
                  <p>
                    <strong>알레르기 · {allergies.map((category) => FOOD_CATEGORY_LABELS[category]).join(", ")}</strong>
                    이 분류는 빼고 만들었지만 AI 추천이라 소스·가공품 성분까지 보장하지는 못해요. 드시기 전에 성분표를 꼭
                    확인해 주세요.
                  </p>
                </div>
              ) : null}
              {scheduleCard}
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
            onFoodSwap={onFoodSwap}
            onMealRegenerate={onMealRegenerate}
            regeneratingMealType={regeneratingMealType}
            intakeEnabled={intakeEnabled}
            onMealIntakeToggle={onMealIntakeToggle}
          />
        </>
      ) : null}

    </section>
  );
}

