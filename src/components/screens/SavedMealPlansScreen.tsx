// 저장된 식단 목록을 카드로 보여주고 다시 보기·삭제를 연결합니다.
import "../../styles/layout.css";
import "./SavedMealPlansScreen.css";
import { GOAL_LABELS } from "../../types/fitplate";
import { ScreenSectionHeader } from "../common/ScreenSectionHeader";
import { EmptyState } from "../common/EmptyState";
import { SkeletonList } from "../common/SkeletonList";
import { Button } from "../common/Button";
import { BookmarkIcon, ChevronRightIcon } from "../common/Icons";
import type { SavedMealPlan } from "../../types/fitplate";

interface SavedMealPlansScreenProps {
  savedMealPlans: SavedMealPlan[];
  isLoading: boolean;
  onCreate: () => void;
  onDelete: (id: string) => void;
  onView: (savedMealPlan: SavedMealPlan) => void;
}

export function SavedMealPlansScreen({
  savedMealPlans,
  isLoading,
  onCreate,
  onDelete,
  onView,
}: SavedMealPlansScreenProps) {
  return (
    <section className="screen">
      <ScreenSectionHeader
        title="저장 식단"
        description="만든 식단은 자동으로 저장돼요. 눌러서 다시 볼 수 있어요."
      />

      {isLoading && savedMealPlans.length === 0 ? (
        <SkeletonList />
      ) : savedMealPlans.length === 0 ? (
        <EmptyState
          icon={<BookmarkIcon />}
          title="아직 저장된 식단이 없어요"
          description="식단을 만들면 이곳에 자동으로 모여요."
        >
          <Button block size="medium" onClick={onCreate}>
            새 식단 만들기
          </Button>
        </EmptyState>
      ) : (
        <div className="screenList">
          {savedMealPlans.map((savedMealPlan) => (
            <SavedMealPlanCard
              key={savedMealPlan.id}
              savedMealPlan={savedMealPlan}
              onDelete={onDelete}
              onView={onView}
            />
          ))}
        </div>
      )}
    </section>
  );
}

interface SavedMealPlanCardProps {
  savedMealPlan: SavedMealPlan;
  onDelete: (id: string) => void;
  onView: (savedMealPlan: SavedMealPlan) => void;
}

function SavedMealPlanCard({ savedMealPlan, onDelete, onView }: SavedMealPlanCardProps) {
  const savedDate = new Date(savedMealPlan.savedAt).toLocaleString("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <article className="card savedPlanCard">
      <button type="button" className="savedPlanMain" onClick={() => onView(savedMealPlan)}>
        <span className="goalChip">{GOAL_LABELS[savedMealPlan.goal]}</span>
        <span className="savedPlanText">
          <strong>하루 {savedMealPlan.target.calories.toLocaleString()} kcal 식단</strong>
          <span>{savedDate}</span>
        </span>
        <ChevronRightIcon className="savedPlanChevron" />
      </button>
      <div className="savedPlanFooter">
        <span>
          {savedMealPlan.profile.height}cm · {savedMealPlan.profile.weight}kg 기준
        </span>
        <button
          type="button"
          className="savedPlanDelete"
          onClick={() => onDelete(savedMealPlan.id)}
        >
          삭제
        </button>
      </div>
    </article>
  );
}
