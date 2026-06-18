// 장보기 리스트를 더보기/접기로 제어하는 섹션 컴포넌트입니다.
import { Button} from "@toss/tds-mobile";
import { useState } from "react";
import { ShoppingListRow } from "./ShoppingListRow";
import type { MealFood, ShoppingListItem } from "../../types/fitplate";

const INITIAL_COUNT = 5;

interface ShoppingListSectionProps {
  shoppingList: ShoppingListItem[];
  favoriteFoodNames: Set<string>;
  onFavoriteFoodToggle: (food: MealFood) => void;
}

export function ShoppingListSection({ shoppingList, favoriteFoodNames, onFavoriteFoodToggle }: ShoppingListSectionProps) {
  const [expanded, setExpanded] = useState(false);
  const hasMore = shoppingList.length > INITIAL_COUNT;
  const visibleItems = expanded ? shoppingList : shoppingList.slice(0, INITIAL_COUNT);
  const hiddenCount = shoppingList.length - INITIAL_COUNT;

  return (
    <div className="shoppingList">
      <div className="mealCard">
        <div className="mealListHeader">
          <h3>장보기 리스트</h3>
          <span>{shoppingList.length}개 재료</span>
        </div>

        {visibleItems.map((item) => (
          <ShoppingListRow
            isFavorite={favoriteFoodNames.has(item.name)}
            item={item}
            key={item.id}
            onFavoriteFoodToggle={onFavoriteFoodToggle}
          />
        ))}

        {hasMore && (
          <Button
            type="button"
            size="medium"
            color="dark"
            variant="weak"
            onClick={() => setExpanded((prev) => !prev)}
          >
            {expanded ? "접기" : `더보기 ${hiddenCount}개`}
          </Button>
        )}
      </div>
    </div>
  );
}
