import type {
  AIDayMealPlan,
  AIMealPlanResponse,
  MealPlan,
  NutritionTarget,
} from "../types/fitplate";

interface MockGenerateMealPlanInput {
  mealPlan: MealPlan;
  target: NutritionTarget;
}

// 실제 API 호출처럼 보이도록 잠깐 기다리는 Promise helper입니다.
// fetch를 쓰지 않고 setTimeout만 사용합니다.
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

// 기존 더미 식단을 AI 응답 JSON의 days 구조로 변환합니다.
function mapMealPlanToAiDays(mealPlan: MealPlan): AIDayMealPlan[] {
  return mealPlan.days.map((day) => ({
    day: day.day,
    title: day.title,
    totalCalories: day.totalCalories,
    meals: day.meals.map((meal) => ({
      mealType: meal.mealType,
      title: meal.title,
      calories: meal.calories,
      foods: meal.foods.map((food) => ({
        name: food.name,
        amount: food.amount,
        calories: food.calories,
        shoppingCategory: food.shoppingCategory,
        reason: `${meal.title}에 어울리는 균형 잡힌 ${food.name} 구성입니다.`,
      })),
    })),
  }));
}

// 실제 OpenAI API를 붙이기 전까지 사용할 mock AI 식단 생성 함수입니다.
// Promise를 반환하므로 나중에 실제 API 함수로 바꿔도 loading/error 흐름을 그대로 재사용할 수 있습니다.
export async function mockGenerateMealPlan({
  mealPlan,
  target,
}: MockGenerateMealPlanInput): Promise<AIMealPlanResponse> {
  await delay(700);

  if (!Number.isFinite(target.calories) || target.calories <= 0) {
    throw new Error("목표 칼로리가 올바르지 않아 mock AI 식단을 만들 수 없습니다.");
  }

  return {
    schemaVersion: "fitplate.aiMealPlan.v1",
    source: "mock",
    generatedAt: new Date().toISOString(),
    targetCalories: target.calories,
    durationDays: mealPlan.durationDays,
    summary: `${target.calories.toLocaleString()}kcal 목표에 가까운 ${mealPlan.durationDays}일 mock AI 식단입니다.`,
    cautions: [
      "의학적 진단이나 치료 목적의 식단이 아닙니다.",
      "알레르기와 개인 질환이 있다면 전문가와 상담하세요.",
    ],
    days: mapMealPlanToAiDays(mealPlan),
  };
}
