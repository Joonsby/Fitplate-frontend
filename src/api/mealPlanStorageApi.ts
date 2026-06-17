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
import { getAccessToken } from "./authToken";
import { selectClosestMealPlan } from "../utils/mealPlanSelector";
import { mergeMealPlanWithAi, extractAiResponseFromMealPlan } from "../utils/mealPlanMerger";

export interface CreateSavedMealPlanInput {
  profile: UserProfile;
  goal: GoalType;
  target: NutritionTarget;
  planDuration: PlanDuration;
  mealPlan: MealPlan;
}

export interface SaveMealPlanRequest {
  goal: GoalType;
  durationDays: number;
  aiMealPlanResponse: AIMealPlanResponse;
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
  const accessToken = getAccessToken();
  const requestBody = {
    goal: input.goal,
    durationDays: input.planDuration,
    aiMealPlanResponse: extractAiResponseFromMealPlan(input.mealPlan),
  };
  console.log("[식단 저장] request body:", JSON.stringify(requestBody, null, 2));
  const response = await fetch(getApiUrl(API_ENDPOINTS.MEAL_PLAN_SAVE), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${accessToken}`,
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorBody = await readOptionalJson(response);

    const message =
      errorBody != null &&
      typeof errorBody === "object" &&
      "message" in errorBody &&
      typeof errorBody.message === "string"
        ? errorBody.message
        : "식단 저장에 실패했습니다. 잠시 후 다시 시도해주세요.";

    throw new Error(message);
  }

  const responseBody = await readOptionalJson(response);

  return toSavedMealPlan(input, responseBody);
}

// GET /api/meal-plan 응답 항목의 형태입니다. SavedMealPlan과 키 구조가 달라 별도로 변환합니다.
interface ApiSavedMealPlan {
  id: number;
  goal: GoalType;
  durationDays: PlanDuration;
  height: number;
  weight: number;
  age: number;
  gender: "MALE" | "FEMALE";
  targetCalories: number;
  bmr: number;
  tdee: number;
  proteinGram: number;
  carbsGram: number;
  fatGram: number;
  aiMealPlanResponse: AIMealPlanResponse;
  createdAt: string;
}


function toSavedMealPlanFromApi(item: ApiSavedMealPlan): SavedMealPlan {
  const baseMealPlan = selectClosestMealPlan(item.targetCalories, item.durationDays);
  const mealPlan = mergeMealPlanWithAi(baseMealPlan, item.aiMealPlanResponse);

  return {
    id: String(item.id),
    savedAt: item.createdAt,
    profile: {
      height: item.height,
      weight: item.weight,
      age: item.age,
      gender: item.gender === "FEMALE" ? "female" : "male",
    },
    goal: item.goal,
    target: {
      bmr: item.bmr,
      tdee: item.tdee,
      calories: item.targetCalories,
      proteinGram: item.proteinGram,
      carbsGram: item.carbsGram,
      fatGram: item.fatGram,
    },
    planDuration: item.durationDays,
    mealPlan,
  };
}

export async function getSavedMealPlans(): Promise<SavedMealPlan[]> {
  const accessToken = getAccessToken();
  const response = await fetch(getApiUrl(API_ENDPOINTS.MEAL_PLAN), {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("저장된 식단 목록을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.");
  }

  const responseBody = await readOptionalJson(response);
  console.log(JSON.stringify(responseBody,null,2))
  return Array.isArray(responseBody)
    ? (responseBody as ApiSavedMealPlan[]).map(toSavedMealPlanFromApi)
    : [];
}

export async function deleteSavedMealPlanById(
  mealPlanId: string,
): Promise<void> {
  let response : Response;

  try{
  const accessToken = getAccessToken();  
  response = await fetch(getApiUrl(`${API_ENDPOINTS.MEAL_PLAN}/${mealPlanId}`), {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
      },
    },
  );  
  } catch(error){
    console.log("식단 삭제 API 네트워크 오류:", error);
    throw new Error("식단 삭제에 실패했습니다. 잠시 후 다시 시도해주세요.");
  } 

  if (!response.ok) {
    const errorText = await response.text();

    console.error("식단 삭제 API 호출 실패:", {
      status: response.status,
      statusText: response.statusText,
      body: errorText,
    });

    throw new Error(
      "AI 식단 삭제에 실패했습니다. 잠시 후 다시 시도해주세요.",
    );
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
