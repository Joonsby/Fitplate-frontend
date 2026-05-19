import type { MealPlan, ShoppingListItem } from "../types/fitplate";

// "150g", "1개"처럼 단순한 수량 문구를 숫자와 단위로 나눠봅니다.
// 복잡한 문구라면 null을 반환하고, 그 경우에는 "N회분"으로 표시합니다.
function parseAmount(amount: string): { value: number; unit: string } | null {
  const match = amount.match(/^(\d+(?:\.\d+)?)(g|개)$/);

  if (match == null) {
    return null;
  }

  return {
    value: Number(match[1]),
    unit: match[2],
  };
}

// 같은 음식의 수량을 합쳐서 표시할 문구를 만듭니다.
// 예: ["150g", "150g"] -> "300g", ["한 줌", "두 줌"] -> "2회분"
function buildAmountText(amounts: string[]): string {
  const parsedAmounts = amounts.map(parseAmount);
  const canSum =
    parsedAmounts.every((amount) => amount != null) &&
    new Set(parsedAmounts.map((amount) => amount?.unit)).size === 1;

  if (!canSum) {
    return `${amounts.length}회분`;
  }

  const unit = parsedAmounts[0]?.unit ?? "";
  const total = parsedAmounts.reduce(
    (sum, amount) => sum + (amount?.value ?? 0),
    0,
  );

  return `${total}${unit}`;
}

// 기간 식단 전체를 돌면서 중복 재료를 합친 장보기 리스트를 만듭니다.
// 같은 이름과 같은 쇼핑 카테고리를 가진 음식은 하나의 항목으로 합칩니다.
export function aggregateShoppingList(mealPlan: MealPlan): ShoppingListItem[] {
  const itemMap = new Map<
    string,
    Omit<ShoppingListItem, "amountText"> & { amounts: string[] }
  >();

  mealPlan.days.forEach((day) => {
    day.meals.forEach((meal) => {
      meal.foods.forEach((food) => {
        const key = `${food.shoppingCategory}:${food.name}`;
        const existingItem = itemMap.get(key);

        if (existingItem == null) {
          itemMap.set(key, {
            id: key,
            name: food.name,
            amounts: [food.amount],
            totalCalories: food.calories,
            servingCount: 1,
            shoppingCategory: food.shoppingCategory,
          });
          return;
        }

        existingItem.amounts.push(food.amount);
        existingItem.totalCalories += food.calories;
        existingItem.servingCount += 1;
      });
    });
  });

  return Array.from(itemMap.values()).map((item) => ({
    id: item.id,
    name: item.name,
    amountText: buildAmountText(item.amounts),
    totalCalories: item.totalCalories,
    servingCount: item.servingCount,
    shoppingCategory: item.shoppingCategory,
  }));
}
