import { Button } from "@toss/tds-mobile";
import { GOAL_LABELS } from "../constants/fitplate";
import type { SavedMealPlan } from "../types/fitplate";

interface SavedMealPlansScreenProps {
  savedMealPlans: SavedMealPlan[];
  onBack: () => void;
  onDelete: (id: string) => void;
  onView: (savedMealPlan: SavedMealPlan) => void;
}

// 저장된 식단 목록 화면입니다.
// localStorage 데이터는 App에서 읽고, 이 컴포넌트는 화면 표시와 버튼 이벤트만 담당합니다.
export function SavedMealPlansScreen({
  savedMealPlans,
  onBack,
  onDelete,
  onView,
}: SavedMealPlansScreenProps) {
  return (
    <section className="screen">
      <div className="sectionHeader">
        <p className="stepText">저장 목록</p>
        <h2>저장된 식단</h2>
        <p>브라우저 localStorage에 저장된 식단만 표시됩니다.</p>
      </div>

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

      <Button variant="weak" onClick={onBack}>
        돌아가기
      </Button>
    </section>
  );
}

interface SavedMealPlanCardProps {
  savedMealPlan: SavedMealPlan;
  onDelete: (id: string) => void;
  onView: (savedMealPlan: SavedMealPlan) => void;
}

// 저장된 식단 카드입니다.
// 저장 날짜와 핵심 정보를 보여주고, 다시 보기와 삭제 액션을 제공합니다.
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
