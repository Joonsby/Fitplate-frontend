// 일차별 식단을 세로 리스트로 렌더링하고 각 일차 안에서 끼니를 Swiper로 탐색합니다.
import { MealSwiper } from "./MealSwiper";
import type { DayMeal, MealFood } from "../../types/fitplate";

interface DayMealSwiperProps {
  days: DayMeal[];
  favoriteFoodNames: Set<string>;
  onFavoriteFoodToggle: (food: MealFood) => void;
}

export function DayMealSwiper({ days, favoriteFoodNames, onFavoriteFoodToggle }: DayMealSwiperProps) {
  return (
    <div className="mealList dayMealSwiper">
      <div className="mealListHeader">
        <h3>날짜별 식단</h3>
      </div>
      {days.map((dayMeal) => (
        <div key={dayMeal.id} className="dayMealSection">
          <div className="dayMealSectionHeader">
            <strong>{dayMeal.title}</strong>
            <span>{dayMeal.totalCalories.toLocaleString()} kcal</span>
          </div>
          <MealSwiper
            meals={dayMeal.meals}
            favoriteFoodNames={favoriteFoodNames}
            onFavoriteFoodToggle={onFavoriteFoodToggle}
          />
        </div>
      ))}
    </div>
  );
}
