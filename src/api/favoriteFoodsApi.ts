// 즐겨찾기 음식 관련 API 함수 모음
import type { FavoriteFood, MealFood } from "../types/fitplate";
import { API_ENDPOINTS, getApiUrl } from "./apiConfig";
import { apiFetch } from "./httpClient";

export async function getFavoriteFoods(): Promise<FavoriteFood[]> {
  return apiFetch<FavoriteFood[]>(getApiUrl(API_ENDPOINTS.FAVORITE_FOODS), {
    networkErrorMessage: "즐겨찾기 목록 조회에 실패했습니다. 잠시 후 다시 시도해주세요.",
    httpErrorMessage: "즐겨찾기 목록 조회에 실패했습니다. 잠시 후 다시 시도해주세요.",
  });
}

export interface ToggleFavoriteFoodResult {
  favorited: boolean;
  action: "ADDED" | "REMOVED";
  favoriteFoodId: number;
}

export async function toggleFavoriteFood(food: MealFood): Promise<ToggleFavoriteFoodResult> {
  return apiFetch<ToggleFavoriteFoodResult>(
    getApiUrl(`${API_ENDPOINTS.FAVORITE_FOODS}/toggle`),
    {
      method: "POST",
      body: {
        name: food.name,
        amount: food.amount,
        calories: food.calories,
        carbohydrate: food.carbohydrate ?? 0,
        protein: food.protein ?? 0,
        fat: food.fat ?? 0,
        shoppingCategory: food.shoppingCategory,
        shoppingKeyword: food.shoppingKeyword,
        sourceFoodId: food.id,
      },
      networkErrorMessage: "즐겨찾기 변경에 실패했습니다. 잠시 후 다시 시도해주세요.",
      httpErrorMessage: "즐겨찾기 변경에 실패했습니다. 잠시 후 다시 시도해주세요.",
    }
  );
}
