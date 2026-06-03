import type {  
  AIMealPlanResponse,
  GoalType,
  PlanDuration,
  UserProfile,
} from "../types/fitplate";
import { API_ENDPOINTS, getApiUrl } from "./apiConfig";
import { getAccessToken } from "./authToken";

interface BackendMealPlanGenerateResponse {
  height: number;
  weight: number;
  age: number;
  gender: string;
  goal: string;
  periodDays: PlanDuration;
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
const USE_TEMPORARY_MEAL_PLAN_DATA = true;

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
  age: 30,
  bmr: 1598,
  carbsGram: 295,
  fatGram: 60,
  gender: "MALE",
  goal: "MAINTAIN",
  height: 170,
  periodDays: 3,
  proteinGram: 109,
  targetCalories: 2157,
  tdee: 2157,
  weight: 68,
  aiMealPlanResponse: {
    days: [
      {
        dayNumber: 1,
        breakfast: {
          name: "현미밥과 북어국, 계란후라이, 시금치나물",
          calories: 560,
          carbohydrate: 80,
          fat: 16,
          protein: 22.5,
        },
        lunch: {
          name: "잡곡밥과 제육볶음, 상추쌈, 된장찌개",
          calories: 820,
          carbohydrate: 105,
          fat: 26,
          protein: 42,
        },
        dinner: {
          name: "흑미밥과 삼치구이, 두부구이, 콩나물국",
          calories: 720,
          carbohydrate: 88,
          fat: 24,
          protein: 38,
        },
      },
      {
        dayNumber: 2,
        breakfast: {
          name: "소고기야채죽과 삶은 달걀, 백김치",
          calories: 510,
          carbohydrate: 78,
          fat: 13,
          protein: 20,
        },
        lunch: {
          name: "전주비빔밥(소고기, 계란후라이 포함)과 미역국",
          calories: 840,
          carbohydrate: 115,
          fat: 26.5,
          protein: 35,
        },
        dinner: {
          name: "현미밥과 해물순두부찌개, 조기구이, 애호박볶음",
          calories: 750,
          carbohydrate: 92,
          fat: 24.5,
          protein: 40,
        },
      },
      {
        dayNumber: 3,
        breakfast: {
          name: "잡곡밥과 야채계란말이, 소고기무국, 구운 김",
          calories: 580,
          carbohydrate: 82,
          fat: 17,
          protein: 25,
        },
        lunch: {
          name: "현미밥과 안동찜닭, 시금치나물, 동치미",
          calories: 810,
          carbohydrate: 98,
          fat: 26,
          protein: 45,
        },
        dinner: {
          name: "곤드레나물밥과 소불고기, 버섯구이, 배추된장국",
          calories: 710,
          carbohydrate: 85,
          fat: 24,
          protein: 38,
        },
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
  durationDays,  
}: {
  profile: UserProfile;
  goal: GoalType;
  durationDays: PlanDuration;  
}): Promise<BackendMealPlanGenerateResponse> {
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
    console.log(JSON.stringify(TEMPORARY_MEAL_PLAN_RESPONSE, null, 2));
    return TEMPORARY_MEAL_PLAN_RESPONSE;
  }
  
  let response: Response;

  try {
    const accessToken = getAccessToken();
    if (!accessToken) {
      throw new Error("인증 토큰이 없습니다. 로그인 상태를 확인해주세요.");
    }
    response = await fetch(`${getApiUrl(API_ENDPOINTS.MEAL_PLAN)}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
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

  const data = (await response.json()) as BackendMealPlanGenerateResponse;
  console.log("백엔드로부터 받은 식단 응답:", data);  
  return data;
}
