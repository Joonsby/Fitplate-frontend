// AI 응답과 규칙 기반 식단을 통합 구조로 병합하고 역추출하는 유틸입니다.
import type { AIFood, AIMealPlanResponse, MealFood, MealPlan } from "../types/fitplate";

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

export function mergeMealPlanWithAi(mealPlan: MealPlan, aiResponse: AIMealPlanResponse): MealPlan {
  const mergedDays = mealPlan.days.map((day, index) => {
    const aiDay = aiResponse.days[index];
    if (aiDay == null) return day;

    const mergedMeals = day.meals.map((meal) => {
      const aiMeal = aiDay.meals.find((m) => m.mealType === meal.mealType);
      if (aiMeal == null) return meal;

      const foods = aiMeal.foods.map((f, i) =>
        aifoodToMealFood(f, `day${aiDay.dayNumber}-${aiMeal.mealType}`, i),
      );
      const totalCalories = foods.reduce((sum, f) => sum + f.calories, 0);
      const totalProtein = aiMeal.foods.reduce((sum, f) => sum + f.protein, 0);
      const totalCarbs = aiMeal.foods.reduce((sum, f) => sum + f.carbohydrate, 0);
      const totalFat = aiMeal.foods.reduce((sum, f) => sum + f.fat, 0);

      return {
        ...meal,
        name: aiMeal.foods.map((f) => f.name).join(", "),
        calories: totalCalories,
        protein: totalProtein,
        carbs: totalCarbs,
        fat: totalFat,
        foods,
      };
    });

    const totalCalories = mergedMeals.reduce((sum, m) => sum + m.calories, 0);
    return { ...day, totalCalories, meals: mergedMeals };
  });

  const totalCalories = mergedDays.reduce((sum, d) => sum + d.totalCalories, 0);
  const averageCalories = Math.round(totalCalories / (mergedDays.length || 1));

  return { ...mealPlan, days: mergedDays, averageCalories };
}

// 백엔드 저장 시 aiMealPlanResponse 형식이 필요한 경우 역추출합니다.
export function extractAiResponseFromMealPlan(mealPlan: MealPlan): AIMealPlanResponse {
  return {
    days: mealPlan.days.map((day, index) => ({
      dayNumber: index + 1,
      meals: day.meals.map((meal) => ({
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
      })),
    })),
  };
}
