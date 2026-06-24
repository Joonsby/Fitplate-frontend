import type {
  AIMealPlanResponse,
  DayMeal,
  FavoriteFood,
  GoalType,
  Meal,
  MealFood,
  MealPlan,
  NutritionTarget,
  SavedMealPlan,
  UserProfile,
} from "../types/fitplate";
import { API_ENDPOINTS, getApiUrl, getMealPlanFavoriteUrl } from "./apiConfig";
import { apiFetch, apiFetchRaw, apiFetchVoid, HttpError } from "./httpClient";

async function readOptionalJson(response: Response): Promise<unknown> {
  const text = await response.text();

  if (text.length === 0) {
    return null;
  }

  return JSON.parse(text);
}

// GET /api/meal-plans 및 GET /api/meal-plans/{id} 응답 타입입니다.
interface ApiSavedMealPlan {
  id: number;
  goal: "MAINTAIN" | "WEIGHT_LOSS" | "WEIGHT_GAIN";
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
  updatedAt: string;
}

function mapGoalFromBackend(goal: string): GoalType {
  if (goal === "WEIGHT_LOSS") return "lose";
  if (goal === "WEIGHT_GAIN") return "gain";
  return "maintain";
}

// 백엔드 단일 일자 AI 응답을 프론트엔드 MealPlan(1일차)으로 변환합니다.
function aiResponseToMealPlan(
  planId: string,
  aiResponse: AIMealPlanResponse,
  targetCalories: number,
): MealPlan {
  const meals: Meal[] = (aiResponse.meals ?? []).map((aiMeal) => {
    const mealId = `${planId}-day1-${aiMeal.mealType}`;
    const foods: MealFood[] = aiMeal.foods.map((food, i) => ({
      id: `${mealId}-food${i}`,
      name: food.name,
      amount: food.amount,
      calories: food.calories,
      shoppingCategory: "vegetable",
      shoppingKeyword: food.shoppingKeyword,
      protein: food.protein,
      carbohydrate: food.carbohydrate,
      fat: food.fat,
    }));

    const totalCalories = foods.reduce((sum, f) => sum + f.calories, 0);
    const totalProtein = aiMeal.foods.reduce((sum, f) => sum + f.protein, 0);
    const totalCarbs = aiMeal.foods.reduce((sum, f) => sum + f.carbohydrate, 0);
    const totalFat = aiMeal.foods.reduce((sum, f) => sum + f.fat, 0);

    return {
      id: mealId,
      mealType: aiMeal.mealType,
      title: aiMeal.title,
      name: aiMeal.foods.map((f) => f.name).join(", "),
      calories: totalCalories,
      protein: totalProtein,
      carbs: totalCarbs,
      fat: totalFat,
      foods,
    };
  });

  const totalCalories = meals.reduce((sum, m) => sum + m.calories, 0);
  const day: DayMeal = {
    id: `${planId}-day1`,
    day: 1,
    title: "1일차",
    totalCalories,
    meals,
  };

  return {
    id: planId,
    targetCalories,
    durationDays: 1,
    averageCalories: totalCalories,
    days: [day],
  };
}

function toSavedMealPlanFromApi(item: ApiSavedMealPlan): SavedMealPlan {
  const planId = String(item.id);
  const mealPlan = aiResponseToMealPlan(planId, item.aiMealPlanResponse, item.targetCalories);

  return {
    id: planId,
    savedAt: item.createdAt,
    profile: {
      height: item.height,
      weight: item.weight,
      age: item.age,
      gender: item.gender === "FEMALE" ? "female" : "male",
    },
    goal: mapGoalFromBackend(item.goal),
    target: {
      bmr: item.bmr,
      tdee: item.tdee,
      calories: item.targetCalories,
      proteinGram: item.proteinGram,
      carbsGram: item.carbsGram,
      fatGram: item.fatGram,
    },    
    mealPlan,
  };
}

export async function getSavedMealPlans(): Promise<SavedMealPlan[]> {
  const items = await apiFetch<ApiSavedMealPlan[]>(getApiUrl(API_ENDPOINTS.MEAL_PLAN), {
    httpErrorMessage: "저장된 식단 목록을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.",
    networkErrorMessage: "저장된 식단 목록을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.",
  });  
  return Array.isArray(items) ? items.map(toSavedMealPlanFromApi) : [];
}

export async function deleteSavedMealPlanById(mealPlanId: string): Promise<void> {
  return apiFetchVoid(getApiUrl(`${API_ENDPOINTS.MEAL_PLAN}/${mealPlanId}`), {
    method: "DELETE",
    networkErrorMessage: "식단 삭제에 실패했습니다. 잠시 후 다시 시도해주세요.",
    httpErrorMessage: "AI 식단 삭제에 실패했습니다. 잠시 후 다시 시도해주세요.",
  });
}

export async function addMealPlanFavorite({
  mealPlanId,
  food,
}: {
  mealPlanId: string;
  food: MealFood;
}): Promise<FavoriteFood> {
  const response = await apiFetchRaw(getMealPlanFavoriteUrl(mealPlanId), {
    method: "POST",
    body: { food },
    networkErrorMessage: "즐겨찾기 추가에 실패했습니다. 잠시 후 다시 시도해주세요.",
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
    favoriteFoodId:
      typeof responseRecord.favoriteFoodId === "number"
        ? responseRecord.favoriteFoodId
        : 0,
    name: responseRecord.name ?? food.name,
    amount: responseRecord.amount ?? food.amount,
    calories: responseRecord.calories ?? food.calories,
    carbohydrate: responseRecord.carbohydrate ?? food.carbohydrate ?? 0,
    protein: responseRecord.protein ?? food.protein ?? 0,
    fat: responseRecord.fat ?? food.fat ?? 0,
    shoppingCategory: responseRecord.shoppingCategory ?? food.shoppingCategory,
    shoppingKeyword: responseRecord.shoppingKeyword ?? food.shoppingKeyword ?? "",
    sourceFoodId: responseRecord.sourceFoodId ?? food.id,
    createdAt: responseRecord.createdAt ?? now,
  };
}

export async function deleteMealPlanFavorite(mealPlanId: string): Promise<void> {
  return apiFetchVoid(getMealPlanFavoriteUrl(mealPlanId), {
    method: "DELETE",
    networkErrorMessage: "즐겨찾기 삭제에 실패했습니다. 잠시 후 다시 시도해주세요.",
    httpErrorMessage: "즐겨찾기 삭제에 실패했습니다. 잠시 후 다시 시도해주세요.",
  });
}

export async function saveMealPlan({
  profile,
  goal,
  target,
  aiMealPlanResponse,
}: {
  profile: UserProfile;
  goal: GoalType;
  target: NutritionTarget;
  aiMealPlanResponse: AIMealPlanResponse;
}): Promise<void> {
  const body = {
    height: profile.height,
    weight: profile.weight,
    age: profile.age,
    gender: profile.gender === "male" ? "MALE" : "FEMALE",
    goal: goal === "lose" ? "WEIGHT_LOSS" : goal === "gain" ? "WEIGHT_GAIN" : "MAINTAIN",
    targetCalories: target.calories,
    bmr: target.bmr,
    tdee: target.tdee,
    proteinGram: target.proteinGram,
    carbsGram: target.carbsGram,
    fatGram: target.fatGram,
    aiMealPlanResponse,
  };
}
