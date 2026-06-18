// 식단 안의 음식 한 줄을 보여주는 컴포넌트입니다.
import { Button } from "@toss/tds-mobile";
import { getShoppingHref } from "../../utils/shoppingHref";
import type { MealFood } from "../../types/fitplate";

export interface FoodRowProps {
  food: MealFood;
  isFavorite: boolean;
  onFavoriteFoodToggle: (food: MealFood) => void;
}

export function FoodRow({ food, isFavorite, onFavoriteFoodToggle }: FoodRowProps) {
  const shoppingHref = getShoppingHref(food.shoppingCategory, food.shoppingKeyword);

  return (
    <div className="foodRow">
      <div>
        <strong>{food.name}</strong>
        <span>
          {food.amount} · {food.calories} kcal
        </span>
      </div>
      <div className="foodRowActions">
        <button
          type="button"
          aria-label={`${food.name} 즐겨찾기`}
          className={isFavorite ? "favoriteFoodButton selected" : "favoriteFoodButton"}
          onClick={() => onFavoriteFoodToggle(food)}
        >
          ★
        </button>
        <Button
          size="medium"
          variant="weak"
          onClick={() => window.open(shoppingHref, "_blank", "noopener,noreferrer")}
        >
          구매하기
        </Button>
      </div>
    </div>
  );
}
