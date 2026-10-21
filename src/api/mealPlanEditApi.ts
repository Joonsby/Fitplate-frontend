// 저장된 식단의 음식 한 개를 영양이 비슷한 AI 대안으로 바꾸는 API 함수 모음
import type { AIFood, AIMeal, SavedMealPlan } from "../types/fitplate";
import { API_ENDPOINTS, getApiUrl } from "./apiConfig";
import { apiFetch } from "./httpClient";
import { toSavedMealPlanFromApi } from "./mealPlanStorageApi";
import type { ApiSavedMealPlan } from "./mealPlanStorageApi";

export interface FoodPosition {
  mealType: AIMeal["mealType"];
  foodIndex: number;
}

/** fromFavorites 는 내 즐겨찾기에서 가져온 대안인지 여부다. */
export interface FoodAlternative extends AIFood {
  fromFavorites: boolean;
}

export interface FoodAlternatives {
  original: AIFood;
  alternatives: FoodAlternative[];
}

interface ApiFoodAlternatives {
  original: AIFood;
  alternatives: AIFood[];
  favoriteNames?: string[];
}

/** excludeNames 는 이미 보여준 음식 이름으로, 서버가 다시 제안하지 않는다. */
export async function suggestFoodAlternatives(
  mealPlanId: string,
  position: FoodPosition,
  excludeNames: string[] = [],
): Promise<FoodAlternatives> {
  const data = await apiFetch<ApiFoodAlternatives>(
    getApiUrl(`${API_ENDPOINTS.MEAL_PLAN}/${mealPlanId}/foods/alternatives`),
    {
      method: "POST",
      body: { ...position, excludeNames },
      networkErrorMessage: "다른 음식을 찾지 못했어요. 잠시 후 다시 시도해 주세요.",
      httpErrorMessage: "다른 음식을 찾지 못했어요. 잠시 후 다시 시도해 주세요.",
    },
  );
  const favorites = new Set(data.favoriteNames ?? []);
  return {
    original: data.original,
    alternatives: data.alternatives.map((food) => ({ ...food, fromFavorites: favorites.has(food.name) })),
  };
}

export async function replaceMealPlanFood(
  mealPlanId: string,
  position: FoodPosition,
  food: AIFood,
): Promise<SavedMealPlan> {
  const data = await apiFetch<ApiSavedMealPlan>(
    getApiUrl(`${API_ENDPOINTS.MEAL_PLAN}/${mealPlanId}/foods`),
    {
      method: "PUT",
      body: {
        ...position,
        food: {
          name: food.name,
          amount: food.amount,
          calories: food.calories,
          protein: food.protein,
          carbohydrate: food.carbohydrate,
          fat: food.fat,
          shoppingKeyword: food.shoppingKeyword,
        },
      },
      networkErrorMessage: "음식을 바꾸지 못했어요. 잠시 후 다시 시도해 주세요.",
      httpErrorMessage: "음식을 바꾸지 못했어요. 잠시 후 다시 시도해 주세요.",
    },
  );
  return toSavedMealPlanFromApi(data);
}

export async function regenerateMeal(
  mealPlanId: string,
  mealType: FoodPosition["mealType"],
): Promise<SavedMealPlan> {
  const data = await apiFetch<ApiSavedMealPlan>(
    getApiUrl(`${API_ENDPOINTS.MEAL_PLAN}/${mealPlanId}/meals/${mealType}/regenerate`),
    {
      method: "POST",
      networkErrorMessage: "끼니를 다시 만들지 못했어요. 잠시 후 다시 시도해 주세요.",
      httpErrorMessage: "끼니를 다시 만들지 못했어요. 잠시 후 다시 시도해 주세요.",
    },
  );
  return toSavedMealPlanFromApi(data);
}
