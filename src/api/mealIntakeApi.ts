// 식단 날짜 지정, 끼니 섭취 기록, 날짜별 기록·통계 조회 API 함수 모음
import type { AIMeal, SavedMealPlan } from "../types/fitplate";
import { API_ENDPOINTS, getApiUrl } from "./apiConfig";
import { apiFetch } from "./httpClient";
import { toSavedMealPlanFromApi } from "./mealPlanStorageApi";
import type { ApiSavedMealPlan } from "./mealPlanStorageApi";

export type MealType = AIMeal["mealType"];

export interface NutritionTotals {
  calories: number;
  protein: number;
  carbohydrate: number;
  fat: number;
}

export type RecordStatus = "NO_PLAN" | "UPCOMING" | "NOT_RECORDED" | "PARTIAL" | "COMPLETE";

export interface DailyRecord {
  date: string;
  status: RecordStatus;
  mealPlanId: number | null;
  goal: string | null;
  plannedMeals: number;
  eatenMeals: number;
  completionRate: number | null;
  target: NutritionTotals | null;
  planned: NutritionTotals | null;
  // 체크한 끼니가 없으면 0 이 아니라 null (기록 없음)
  eaten: NutritionTotals | null;
  meals: { mealType: MealType; title: string; eaten: boolean; calories: number; foodNames: string[] }[];
}

export interface RecordsResponse {
  from: string;
  to: string;
  days: DailyRecord[];
  summary: {
    totalDays: number;
    plannedDays: number;
    recordedDays: number;
    averageCompletionRate: number | null;
    averageEaten: NutritionTotals | null;
    averagePlanned: NutritionTotals | null;
    averageTarget: NutritionTotals | null;
  };
}

// 같은 음식으로 새 식단을 만들어 planDate 에 넣는다. 그날 다른 식단이 있으면 HttpError(code=DATE_TAKEN)
export async function copyMealPlan(mealPlanId: string, planDate: string, replace = false): Promise<SavedMealPlan> {
  const data = await apiFetch<ApiSavedMealPlan>(getApiUrl(`${API_ENDPOINTS.MEAL_PLAN}/${mealPlanId}/copy`), {
    method: "POST",
    body: { planDate, replace },
    networkErrorMessage: "식단을 복사하지 못했어요. 잠시 후 다시 시도해 주세요.",
    httpErrorMessage: "식단을 복사하지 못했어요. 잠시 후 다시 시도해 주세요.",
  });
  return toSavedMealPlanFromApi(data);
}

export async function scheduleMealPlan(
  mealPlanId: string,
  planDate: string | null,
  replace = false,
): Promise<SavedMealPlan> {
  const data = await apiFetch<ApiSavedMealPlan>(
    getApiUrl(`${API_ENDPOINTS.MEAL_PLAN}/${mealPlanId}/schedule`),
    {
      method: "PUT",
      body: { planDate, replace },
      networkErrorMessage: "식단 날짜를 정하지 못했어요. 잠시 후 다시 시도해 주세요.",
      httpErrorMessage: "식단 날짜를 정하지 못했어요. 잠시 후 다시 시도해 주세요.",
    },
  );
  return toSavedMealPlanFromApi(data);
}

export async function setMealIntake(
  mealPlanId: string,
  mealType: MealType,
  eaten: boolean,
): Promise<SavedMealPlan> {
  const data = await apiFetch<ApiSavedMealPlan>(
    getApiUrl(`${API_ENDPOINTS.MEAL_PLAN}/${mealPlanId}/meals/${mealType}/intake`),
    {
      method: "PUT",
      body: { eaten },
      networkErrorMessage: "섭취 기록을 저장하지 못했어요. 잠시 후 다시 시도해 주세요.",
      httpErrorMessage: "섭취 기록을 저장하지 못했어요. 잠시 후 다시 시도해 주세요.",
    },
  );
  return toSavedMealPlanFromApi(data);
}

export async function getRecords(from: string, to: string): Promise<RecordsResponse> {
  return apiFetch<RecordsResponse>(getApiUrl(`/api/records?from=${from}&to=${to}`), {
    networkErrorMessage: "기록을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.",
    httpErrorMessage: "기록을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.",
  });
}
