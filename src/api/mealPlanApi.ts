import type {
  AIMealPlanResponse,
  GoalType,
  UserProfile,
} from "../types/fitplate";
import { API_ENDPOINTS, getApiUrl } from "./apiConfig";
import { getAccessToken } from "./authToken";
import { apiFetch } from "./httpClient";

interface BackendMealPlanGenerateResponse {
  height: number;
  weight: number;
  age: number;
  gender: string;
  goal: string;
  targetCalories: number;
  bmr: number;
  tdee: number;
  proteinGram: number;
  carbsGram: number;
  fatGram: number;
  aiMealPlanResponse: AIMealPlanResponse;
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
const TEMPORARY_MEAL_PLAN_RESPONSE: BackendMealPlanGenerateResponse = {
  height: 170,
  weight: 68,
  age: 30,
  gender: "MALE",
  goal: "MAINTAIN",
  targetCalories: 2157,
  bmr: 1598,
  tdee: 2157,
  proteinGram: 109,
  carbsGram: 295,
  fatGram: 60,
  aiMealPlanResponse: {
    meals: [
      {
        mealType: "breakfast",
        title: "아침 식단",
        foods: [
          { name: "현미밥", amount: "200g", calories: 307, protein: 6.7, carbohydrate: 64.0, fat: 2.7, shoppingKeyword: "즉석 현미밥" },
          { name: "닭가슴살 구이", amount: "120g", calories: 135, protein: 28.0, carbohydrate: 0.0, fat: 2.0, shoppingKeyword: "닭가슴살 슬라이스" },
          { name: "계란후라이", amount: "1개", calories: 80, protein: 6.0, carbohydrate: 0.5, fat: 6.0, shoppingKeyword: "계란" },
          { name: "시금치나물", amount: "50g", calories: 35, protein: 2.0, carbohydrate: 3.0, fat: 2.0, shoppingKeyword: "시금치" },
        ],
      },
      {
        mealType: "lunch",
        title: "점심 식단",
        foods: [
          { name: "현미밥", amount: "200g", calories: 307, protein: 6.7, carbohydrate: 64.0, fat: 2.7, shoppingKeyword: "즉석 현미밥" },
          { name: "소고기 안심 구이", amount: "120g", calories: 180, protein: 25.0, carbohydrate: 0.0, fat: 8.0, shoppingKeyword: "소고기 안심" },
          { name: "쌈채소", amount: "50g", calories: 10, protein: 1.0, carbohydrate: 2.0, fat: 0.0, shoppingKeyword: "쌈채소" },
          { name: "된장찌개", amount: "200g", calories: 80, protein: 5.0, carbohydrate: 8.0, fat: 3.0, shoppingKeyword: "찌개용 된장" },
        ],
      },
      {
        mealType: "dinner",
        title: "저녁 식단",
        foods: [
          { name: "고구마", amount: "200g", calories: 240, protein: 3.0, carbohydrate: 58.0, fat: 0.4, shoppingKeyword: "꿀고구마" },
          { name: "연어 구이", amount: "130g", calories: 260, protein: 26.0, carbohydrate: 0.0, fat: 16.5, shoppingKeyword: "냉동 연어 필렛" },
          { name: "양상추 샐러드", amount: "100g", calories: 15, protein: 1.0, carbohydrate: 3.0, fat: 0.0, shoppingKeyword: "양상추" },
          { name: "두부", amount: "100g", calories: 80, protein: 8.0, carbohydrate: 3.0, fat: 4.5, shoppingKeyword: "국산 두부" },
        ],
      },
    ],
  },
};

function mapGoalToBackend(goal: GoalType): string {
  if (goal === "lose") return "WEIGHT_LOSS";
  if (goal === "gain") return "WEIGHT_GAIN";
  return "MAINTAIN";
}

function mapGenderToBackend(gender: UserProfile["gender"]): string {
  return gender === "male" ? "MALE" : "FEMALE";
}

export async function generateMealPlanFromApi({
  profile,
  goal,
}: {
  profile: UserProfile;
  goal: GoalType;
}): Promise<BackendMealPlanGenerateResponse> {
  const requestBody = {
    height: profile.height,
    weight: profile.weight,
    gender: mapGenderToBackend(profile.gender),
    age: profile.age,
    bodyFatRate: profile.bodyFatPercentage ?? null,
    goal: mapGoalToBackend(goal),
  };

  if (USE_TEMPORARY_MEAL_PLAN_DATA) {
    return TEMPORARY_MEAL_PLAN_RESPONSE;
  }

  const accessToken = getAccessToken();
  if (!accessToken) {
    throw new Error("인증 토큰이 없습니다. 로그인 상태를 확인해주세요.");
  }  

  const data = await apiFetch<BackendMealPlanGenerateResponse>(
    getApiUrl(API_ENDPOINTS.MEAL_PLAN),
    {
      method: "POST",
      body: requestBody,
      networkErrorMessage: "AI 식단 생성 서버에 연결하지 못했습니다.\n 서버 상태를 확인한 뒤 다시 시도해주세요.",
      httpErrorMessage: "AI 식단 생성에 실패했습니다. 잠시 후 다시 시도해주세요.",
    }
  );
  
  return data;
}
