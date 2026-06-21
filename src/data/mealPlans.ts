import type { DayMeal, Meal, MealPlan, PlanDuration } from "../types/fitplate";

// AI API 없이 사용하는 고정 더미 식단 데이터입니다.
// 먼저 칼로리 기준별 하루 식단 템플릿을 만들고, 아래에서 3일/5일/7일 식단으로 확장합니다.
const DAILY_MEAL_TEMPLATES: Record<number, Meal[]> = {
  1600: [
    {
      id: "1600-breakfast",
      mealType: "breakfast",
      title: "아침",
      calories: 410,
      foods: [
        { id: "1600-b-yogurt", name: "그릭요거트", amount: "150g", calories: 140, shoppingCategory: "yogurt" },
        { id: "1600-b-oat", name: "오트밀", amount: "35g", calories: 135, shoppingCategory: "oat" },
        { id: "1600-b-fruit", name: "바나나", amount: "1개", calories: 95, shoppingCategory: "fruit" },
        { id: "1600-b-nuts", name: "견과류", amount: "10g", calories: 40, shoppingCategory: "nuts" },
      ],
    },
    {
      id: "1600-lunch",
      mealType: "lunch",
      title: "점심",
      calories: 620,
      foods: [
        { id: "1600-l-chicken", name: "닭가슴살", amount: "130g", calories: 215, shoppingCategory: "chicken" },
        { id: "1600-l-rice", name: "현미밥", amount: "150g", calories: 250, shoppingCategory: "rice" },
        { id: "1600-l-veg", name: "샐러드 채소", amount: "한 줌", calories: 45, shoppingCategory: "vegetable" },
        { id: "1600-l-egg", name: "삶은 계란", amount: "1개", calories: 110, shoppingCategory: "egg" },
      ],
    },
    {
      id: "1600-dinner",
      mealType: "dinner",
      title: "저녁",
      calories: 555,
      foods: [
        { id: "1600-d-fish", name: "연어", amount: "110g", calories: 230, shoppingCategory: "fish" },
        { id: "1600-d-sweet", name: "고구마", amount: "150g", calories: 190, shoppingCategory: "sweetPotato" },
        { id: "1600-d-veg", name: "구운 채소", amount: "150g", calories: 85, shoppingCategory: "vegetable" },
        { id: "1600-d-nuts", name: "견과류", amount: "10g", calories: 50, shoppingCategory: "nuts" },
      ],
    },
  ],
  1800: [
    {
      id: "1800-breakfast",
      mealType: "breakfast",
      title: "아침",
      calories: 460,
      foods: [
        { id: "1800-b-yogurt", name: "그릭요거트", amount: "170g", calories: 160, shoppingCategory: "yogurt" },
        { id: "1800-b-oat", name: "오트밀", amount: "45g", calories: 170, shoppingCategory: "oat" },
        { id: "1800-b-fruit", name: "바나나", amount: "1개", calories: 95, shoppingCategory: "fruit" },
        { id: "1800-b-nuts", name: "견과류", amount: "8g", calories: 35, shoppingCategory: "nuts" },
      ],
    },
    {
      id: "1800-lunch",
      mealType: "lunch",
      title: "점심",
      calories: 705,
      foods: [
        { id: "1800-l-chicken", name: "닭가슴살", amount: "150g", calories: 250, shoppingCategory: "chicken" },
        { id: "1800-l-rice", name: "현미밥", amount: "180g", calories: 300, shoppingCategory: "rice" },
        { id: "1800-l-veg", name: "샐러드 채소", amount: "한 줌", calories: 45, shoppingCategory: "vegetable" },
        { id: "1800-l-egg", name: "삶은 계란", amount: "1개", calories: 110, shoppingCategory: "egg" },
      ],
    },
    {
      id: "1800-dinner",
      mealType: "dinner",
      title: "저녁",
      calories: 645,
      foods: [
        { id: "1800-d-fish", name: "연어", amount: "130g", calories: 270, shoppingCategory: "fish" },
        { id: "1800-d-sweet", name: "고구마", amount: "180g", calories: 230, shoppingCategory: "sweetPotato" },
        { id: "1800-d-veg", name: "구운 채소", amount: "170g", calories: 95, shoppingCategory: "vegetable" },
        { id: "1800-d-nuts", name: "견과류", amount: "10g", calories: 50, shoppingCategory: "nuts" },
      ],
    },
  ],
  2000: [
    {
      id: "2000-breakfast",
      mealType: "breakfast",
      title: "아침",
      calories: 520,
      foods: [
        { id: "2000-b-yogurt", name: "그릭요거트", amount: "200g", calories: 190, shoppingCategory: "yogurt" },
        { id: "2000-b-oat", name: "오트밀", amount: "50g", calories: 190, shoppingCategory: "oat" },
        { id: "2000-b-fruit", name: "바나나", amount: "1개", calories: 95, shoppingCategory: "fruit" },
        { id: "2000-b-nuts", name: "견과류", amount: "10g", calories: 45, shoppingCategory: "nuts" },
      ],
    },
    {
      id: "2000-lunch",
      mealType: "lunch",
      title: "점심",
      calories: 780,
      foods: [
        { id: "2000-l-chicken", name: "닭가슴살", amount: "170g", calories: 285, shoppingCategory: "chicken" },
        { id: "2000-l-rice", name: "현미밥", amount: "200g", calories: 335, shoppingCategory: "rice" },
        { id: "2000-l-veg", name: "샐러드 채소", amount: "한 줌", calories: 50, shoppingCategory: "vegetable" },
        { id: "2000-l-egg", name: "삶은 계란", amount: "1개", calories: 110, shoppingCategory: "egg" },
      ],
    },
    {
      id: "2000-dinner",
      mealType: "dinner",
      title: "저녁",
      calories: 695,
      foods: [
        { id: "2000-d-fish", name: "연어", amount: "150g", calories: 310, shoppingCategory: "fish" },
        { id: "2000-d-sweet", name: "고구마", amount: "200g", calories: 255, shoppingCategory: "sweetPotato" },
        { id: "2000-d-veg", name: "구운 채소", amount: "160g", calories: 90, shoppingCategory: "vegetable" },
        { id: "2000-d-nuts", name: "견과류", amount: "8g", calories: 40, shoppingCategory: "nuts" },
      ],
    },
  ],
  2200: [
    {
      id: "2200-breakfast",
      mealType: "breakfast",
      title: "아침",
      calories: 575,
      foods: [
        { id: "2200-b-yogurt", name: "그릭요거트", amount: "220g", calories: 210, shoppingCategory: "yogurt" },
        { id: "2200-b-oat", name: "오트밀", amount: "60g", calories: 225, shoppingCategory: "oat" },
        { id: "2200-b-fruit", name: "바나나", amount: "1개", calories: 95, shoppingCategory: "fruit" },
        { id: "2200-b-nuts", name: "견과류", amount: "10g", calories: 45, shoppingCategory: "nuts" },
      ],
    },
    {
      id: "2200-lunch",
      mealType: "lunch",
      title: "점심",
      calories: 860,
      foods: [
        { id: "2200-l-chicken", name: "닭가슴살", amount: "190g", calories: 315, shoppingCategory: "chicken" },
        { id: "2200-l-rice", name: "현미밥", amount: "230g", calories: 385, shoppingCategory: "rice" },
        { id: "2200-l-veg", name: "샐러드 채소", amount: "두 줌", calories: 50, shoppingCategory: "vegetable" },
        { id: "2200-l-egg", name: "삶은 계란", amount: "1개", calories: 110, shoppingCategory: "egg" },
      ],
    },
    {
      id: "2200-dinner",
      mealType: "dinner",
      title: "저녁",
      calories: 760,
      foods: [
        { id: "2200-d-fish", name: "연어", amount: "170g", calories: 350, shoppingCategory: "fish" },
        { id: "2200-d-sweet", name: "고구마", amount: "240g", calories: 305, shoppingCategory: "sweetPotato" },
        { id: "2200-d-veg", name: "구운 채소", amount: "190g", calories: 105, shoppingCategory: "vegetable" },
      ],
    },
  ],
  2500: [
    {
      id: "2500-breakfast",
      mealType: "breakfast",
      title: "아침",
      calories: 670,
      foods: [
        { id: "2500-b-yogurt", name: "그릭요거트", amount: "250g", calories: 240, shoppingCategory: "yogurt" },
        { id: "2500-b-oat", name: "오트밀", amount: "70g", calories: 265, shoppingCategory: "oat" },
        { id: "2500-b-fruit", name: "바나나", amount: "1개", calories: 95, shoppingCategory: "fruit" },
        { id: "2500-b-nuts", name: "견과류", amount: "15g", calories: 70, shoppingCategory: "nuts" },
      ],
    },
    {
      id: "2500-lunch",
      mealType: "lunch",
      title: "점심",
      calories: 980,
      foods: [
        { id: "2500-l-chicken", name: "닭가슴살", amount: "220g", calories: 365, shoppingCategory: "chicken" },
        { id: "2500-l-rice", name: "현미밥", amount: "280g", calories: 470, shoppingCategory: "rice" },
        { id: "2500-l-veg", name: "샐러드 채소", amount: "두 줌", calories: 55, shoppingCategory: "vegetable" },
        { id: "2500-l-egg", name: "삶은 계란", amount: "1개", calories: 90, shoppingCategory: "egg" },
      ],
    },
    {
      id: "2500-dinner",
      mealType: "dinner",
      title: "저녁",
      calories: 845,
      foods: [
        { id: "2500-d-fish", name: "연어", amount: "190g", calories: 390, shoppingCategory: "fish" },
        { id: "2500-d-sweet", name: "고구마", amount: "280g", calories: 355, shoppingCategory: "sweetPotato" },
        { id: "2500-d-veg", name: "구운 채소", amount: "180g", calories: 100, shoppingCategory: "vegetable" },
      ],
    },
  ],
};

const PLAN_DURATIONS: PlanDuration[] = [3, 5, 7];

// 하루 식단 템플릿을 복사해서 N일치 DayMeal 배열로 만듭니다.
// 실제 서비스에서는 날짜별 메뉴가 달라지겠지만, MVP에서는 더미 템플릿을 반복합니다.
function buildDays(targetCalories: number, durationDays: PlanDuration): DayMeal[] {
  const template = DAILY_MEAL_TEMPLATES[targetCalories];

  return Array.from({ length: durationDays }, (_, index) => {
    const day = index + 1;
    const meals = template.map((meal) => ({
      ...meal,
      id: `${targetCalories}-day-${day}-${meal.mealType}`,
      foods: meal.foods.map((food) => ({
        ...food,
        id: `${food.id}-day-${day}`,
      })),
    }));

    return {
      id: `${targetCalories}-day-${day}`,
      day,
      title: `${day}일차`,
      totalCalories: meals.reduce((sum, meal) => sum + meal.calories, 0),
      meals,
    };
  });
}

// 화면에서 선택할 수 있는 모든 기간 식단입니다.
export const MEAL_PLANS: MealPlan[] = Object.keys(DAILY_MEAL_TEMPLATES).flatMap(
  (calorieText) => {
    const targetCalories = Number(calorieText);

    return PLAN_DURATIONS.map((durationDays) => {
      const days = buildDays(targetCalories, durationDays);
      const totalCalories = days.reduce((sum, day) => sum + day.totalCalories, 0);

      return {
        id: `plan-${targetCalories}-${durationDays}days`,
        targetCalories,
        durationDays,
        averageCalories: Math.round(totalCalories / durationDays),
        days,
      };
    });
  },
);
