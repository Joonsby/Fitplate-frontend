export interface MealResponse {
  name: string;
  calories: number;
  protein: number;
  carbohydrate: number;
  fat: number;
}
export interface MealDayResponse {
  dayNumber: number;
  breakfast: MealResponse;
  lunch: MealResponse;
  dinner: MealResponse;
}
export interface MealPlanResponse {
  days: MealDayResponse[];
}
export interface MealPlanRequest {
  height: number;
  weight: number;
  age: number;
  gender: string;
  bodyFatRate?: number;
  goal: string;
  periodDays: number;
}
export interface ErrorResponse {
  status: number;
  message: string;
  timestamp: string;
  path: string;
}