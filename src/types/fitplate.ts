// 사용자의 성별 값입니다.
// "|" 기호는 "male 또는 female 중 하나"라는 뜻입니다.
export type Gender = "male" | "female";

// 사용자가 선택할 수 있는 목표 타입입니다.
// 정해진 값만 허용하면 오타로 생기는 버그를 줄일 수 있습니다.
export type GoalType = "lose" | "maintain" | "gain";

// 식단 생성 진행 상태입니다. sessionStorage에 지속되어 페이지 이동 후에도 유지됩니다.
export type GenerationStatus = "idle" | "generating" | "failed";


// 신체정보 입력 폼에서 관리할 사용자 프로필 타입입니다.
// bodyFatPercentage 뒤의 ?는 입력하지 않아도 되는 선택값이라는 뜻입니다.
export interface UserProfile {
  height: number;
  weight: number;
  age: number;
  gender: Gender;
  bmi?: number;
  bodyFatRate?: number;
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
  shoppingKeyword?: string;
  protein?: number;
  carbohydrate?: number;
  fat?: number;
}

// 즐겨찾기 음식 타입입니다. 백엔드 /api/favorite-foods 응답 구조와 일치합니다.
export interface FavoriteFood {
  favoriteFoodId: number;
  name: string;
  amount: string;
  calories: number;
  carbohydrate: number;
  protein: number;
  fat: number;
  shoppingCategory: ShoppingCategory;
  shoppingKeyword: string;
  sourceFoodId: string;
  createdAt: string;
}

// 아침/점심/저녁 한 끼를 표현하는 타입입니다.
// name, protein, carbs, fat은 AI 병합 후 채워집니다.
export interface Meal {
  id: string;
  mealType: "breakfast" | "lunch" | "dinner";
  title: string;
  name?: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
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
export interface MealPlan {
  id: string;
  targetCalories: number;
  durationDays: number;
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
  shoppingKeyword?: string;
}

// AI 응답 안의 음식 한 개 타입입니다.
export interface AIFood {
  name: string;
  amount: string;
  calories: number;
  protein: number;
  carbohydrate: number;
  fat: number;
  shoppingKeyword: string;
}

// AI 응답 안의 한 끼 식사 타입입니다.
export interface AIMeal {
  mealType: "breakfast" | "lunch" | "dinner";
  title: string;
  foods: AIFood[];
}

// AI 식단 응답 전체 타입입니다. 백엔드는 하루치 meals 배열만 반환합니다.
export interface AIMealPlanResponse {
  meals: AIMeal[];
}

// 다시 보기 화면에 필요한 저장 식단 타입입니다.
export interface SavedMealPlan {
  id: string;
  savedAt: string;
  profile: UserProfile;
  goal: GoalType;
  target: NutritionTarget;  
  mealPlan: MealPlan;
}

// ResultPage 복원에 필요한 전체 데이터를 메모리에 보관하는 스냅샷 타입입니다.
// aiError가 있으면 생성 실패 상태로 복원됩니다.
export interface ResultSnapshot {
  profile: UserProfile;
  goal: GoalType;
  nutritionTarget: NutritionTarget;
  mealPlan: MealPlan;
  aiError?: string;
}

export const GOAL_LABELS: Record<GoalType, string> = {
  lose: "감량",
  maintain: "유지",
  gain: "증량",
};

export const GOAL_DESCRIPTIONS: Record<GoalType, string> = {
  lose: "TDEE에서 400kcal를 줄여 체중 감량을 돕는 목표",
  maintain: "TDEE를 그대로 사용해 현재 체중을 유지하는 목표",
  gain: "TDEE에 300kcal를 더해 체중 증가를 돕는 목표",
};