// 사용자의 성별 값입니다.
// "|" 기호는 "male 또는 female 중 하나"라는 뜻입니다.
export type Gender = "male" | "female";

// 사용자가 선택할 수 있는 목표 타입입니다.
// 정해진 값만 허용하면 오타로 생기는 버그를 줄일 수 있습니다.
export type GoalType = "lose" | "maintain" | "gain";

// 기간별 식단에서 선택할 수 있는 일수입니다.
// 3, 7, 14 외의 숫자는 TypeScript가 막아줍니다.
export type PlanDuration = 3 | 7 | 14;

// 신체정보 입력 폼에서 관리할 사용자 프로필 타입입니다.
// bodyFatPercentage 뒤의 ?는 입력하지 않아도 되는 선택값이라는 뜻입니다.
export interface UserProfile {
  heightCm: number;
  weightKg: number;
  age: number;
  gender: Gender;
  bodyFatPercentage?: number;
}

// 결과 화면에 보여줄 하루 영양 목표 타입입니다.
// bmr/tdee는 계산 과정을 사용자에게 설명하기 위해 함께 보관합니다.
export interface NutritionTarget {
  bmr: number;
  tdee: number;
  calories: number;
  proteinGram: number;
  carbsGram: number;
  fatGram: number;
}

// 구매 링크를 고를 때 사용할 음식 카테고리 타입입니다.
// 음식마다 category를 붙여두면 같은 카테고리 링크를 재사용할 수 있습니다.
export type ShoppingCategory =
  | "chicken"
  | "rice"
  | "vegetable"
  | "yogurt"
  | "oat"
  | "fruit"
  | "egg"
  | "fish"
  | "sweetPotato"
  | "nuts";

// 식단 안의 음식 한 개를 표현하는 타입입니다.
// amount는 "150g", "1개"처럼 사용자에게 보여줄 섭취량 문구입니다.
export interface MealFood {
  id: string;
  name: string;
  amount: string;
  calories: number;
  shoppingCategory: ShoppingCategory;
}

// 즐겨찾기 음식 타입입니다.
// useCount는 자주 사용하는 음식을 위에 보여주기 위한 숫자입니다.
export interface FavoriteFood {
  id: string;
  name: string;
  shoppingCategory: ShoppingCategory;
  useCount: number;
  createdAt: string;
  updatedAt: string;
}

// 아침/점심/저녁 한 끼를 표현하는 타입입니다.
export interface Meal {
  id: string;
  mealType: "breakfast" | "lunch" | "dinner";
  title: string;
  calories: number;
  foods: MealFood[];
}

// 기간 식단 안의 하루 식단을 표현하는 타입입니다.
// 날짜별 식단을 보여주기 위해 day와 meals를 함께 보관합니다.
export interface DayMeal {
  id: string;
  day: number;
  title: string;
  totalCalories: number;
  meals: Meal[];
}

// 기간별 식단 전체를 표현하는 타입입니다.
// durationDays는 3일/7일/14일 중 현재 식단의 기간입니다.
export interface MealPlan {
  id: string;
  targetCalories: number;
  durationDays: PlanDuration;
  averageCalories: number;
  days: DayMeal[];
}

// 장보기 리스트에서 중복 재료를 합친 뒤 보여줄 항목 타입입니다.
export interface ShoppingListItem {
  id: string;
  name: string;
  amountText: string;
  totalCalories: number;
  servingCount: number;
  shoppingCategory: ShoppingCategory;
}

// AI 응답 안의 음식 항목 타입입니다.
// 실제 API를 붙일 때도 이 구조를 지키면 화면 코드를 크게 바꾸지 않아도 됩니다.
export interface AIMealFood {
  name: string;
  amount: string;
  calories: number;
  reason: string;
  shoppingCategory: ShoppingCategory;
}

// AI 응답 안의 한 끼 식사 타입입니다.
export interface AIMeal {
  mealType: "breakfast" | "lunch" | "dinner";
  title: string;
  calories: number;
  foods: AIMealFood[];
}

// AI 응답 안의 하루 식단 타입입니다.
export interface AIDayMealPlan {
  day: number;
  title: string;
  totalCalories: number;
  meals: AIMeal[];
}

// mock AI 식단 응답 전체 타입입니다.
// schemaVersion은 나중에 JSON 구조를 바꿀 때 버전을 구분하기 위해 둡니다.
export interface AIMealPlanResponse {
  schemaVersion: "fitplate.aiMealPlan.v1";
  source: "mock";
  generatedAt: string;
  targetCalories: number;
  durationDays: PlanDuration;
  summary: string;
  cautions: string[];
  days: AIDayMealPlan[];
}

// 다시 보기 화면에 필요한 저장 식단 타입입니다.
export interface SavedMealPlan {
  id: string;
  savedAt: string;
  profile: UserProfile;
  goal: GoalType;
  target: NutritionTarget;
  planDuration: PlanDuration;
  mealPlan: MealPlan;
  aiMealPlanResponse?: AIMealPlanResponse;
}
