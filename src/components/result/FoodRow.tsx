// 식단 안의 음식 한 줄을 보여주는 컴포넌트입니다.
import "../common/FoodRow.css";
import { Button } from "../common/Button";
import { CartIcon, StarIcon, SwapIcon } from "../common/Icons";
import { getShoppingHref } from "../../utils/shoppingHref";
import type { MealFood } from "../../types/fitplate";

export interface FoodRowProps {
  food: MealFood;
  isFavorite: boolean;
  onFavoriteFoodToggle: (food: MealFood) => void;
  onSwap?: () => void;
}

export function FoodRow({ food, isFavorite, onFavoriteFoodToggle, onSwap }: FoodRowProps) {
  const shoppingHref = getShoppingHref(food.shoppingCategory, food.shoppingKeyword, food.name);

  return (
    <div className="foodRow">
      <div className="foodRowInfo">
        <strong>{food.name}</strong>
        <span>
          {food.amount} · {food.calories} kcal
        </span>
      </div>
      <div className="foodRowActions">
        <button
          type="button"
          aria-label={`${food.name} 즐겨찾기`}
          aria-pressed={isFavorite}
          className={isFavorite ? "favoriteFoodButton selected" : "favoriteFoodButton"}
          onClick={() => onFavoriteFoodToggle(food)}
        >
          <StarIcon />
        </button>
        {onSwap ? (
          <button
            type="button"
            aria-label={`${food.name} 다른 음식으로 바꾸기`}
            className="favoriteFoodButton foodSwapButton"
            onClick={onSwap}
          >
            <SwapIcon />
          </button>
        ) : null}
        <Button
          size="small"
          variant="secondary"
          aria-label={`${food.name} 구매하기`}
          onClick={() => window.open(shoppingHref, "_blank", "noopener,noreferrer")}
        >
          <CartIcon />
          <span className="foodRowBuyLabel">구매</span>
        </Button>
      </div>
    </div>
  );
}
