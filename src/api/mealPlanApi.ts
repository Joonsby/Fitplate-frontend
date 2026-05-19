import type {
  AIMealPlanResponse,
  GoalType,
  PlanDuration,
  ShoppingCategory,
  UserProfile,
} from "../types/fitplate";

interface BackendMeal {
  name: string;
  calories: number;
  protein: number;
  carbohydrate: number;
  fat: number;
}

interface BackendDay {
  dayNumber: number;
  breakfast: BackendMeal;
  lunch: BackendMeal;
  dinner: BackendMeal;
}

interface BackendMealPlanResponse {
  days: BackendDay[];
}

function mapGoalToBackend(goal: GoalType): string {
  if (goal === "lose") return "WEIGHT_LOSS";
  if (goal === "gain") return "WEIGHT_GAIN";
  return "MAINTAIN";
}

function mapGenderToBackend(gender: UserProfile["gender"]): string {
  return gender === "male" ? "MALE" : "FEMALE";
}

function guessShoppingCategory(name: string): ShoppingCategory {
  if (name.includes("닭") || name.includes("불고기")) return "chicken";
  if (name.includes("밥") || name.includes("현미")) return "rice";
  if (name.includes("계란")) return "egg";
  if (name.includes("연어") || name.includes("생선")) return "fish";
  if (name.includes("고구마")) return "sweetPotato";
  if (name.includes("요거트")) return "yogurt";
  if (name.includes("과일") || name.includes("바나나") || name.includes("사과")) return "fruit";
  if (name.includes("견과")) return "nuts";
  return "vegetable";
}

function mapBackendMealPlan(
  backend: BackendMealPlanResponse,
  targetCalories: number,
  durationDays: PlanDuration,
): AIMealPlanResponse {
  return {
    schemaVersion: "fitplate.aiMealPlan.v1",
    source: "mock",
    generatedAt: new Date().toISOString(),
    targetCalories,
    durationDays,
    summary: `${targetCalories.toLocaleString()}kcal 목표에 맞춰 AI가 생성한 ${durationDays}일 식단입니다.`,
    cautions: [
      "의학적 진단이나 치료 목적의 식단이 아닙니다.",
      "알레르기와 개인 질환이 있다면 전문가와 상담하세요.",
    ],
    days: backend.days.map((day) => {
      const meals = [
        { mealType: "breakfast" as const, title: "아침", meal: day.breakfast },
        { mealType: "lunch" as const, title: "점심", meal: day.lunch },
        { mealType: "dinner" as const, title: "저녁", meal: day.dinner },
      ];

      return {
        day: day.dayNumber,
        title: `${day.dayNumber}일차`,
        totalCalories: meals.reduce((sum, item) => sum + item.meal.calories, 0),
        meals: meals.map((item) => ({
          mealType: item.mealType,
          title: item.title,
          calories: item.meal.calories,
          foods: [
            {
              name: item.meal.name,
              amount: "1인분",
              calories: item.meal.calories,
              shoppingCategory: guessShoppingCategory(item.meal.name),
              reason: `단백질 ${item.meal.protein}g, 탄수화물 ${item.meal.carbohydrate}g, 지방 ${item.meal.fat}g 구성입니다.`,
            },
          ],
        })),
      };
    }),
  };
}

export async function generateMealPlanFromApi({
  profile,
  goal,
  durationDays,
  targetCalories,
}: {
  profile: UserProfile;
  goal: GoalType;
  durationDays: PlanDuration;
  targetCalories: number;
}): Promise<AIMealPlanResponse> {

  const requestBody = {
    height: profile.heightCm,
    weight: profile.weightKg,
    gender: mapGenderToBackend(profile.gender),
    age: profile.age,
    bodyFatRate: profile.bodyFatPercentage ?? null,
    goal: mapGoalToBackend(goal),
    periodDays: durationDays,
  };

  console.log("백엔드로 보낼 식단 생성 요청:", requestBody);
  
  const response = await fetch("http://localhost:8080/api/meal-plan", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      height: profile.heightCm,
      weight: profile.weightKg,
      gender: mapGenderToBackend(profile.gender),
      age: profile.age,
      bodyFatRate: profile.bodyFatPercentage ?? null,
      goal: mapGoalToBackend(goal),
      periodDays: durationDays,
    }),
  });  

  if (!response.ok) {
    throw new Error(`식단 생성 API 호출 실패: ${response.status}`);
  }

  const data = (await response.json()) as BackendMealPlanResponse;  
  console.log("백엔드로부터 받은 식단 응답:", data);
  return mapBackendMealPlan(data, targetCalories, durationDays);
}