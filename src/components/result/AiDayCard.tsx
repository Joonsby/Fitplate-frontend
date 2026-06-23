// 통합된 DayMeal에서 AI 식사명을 읽어 하루 식단을 요약합니다.
import type { DayMeal } from "../../types/fitplate";

export interface AiDayCardProps {
  dayMeal: DayMeal;
}

export function AiDayCard({ dayMeal }: AiDayCardProps) {
  const breakfast = dayMeal.meals.find((m) => m.mealType === "breakfast");
  const lunch = dayMeal.meals.find((m) => m.mealType === "lunch");
  const dinner = dayMeal.meals.find((m) => m.mealType === "dinner");

  return (
    <article className="aiDayCard">
      <p>아침: {breakfast?.name ?? "-"}</p>
      <p>점심: {lunch?.name ?? "-"}</p>
      <p>저녁: {dinner?.name ?? "-"}</p>
    </article>
  );
}
