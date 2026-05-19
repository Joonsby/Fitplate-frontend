import type { FavoriteFood, MealFood } from "../types/fitplate";

const STORAGE_KEY = "fitplate.favoriteFoods";

// 음식 이름과 카테고리로 즐겨찾기 id를 만듭니다.
// 같은 이름이라도 카테고리가 다르면 다른 항목으로 볼 수 있게 합니다.
export function createFavoriteFoodId(food: Pick<MealFood, "name" | "shoppingCategory">): string {
  return `${food.shoppingCategory}:${food.name}`;
}

// localStorage에서 즐겨찾기 음식 목록을 읽습니다.
// 저장된 값이 깨져 있어도 앱이 멈추지 않도록 빈 배열을 반환합니다.
export function getFavoriteFoods(): FavoriteFood[] {
  const rawValue = localStorage.getItem(STORAGE_KEY);

  if (rawValue == null) {
    return [];
  }

  try {
    const parsedValue = JSON.parse(rawValue);

    return Array.isArray(parsedValue) ? (parsedValue as FavoriteFood[]) : [];
  } catch {
    return [];
  }
}

// 즐겨찾기 목록을 localStorage에 저장합니다.
function setFavoriteFoods(favoriteFoods: FavoriteFood[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(favoriteFoods));
}

// 자주 사용하는 음식이 위에 오도록 정렬합니다.
// useCount가 같다면 최근에 즐겨찾기한 음식을 먼저 보여줍니다.
export function sortFavoriteFoods(favoriteFoods: FavoriteFood[]): FavoriteFood[] {
  return [...favoriteFoods].sort((first, second) => {
    if (second.useCount !== first.useCount) {
      return second.useCount - first.useCount;
    }

    return (
      new Date(second.updatedAt).getTime() - new Date(first.updatedAt).getTime()
    );
  });
}

// 음식 즐겨찾기를 켜거나 끕니다.
// 이미 있으면 삭제하고, 없으면 추가합니다.
export function toggleFavoriteFood(food: MealFood): FavoriteFood[] {
  const favoriteFoods = getFavoriteFoods();
  const favoriteFoodId = createFavoriteFoodId(food);
  const existingFavoriteFood = favoriteFoods.find(
    (favoriteFood) => favoriteFood.id === favoriteFoodId,
  );

  if (existingFavoriteFood != null) {
    const nextFavoriteFoods = favoriteFoods.filter(
      (favoriteFood) => favoriteFood.id !== favoriteFoodId,
    );

    setFavoriteFoods(nextFavoriteFoods);
    return sortFavoriteFoods(nextFavoriteFoods);
  }

  const now = new Date().toISOString();
  const nextFavoriteFoods = [
    ...favoriteFoods,
    {
      id: favoriteFoodId,
      name: food.name,
      shoppingCategory: food.shoppingCategory,
      useCount: 1,
      createdAt: now,
      updatedAt: now,
    },
  ];

  setFavoriteFoods(nextFavoriteFoods);
  return sortFavoriteFoods(nextFavoriteFoods);
}

// 즐겨찾기 목록 화면에서 특정 음식을 삭제할 때 사용합니다.
export function deleteFavoriteFood(id: string): FavoriteFood[] {
  const nextFavoriteFoods = getFavoriteFoods().filter(
    (favoriteFood) => favoriteFood.id !== id,
  );

  setFavoriteFoods(nextFavoriteFoods);
  return sortFavoriteFoods(nextFavoriteFoods);
}
