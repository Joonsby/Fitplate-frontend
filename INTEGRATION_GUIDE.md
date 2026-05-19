# Fitplate API 프론트엔드-백엔드 연동 가이드

## 완료된 작업

### 백엔드

- `POST /api/meal-plan` 엔드포인트
- CORS 설정
- Mock 식단 응답
- 요청: `MealPlanRequest`
- 응답: `MealPlanResponse`

### 프론트엔드

- `src/api/apiConfig.ts`: API 기본 URL과 엔드포인트 설정
- `src/api/types.ts`: API 요청/응답 TypeScript 타입
- `src/api/mealPlanApi.ts`: `generateMealPlan()` API 호출 함수

## 사용 방법

### 1. API 호출

```typescript
import { generateMealPlan } from "./api/mealPlanApi";
import type { MealPlanRequest } from "./api/types";

const request: MealPlanRequest = {
  height: userProfile.heightCm,
  weight: userProfile.weightKg,
  age: userProfile.age,
  gender: userProfile.gender.toUpperCase(),
  bodyFatRate: userProfile.bodyFatPercentage,
  goal: "WEIGHT_LOSS",
  periodDays: planDuration,
};

const result = await generateMealPlan(request);

if (result.success && result.data) {
  // result.data.days를 프론트엔드 MealPlan 구조로 변환해서 사용합니다.
}
```

### 2. 목표값 변환 예시

```typescript
import type { GoalType } from "./types/fitplate";

function goalToBackendFormat(goal: GoalType): string {
  const goalMap: Record<GoalType, string> = {
    lose: "WEIGHT_LOSS",
    maintain: "DIET_BALANCE",
    gain: "MUSCLE_GAIN",
  };

  return goalMap[goal];
}
```

## API 요청 예시

```json
{
  "height": 175,
  "weight": 70,
  "age": 30,
  "gender": "MALE",
  "bodyFatRate": 15.5,
  "goal": "WEIGHT_LOSS",
  "periodDays": 7
}
```

## API 응답 예시

```json
{
  "days": [
    {
      "dayNumber": 1,
      "breakfast": {
        "name": "계란말이, 흰쌀밥, 미역국",
        "calories": 650,
        "protein": 28.5,
        "carbohydrate": 72,
        "fat": 18.2
      },
      "lunch": {
        "name": "불고기덮밥, 계란찜, 깍두기",
        "calories": 750,
        "protein": 35.2,
        "carbohydrate": 85,
        "fat": 20.5
      },
      "dinner": {
        "name": "연어구이, 현미밥, 시금치나물",
        "calories": 680,
        "protein": 42,
        "carbohydrate": 68,
        "fat": 16.8
      }
    }
  ]
}
```

## 에러 처리

`generateMealPlan()`은 API 호출에 실패하면 fallback 더미 식단을 반환합니다.

- 네트워크 오류가 있어도 개발 화면을 계속 확인할 수 있습니다.
- fallback 식단 이름에는 `[Fallback]` prefix가 붙습니다.

## 실행

백엔드:

```bash
cd fitplate-api
./gradlew bootRun
```

프론트엔드:

```bash
cd Fitplate
npm install
npm run dev
```

## 주의사항

- `API_BASE_URL`은 현재 `http://localhost:8080`입니다.
- 배포 시 실제 서버 URL로 변경해야 합니다.
- 아직 DB 저장과 로그인 기능은 없습니다.
