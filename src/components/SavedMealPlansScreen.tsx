import { Button } from "@toss/tds-mobile";
import { GOAL_LABELS } from "../types/fitplate";
import { ScreenSectionHeader } from "./ScreenSectionHeader";
import type { SavedMealPlan } from "../types/fitplate";

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
          <div className="emptySavedList">
            <strong>아직 저장된 식단이 없어요</strong>
            <p>결과 화면에서 식단을 저장하면 여기에 표시됩니다.</p>
          </div>
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

        <Button variant="weak" onClick={onBack}>돌아가기</Button>
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

  console.log(savedMealPlan);

  return (
    <article className="savedPlanCard">
      <div>
        <strong>
          {GOAL_LABELS[savedMealPlan.goal]} · {savedMealPlan.durationDays}일 식단
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
