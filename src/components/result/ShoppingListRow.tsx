// 중복 재료를 합친 장보기 리스트 한 줄입니다.
import { Button } from "@toss/tds-mobile";
import { getShoppingHref } from "../../utils/shoppingHref";
import type { MealFood, ShoppingListItem } from "../../types/fitplate";

export interface ShoppingListRowProps {
  isFavorite: boolean;
  item: ShoppingListItem;
  onFavoriteFoodToggle: (food: MealFood) => void;
}

export function ShoppingListRow({ isFavorite, item, onFavoriteFoodToggle }: ShoppingListRowProps) {
  const favoriteFood: MealFood = {
    id: item.id,
    name: item.name,
    amount: item.amountText,
    calories: item.totalCalories,
    shoppingCategory: item.shoppingCategory,
  };

  const shoppingHref = getShoppingHref(item.shoppingCategory, item.shoppingKeyword);

  return (
    <div className="shoppingListRow">
      <div>
        <strong>{item.name}</strong>
        <span>
          {item.amountText} · {item.servingCount}회 ·{" "}
          {item.totalCalories.toLocaleString()} kcal
        </span>
      </div>
      <div className="foodRowActions">
        <button
          aria-label={`${item.name} 즐겨찾기`}
          className={isFavorite ? "favoriteFoodButton selected" : "favoriteFoodButton"}
          type="button"
          onClick={() => onFavoriteFoodToggle(favoriteFood)}
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
