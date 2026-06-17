// 즐겨찾기 음식 관련 API 함수 모음
import type { FavoriteFood, MealFood } from "../types/fitplate";
import { API_ENDPOINTS, getApiUrl } from "./apiConfig";
import { getAccessToken } from "./authToken";

export async function getFavoriteFoods(): Promise<FavoriteFood[]> {
  let response: Response;

  try {
    const accessToken = getAccessToken();
    response = await fetch(getApiUrl(API_ENDPOINTS.FAVORITE_FOODS), {
      headers: { "Authorization": `Bearer ${accessToken}` },
    });
  } catch (error) {
    console.log("즐겨찾기 목록 조회 네트워크 오류:", error);
    throw new Error("즐겨찾기 목록 조회에 실패했습니다. 잠시 후 다시 시도해주세요.");
  }

  if (!response.ok) {
    const errorText = await response.text();
    console.error("즐겨찾기 목록 조회 API 호출 실패:", {
      status: response.status,
      statusText: response.statusText,
      body: errorText,
    });
    throw new Error("즐겨찾기 목록 조회에 실패했습니다. 잠시 후 다시 시도해주세요.");
  }

  return response.json() as Promise<FavoriteFood[]>;
}

export interface ToggleFavoriteFoodResult {
  favorited: boolean;
  action: "ADDED" | "REMOVED";
  favoriteFoodId: number;
}

export async function toggleFavoriteFood(food: MealFood): Promise<ToggleFavoriteFoodResult> {
  let response: Response;

  try {
    const accessToken = getAccessToken();
    response = await fetch(getApiUrl(`${API_ENDPOINTS.FAVORITE_FOODS}/toggle`), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        name: food.name,
        amount: food.amount,
        calories: food.calories,
        carbohydrate: food.carbohydrate ?? 0,
        protein: food.protein ?? 0,
        fat: food.fat ?? 0,
        shoppingCategory: food.shoppingCategory,
        shoppingKeyword: food.shoppingKeyword,
        sourceFoodId: food.id,
      }),
    });
  } catch (error) {
    console.log("즐겨찾기 변경 네트워크 오류:", error);
    throw new Error("즐겨찾기 변경에 실패했습니다. 잠시 후 다시 시도해주세요.");
  }

  if (!response.ok) {
    const errorText = await response.text();
    console.error("즐겨찾기 변경 API 호출 실패:", {
      status: response.status,
      statusText: response.statusText,
      body: errorText,
    });
    throw new Error("즐겨찾기 변경에 실패했습니다. 잠시 후 다시 시도해주세요.");
  }

  return response.json() as Promise<ToggleFavoriteFoodResult>;
}
