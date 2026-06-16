// AI 응답과 규칙 기반 식단을 통합 구조로 병합하고 역추출하는 유틸입니다.
import type { AIMeal, AIMealPlanResponse, Meal, MealPlan } from "../types/fitplate";

export function mergeMealPlanWithAi(mealPlan: MealPlan, aiResponse: AIMealPlanResponse): MealPlan {
  const mergedDays = mealPlan.days.map((day, index) => {
    const aiDay = aiResponse.days[index];
    if (aiDay == null) return day;

    const mergedMeals = day.meals.map((meal) => {
      const aiMeal: AIMeal =
        meal.mealType === "breakfast" ? aiDay.breakfast :
        meal.mealType === "lunch" ? aiDay.lunch :
        aiDay.dinner;

      return {
        ...meal,
        name: aiMeal.name,
        calories: aiMeal.calories,
        protein: aiMeal.protein,
        carbs: aiMeal.carbohydrate,
        fat: aiMeal.fat,
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
  const toAiMeal = (meal: Meal): AIMeal => ({
    name: meal.name ?? "",
    calories: meal.calories,
    protein: meal.protein ?? 0,
    carbohydrate: meal.carbs ?? 0,
    fat: meal.fat ?? 0,
  });

  return {
    days: mealPlan.days.map((day, index) => {
      const breakfast = day.meals.find((m) => m.mealType === "breakfast")!;
      const lunch = day.meals.find((m) => m.mealType === "lunch")!;
      const dinner = day.meals.find((m) => m.mealType === "dinner")!;

      return {
        dayNumber: index + 1,
        breakfast: toAiMeal(breakfast),
        lunch: toAiMeal(lunch),
        dinner: toAiMeal(dinner),
      };
    }),
  };
}
