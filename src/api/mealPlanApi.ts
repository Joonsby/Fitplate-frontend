import type {
  AIMealPlanResponse,
  GoalType,
  PlanDuration,
  ShoppingCategory,
  UserProfile,
} from "../types/fitplate";

import { API_ENDPOINTS, getApiUrl } from "./apiConfig";

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

/**
 * 임시 식단 데이터 사용 여부입니다.
 *
 * 현재 백엔드 서버나 AI 식단 생성 API가 준비되지 않았거나, 호출 실패 화면이 아닌
 * 정상 결과 화면을 먼저 확인해야 할 때만 true로 켜두는 개발용 스위치입니다.
 *
 * true일 때:
 * - 아래 generateMealPlanFromApi 함수가 실제 fetch 요청을 보내지 않습니다.
 * - createTemporaryBackendMealPlanResponse가 만든 임시 데이터를 실제 백엔드 응답처럼
 *   mapBackendMealPlan에 전달합니다.
 * - 따라서 ResultScreen, 쇼핑 목록, 즐겨찾기, 저장하기 같은 프론트 화면 흐름을
 *   백엔드 없이도 테스트할 수 있습니다.
 *
 * false로 바꾸면:
 * - http://localhost:8080/api/meal-plan 으로 실제 요청을 보냅니다.
 * - 백엔드 연동이 완료되면 이 값을 false로 바꾸거나, 이 임시 데이터 블록을
 *   통째로 삭제하면 됩니다.
 */
const USE_TEMPORARY_MEAL_PLAN_DATA = false;

/**
 * 백엔드 응답과 동일한 모양으로 만든 임시 식단 템플릿입니다.
 *
 * 중요한 점은 이 데이터가 화면 전용 가짜 데이터가 아니라, 현재 프론트가 기대하는
 * 백엔드 DTO 구조(BackendMealPlanResponse, BackendDay, BackendMeal)를 그대로 따른다는
 * 것입니다. 그래서 실제 API 응답이 들어왔을 때도 mapBackendMealPlan 함수의 동작을
 * 거의 같은 조건에서 확인할 수 있습니다.
 *
 * calories, protein, carbohydrate, fat 값은 화면 표시와 reason 문구 생성을 확인하기 위한
 * 샘플 숫자입니다. 의학적/영양학적 처방 값이 아니므로 실제 서비스용 추천값으로
 * 사용하면 안 됩니다.
 */
const TEMPORARY_MEAL_TEMPLATES: Array<{
  breakfast: BackendMeal;
  lunch: BackendMeal;
  dinner: BackendMeal;
}> = [
  {
    breakfast: {
      name: "그릭요거트 바나나 볼",
      calories: 420,
      protein: 24,
      carbohydrate: 58,
      fat: 10,
    },
    lunch: {
      name: "닭가슴살 현미밥 정식",
      calories: 640,
      protein: 42,
      carbohydrate: 78,
      fat: 15,
    },
    dinner: {
      name: "연어 구이와 고구마 샐러드",
      calories: 560,
      protein: 36,
      carbohydrate: 48,
      fat: 22,
    },
  },
  {
    breakfast: {
      name: "계란 토스트와 사과",
      calories: 450,
      protein: 26,
      carbohydrate: 55,
      fat: 14,
    },
    lunch: {
      name: "소불고기 채소덮밥",
      calories: 690,
      protein: 38,
      carbohydrate: 86,
      fat: 20,
    },
    dinner: {
      name: "닭가슴살 샐러드와 견과",
      calories: 520,
      protein: 44,
      carbohydrate: 32,
      fat: 24,
    },
  },
  {
    breakfast: {
      name: "오트밀 과일 요거트",
      calories: 430,
      protein: 22,
      carbohydrate: 64,
      fat: 9,
    },
    lunch: {
      name: "연어 현미밥 포케",
      calories: 660,
      protein: 39,
      carbohydrate: 74,
      fat: 21,
    },
    dinner: {
      name: "계란 닭가슴살 볶음밥",
      calories: 590,
      protein: 41,
      carbohydrate: 62,
      fat: 18,
    },
  },
];

function createTemporaryBackendMealPlanResponse(
  durationDays: PlanDuration,
): BackendMealPlanResponse {
  return {
    days: Array.from({ length: durationDays }, (_, index) => ({
      dayNumber: index + 1,
      ...TEMPORARY_MEAL_TEMPLATES[index % TEMPORARY_MEAL_TEMPLATES.length],
    })),
  };
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

  if (USE_TEMPORARY_MEAL_PLAN_DATA) {
    const temporaryData = createTemporaryBackendMealPlanResponse(durationDays);

    console.log("임시 식단 데이터를 사용합니다:", temporaryData);
    return mapBackendMealPlan(temporaryData, targetCalories, durationDays);
  }
  
  let response: Response;

  try {
    response = await fetch(`${getApiUrl(API_ENDPOINTS.MEAL_PLAN)}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });
  } catch (error) {
    console.error("식단 생성 API 네트워크 오류:", error);
    throw new Error(
      `AI 식단 생성 서버에 연결하지 못했습니다.\n 서버 상태를 확인한 뒤 다시 시도해주세요.`
    );
  }

console.log("백엔드로부터 받은 원시 응답:", response);

if (!response.ok) {
  const errorText = await response.text();

  console.error("식단 생성 API 호출 실패:", {
    status: response.status,
    statusText: response.statusText,
    body: errorText,
  });

  throw new Error(
    "AI 식단 생성에 실패했습니다. 잠시 후 다시 시도해주세요.",
  );
}

  const data = (await response.json()) as BackendMealPlanResponse;  
  console.log("백엔드로부터 받은 식단 응답:", data);
  return mapBackendMealPlan(data, targetCalories, durationDays);
}
