// 고른 날짜의 식단 끼니를 체크하고, 완료율과 목표·계획·섭취 칼로리를 보여줍니다.
import "../result/MealCard.css";
import "../common/SkeletonList.css";
import "./DayRecordCard.css";
import type { DailyRecord, MealType } from "../../api/mealIntakeApi";
import { Button } from "../common/Button";
import { CalendarCheckIcon, CheckIcon, ChevronRightIcon } from "../common/Icons";
import { formatDateLabel } from "../../utils/date";

const MEAL_LABELS: Record<MealType, string> = { breakfast: "아침", lunch: "점심", dinner: "저녁" };

interface DayRecordCardProps {
  record: DailyRecord | undefined;
  date: string;
  isLoading: boolean;
  onToggle: (mealType: MealType, eaten: boolean) => void;
  onOpenMealPlan: (mealPlanId: string) => void;
  onPickPlan: () => void;
  onCreate: () => void;
}

export function DayRecordCard({
  record,
  date,
  isLoading,
  onToggle,
  onOpenMealPlan,
  onPickPlan,
  onCreate,
}: DayRecordCardProps) {
  if (isLoading && record == null) {
    return (
      <section className="card dayRecord dayRecordLoading" aria-busy="true">
        <span className="fpSkeletonLine" style={{ width: "40%" }} />
        <span className="fpSkeletonLine" style={{ width: "100%" }} />
        <span className="fpSkeletonLine" style={{ width: "80%" }} />
      </section>
    );
  }

  if (record == null || record.status === "NO_PLAN" || record.mealPlanId == null) {
    return (
      <section className="card dayRecord dayRecordEmpty">
        <span className="dayRecordEmptyIcon" aria-hidden="true">
          <CalendarCheckIcon />
        </span>
        <strong>{formatDateLabel(date)}에 정한 식단이 없어요</strong>
        <p>저장한 식단을 이 날짜에 지정하면 끼니마다 먹었는지 기록할 수 있어요.</p>
        <div className="dayRecordEmptyActions">
          <Button size="medium" onClick={onPickPlan}>
            저장 식단에서 고르기
          </Button>
          <Button size="medium" variant="ghost" onClick={onCreate}>
            새 식단 만들기
          </Button>
        </div>
      </section>
    );
  }

  const upcoming = record.status === "UPCOMING";
  const rate = record.completionRate ?? 0;

  return (
    <section className="card dayRecord" aria-label={`${formatDateLabel(date)} 기록`}>
      <div className="dayRecordHead">
        <strong>{formatDateLabel(date)}</strong>
        <span className={`dayRecordBadge dayRecordBadge--${record.status}`}>
          {upcoming ? "예정" : `${record.eatenMeals}/${record.plannedMeals} 끼니`}
        </span>
      </div>

      {!upcoming ? (
        <div className="dayRecordProgress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(rate * 100)}>
          <span style={{ width: `${rate * 100}%` }} />
        </div>
      ) : null}

      <ul className="dayRecordMeals">
        {record.meals.map((meal) => (
          <li key={meal.mealType}>
            <button
              type="button"
              className={`dayRecordMeal${meal.eaten ? " isEaten" : ""}`}
              aria-pressed={meal.eaten}
              disabled={upcoming}
              onClick={() => onToggle(meal.mealType, !meal.eaten)}
            >
              <span className="mealIntakeBox" aria-hidden="true">
                {meal.eaten ? <CheckIcon /> : null}
              </span>
              <span className="dayRecordMealText">
                <strong>{MEAL_LABELS[meal.mealType]}</strong>
                <span>{meal.foodNames.join(", ")}</span>
              </span>
              <span className="dayRecordMealKcal">{meal.calories.toLocaleString()} kcal</span>
            </button>
          </li>
        ))}
      </ul>
      {upcoming ? <p className="dayRecordHint">그날이 되면 먹은 끼니를 체크할 수 있어요.</p> : null}

      <dl className="dayRecordTotals">
        <div>
          <dt>목표</dt>
          <dd>{record.target ? `${record.target.calories.toLocaleString()} kcal` : "-"}</dd>
        </div>
        <div>
          <dt>식단 계획</dt>
          <dd>{record.planned ? `${record.planned.calories.toLocaleString()} kcal` : "-"}</dd>
        </div>
        <div className="isEaten">
          <dt>실제 섭취</dt>
          <dd>{record.eaten ? `${record.eaten.calories.toLocaleString()} kcal` : "기록 없음"}</dd>
        </div>
      </dl>

      <div className="dayRecordLinks">
        <button type="button" className="textLink" onClick={() => onOpenMealPlan(String(record.mealPlanId))}>
          식단 자세히 보기
          <ChevronRightIcon />
        </button>
      </div>
    </section>
  );
}
