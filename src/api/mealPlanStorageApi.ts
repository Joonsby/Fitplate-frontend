import type {
  AIMealPlanResponse,
  FavoriteFood,
  GoalType,
  MealFood,
  MealPlan,
  NutritionTarget,
  PlanDuration,
  SavedMealPlan,
  UserProfile,
} from "../types/fitplate";
import { API_ENDPOINTS, getApiUrl, getMealPlanFavoriteUrl } from "./apiConfig";

export interface CreateSavedMealPlanInput {
  profile: UserProfile;
  goal: GoalType;
  target: NutritionTarget;
  planDuration: PlanDuration;
  mealPlan: MealPlan;
  aiMealPlanResponse?: AIMealPlanResponse;
}

function createClientId(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${prefix}-${Date.now()}`;
}

function toSavedMealPlan(
  input: CreateSavedMealPlanInput,
  responseBody: unknown,
): SavedMealPlan {
  const responseRecord =
    responseBody != null && typeof responseBody === "object"
      ? (responseBody as Partial<SavedMealPlan>)
      : {};

  return {
    id:
      typeof responseRecord.id === "string"
        ? responseRecord.id
        : createClientId("meal-plan"),
    savedAt:
      typeof responseRecord.savedAt === "string"
        ? responseRecord.savedAt
        : new Date().toISOString(),
    profile: responseRecord.profile ?? input.profile,
    goal: responseRecord.goal ?? input.goal,
    target: responseRecord.target ?? input.target,
    planDuration: responseRecord.planDuration ?? input.planDuration,
    mealPlan: responseRecord.mealPlan ?? input.mealPlan,
    aiMealPlanResponse:
      responseRecord.aiMealPlanResponse ?? input.aiMealPlanResponse,
  };
}

async function readOptionalJson(response: Response): Promise<unknown> {
  const text = await response.text();

  if (text.length === 0) {
    return null;
  }

  return JSON.parse(text);
}

export async function createSavedMealPlan(
  input: CreateSavedMealPlanInput,
): Promise<SavedMealPlan> {
  const response = await fetch(getApiUrl(API_ENDPOINTS.MEAL_PLANS), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error("식단 저장에 실패했습니다. 잠시 후 다시 시도해주세요.");
  }

  const responseBody = await readOptionalJson(response);

  return toSavedMealPlan(input, responseBody);
}

export async function deleteSavedMealPlanById(
  mealPlanId: string,
): Promise<void> {
  const response = await fetch(
    getApiUrl(`${API_ENDPOINTS.MEAL_PLANS}/${mealPlanId}`),
    {
      method: "DELETE",
    },
  );

  if (!response.ok) {
    throw new Error("식단 삭제에 실패했습니다. 잠시 후 다시 시도해주세요.");
  }
}

export async function addMealPlanFavorite({
  mealPlanId,
  food,
}: {
  mealPlanId: string;
  food: MealFood;
}): Promise<FavoriteFood> {
  const response = await fetch(getMealPlanFavoriteUrl(mealPlanId), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ food }),
  });

  if (!response.ok) {
    throw new Error("즐겨찾기 추가에 실패했습니다. 잠시 후 다시 시도해주세요.");
  }

  const responseBody = await readOptionalJson(response);
  const responseRecord =
    responseBody != null && typeof responseBody === "object"
      ? (responseBody as Partial<FavoriteFood>)
      : {};
  const now = new Date().toISOString();

  return {
    id:
      typeof responseRecord.id === "string"
        ? responseRecord.id
        : `${mealPlanId}:${food.name}`,
    name: responseRecord.name ?? food.name,
    shoppingCategory: responseRecord.shoppingCategory ?? food.shoppingCategory,
    useCount: responseRecord.useCount ?? 1,
    createdAt: responseRecord.createdAt ?? now,
    updatedAt: responseRecord.updatedAt ?? now,
  };
}

export async function deleteMealPlanFavorite(
  mealPlanId: string,
): Promise<void> {
  const response = await fetch(getMealPlanFavoriteUrl(mealPlanId), {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("즐겨찾기 삭제에 실패했습니다. 잠시 후 다시 시도해주세요.");
  }
}
