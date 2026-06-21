import { Button } from "@toss/tds-mobile";
import { GOAL_LABELS } from "../../types/fitplate";
import { ScreenSectionHeader } from "../common/ScreenSectionHeader";
import { EmptyState } from "../common/EmptyState";
import type { SavedMealPlan } from "../../types/fitplate";

interface SavedMealPlansScreenProps {
  savedMealPlans: SavedMealPlan[];
  onBack: () => void;
  onDelete: (id: string) => void;
  onView: (savedMealPlan: SavedMealPlan) => void;
}

export function SavedMealPlansScreen({
  savedMealPlans,
  onBack,
  onDelete,
  onView,
}: SavedMealPlansScreenProps) {  
  return (
    <section className="screen">
      <ScreenSectionHeader
        description="저장된 식단을 확인하고 다시 볼 수 있습니다."
        step="저장 목록"
        title="저장된 식단"
      />

      <div className="savedMealPlansContent">
        {savedMealPlans.length === 0 ? (
          <EmptyState
            title="아직 저장된 식단이 없어요"
            description="식단을 생성하면 식단이 자동으로 저장됩니다."
          />
        ) : (
          <div className="savedPlanList">
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

        <Button variant="weak" onClick={onBack}>
            돌아가기
          </Button>
      </div>
    </section>
  );
}

interface SavedMealPlanCardProps {
  savedMealPlan: SavedMealPlan;
  onDelete: (id: string) => void;
  onView: (savedMealPlan: SavedMealPlan) => void;
}

function SavedMealPlanCard({
  savedMealPlan,
  onDelete,
  onView,
}: SavedMealPlanCardProps) {
  const savedDate = new Date(savedMealPlan.savedAt).toLocaleString("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <article className="savedPlanCard">
      <div>
        <strong>
          {GOAL_LABELS[savedMealPlan.goal]} · {savedMealPlan.planDuration}일 식단
        </strong>
        <p>{savedDate}</p>
        <span>
          목표 {savedMealPlan.target.calories.toLocaleString()} kcal · 기준{" "}
          {savedMealPlan.mealPlan.targetCalories.toLocaleString()} kcal
        </span>
      </div>

      <div className="savedPlanActions">
        <button type="button" onClick={() => onView(savedMealPlan)}>
          다시 보기
        </button>
        <button type="button" onClick={() => onDelete(savedMealPlan.id)}>
          삭제
        </button>
      </div>
    </article>
  );
}
