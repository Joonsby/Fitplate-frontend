import { API_BASE_URL, API_ENDPOINTS } from './apiConfig';
import type { MealPlanRequest, MealPlanResponse, ErrorResponse } from './types';
export interface ApiResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}
export async function generateMealPlan(
  request: MealPlanRequest
): Promise<ApiResult<MealPlanResponse>> {
  try {
    const url = `${API_BASE_URL}${API_ENDPOINTS.MEAL_PLAN}`;
    console.log('식단 API 호출 시작:', url);
    console.log('요청 데이터:', request);
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    console.log('응답 상태:', response.status);
    if (!response.ok) {
      const errorData: ErrorResponse = await response.json();
      console.error('API 에러:', errorData);
      return {
        success: false,
        error: errorData.message || '식단 생성에 실패했습니다',
      };
    }
    const data: MealPlanResponse = await response.json();
    console.log('API 응답 성공:', data);
    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('API 호출 중 에러 발생:', error);
    console.log('Fallback 더미 데이터 사용');
    return {
      success: true,
      data: createFallbackMealPlan(request.periodDays),
    };
  }
}
function createFallbackMealPlan(periodDays: number): MealPlanResponse {
  const days = [];
  for (let i = 1; i <= periodDays; i++) {
    days.push({
      dayNumber: i,
      breakfast: {
        name: '[Fallback] 계란말이, 흰쌀밥, 미역국',
        calories: 650,
        protein: 28.5,
        carbohydrate: 72.0,
        fat: 18.2,
      },
      lunch: {
        name: '[Fallback] 불고기덮밥, 계란찜, 깍두기',
        calories: 750,
        protein: 35.2,
        carbohydrate: 85.0,
        fat: 20.5,
      },
      dinner: {
        name: '[Fallback] 연어구이, 현미밥, 시금치나물',
        calories: 680,
        protein: 42.0,
        carbohydrate: 68.0,
        fat: 16.8,
      },
    });
  }
  return { days };
}