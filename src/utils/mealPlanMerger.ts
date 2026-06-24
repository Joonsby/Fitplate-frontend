// AI 응답을 프론트엔드 MealPlan으로 변환하고 역추출하는 유틸입니다.
import type { AIFood, AIMealPlanResponse, DayMeal, Meal, MealFood, MealPlan } from "../types/fitplate";

function aifoodToMealFood(food: AIFood, mealId: string, index: number): MealFood {
  return {
    id: `${mealId}-food${index}`,
    name: food.name,
    amount: food.amount,
    calories: food.calories,
    shoppingCategory: "vegetable",
    shoppingKeyword: food.shoppingKeyword,
    protein: food.protein,
    carbohydrate: food.carbohydrate,
    fat: food.fat,
  };
}

// 백엔드 단일 일자 AI 응답을 1일차 MealPlan으로 변환합니다.
export function buildMealPlanFromAiResponse(
  aiResponse: AIMealPlanResponse,
  targetCalories: number,
): MealPlan {
  const planId = `ai-${Date.now()}`;

  const meals: Meal[] = (aiResponse.meals ?? []).map((aiMeal) => {
    const mealId = `${planId}-${aiMeal.mealType}`;
    const foods = aiMeal.foods.map((f, i) => aifoodToMealFood(f, mealId, i));
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

// 백엔드 저장 시 필요한 aiMealPlanResponse 형식으로 역추출합니다. 1일차 meals만 사용합니다.
export function extractAiResponseFromMealPlan(mealPlan: MealPlan): AIMealPlanResponse {
  const firstDay = mealPlan.days[0];
  const meals = firstDay != null
    ? firstDay.meals.map((meal) => ({
        mealType: meal.mealType,
        title: meal.title,
        foods: meal.foods.map((food) => ({
          name: food.name,
          amount: food.amount,
          calories: food.calories,
          protein: food.protein ?? 0,
          carbohydrate: food.carbohydrate ?? 0,
          fat: food.fat ?? 0,
          shoppingKeyword: food.shoppingKeyword ?? food.name,
        })),
      }))
    : [];
  return { meals };
}
