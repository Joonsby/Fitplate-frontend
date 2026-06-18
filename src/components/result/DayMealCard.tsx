// 하루치 식단을 카드로 보여주는 컴포넌트입니다.
import { FoodRow } from "./FoodRow";
import type { DayMeal, MealFood } from "../../types/fitplate";

export interface DayMealCardProps {
  dayMeal: DayMeal;
  favoriteFoodNames: Set<string>;
  onFavoriteFoodToggle: (food: MealFood) => void;
}

export function DayMealCard({ dayMeal, favoriteFoodNames, onFavoriteFoodToggle }: DayMealCardProps) {
  return (
    <article className="dayMealCard">
      <div className="dayMealHeader">
        <strong>{dayMeal.title}</strong>
        <span>{dayMeal.totalCalories.toLocaleString()} kcal</span>
      </div>

      {dayMeal.meals.map((meal) => (
        <div className="mealCard" key={meal.id}>
          <div className="mealCardHeader">
            <strong>{meal.title}</strong>
            <span>{meal.calories} kcal</span>
          </div>

          <div className="foodList">
            {meal.foods.map((food) => (
              <FoodRow
                food={food}
                isFavorite={favoriteFoodNames.has(food.name)}
                key={food.id}
                onFavoriteFoodToggle={onFavoriteFoodToggle}
              />
            ))}
          </div>
        </div>
      ))}
    </article>
  );
}
