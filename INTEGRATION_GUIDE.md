# Fitplate API 프론트엔드-백엔드 연동 가이드

## 프로젝트 구조

리팩토링 이후 소스는 아래 레이어로 구성됩니다.

```
src/
├── api/              ← 백엔드 HTTP 호출 함수
│   ├── apiConfig.ts        - 기본 URL, 엔드포인트, URL 헬퍼
│   ├── mealPlanApi.ts      - AI 식단 생성 API
│   ├── mealPlanStorageApi.ts - 저장/삭제/즐겨찾기 API
│   └── types.ts            - 외부 공개용 API DTO 타입
├── hooks/            ← 상태 + 비즈니스 로직
│   ├── useAiMealPlan.ts        - AI 식단 생성 상태 (sessionStorage 캐시 포함)
│   ├── useMealPlanSelection.ts - 프로필·목표·기간·영양목표 계산
│   ├── useSavedMealPlans.ts    - 저장 식단 목록, 보기 상태
│   └── useFavoriteFoods.ts     - 즐겨찾기 목록
├── pages/            ← 라우트 단위 컴포넌트 (API 호출·이벤트 처리)
│   ├── HomePage.tsx
│   ├── GoalPage.tsx
│   ├── ResultPage.tsx
│   ├── SavedMealPlansPage.tsx
│   └── FavoriteFoodsPage.tsx
├── components/       ← 표시 전용 컴포넌트 (props만 받아 렌더)
└── types/
    └── fitplate.ts   - 앱 내부 도메인 타입 (MealPlan, UserProfile 등)
```

**라우팅 구조** (`App.tsx`에서 React Router로 관리)

| 경로 | 페이지 |
|---|---|
| `/` | `HomePage` |
| `/goal` | `GoalPage` |
| `/result` | `ResultPage` |
| `/saved-plans` | `SavedMealPlansPage` |
| `/favorite-foods` | `FavoriteFoodsPage` |

---

## 완료된 백엔드 연동

### AI 식단 생성

- `POST /api/meal-plan` — 프로필과 목표를 보내면 일별 식단 반환
- 담당 파일: `src/api/mealPlanApi.ts` → `generateMealPlanFromApi()`

### 식단 저장 및 삭제

- `POST /api/meal-plans` — 결과 화면에서 식단 저장
- `DELETE /api/meal-plans/:id` — 저장 목록에서 식단 삭제
- 담당 파일: `src/api/mealPlanStorageApi.ts`

### 즐겨찾기

- `POST /api/meal-plans/:mealPlanId/favorite` — 즐겨찾기 추가
- `DELETE /api/meal-plans/:mealPlanId/favorite` — 즐겨찾기 삭제
- 담당 파일: `src/api/mealPlanStorageApi.ts`

---

## API 설정

`src/api/apiConfig.ts`에서 URL을 중앙 관리합니다.

```typescript
export const API_BASE_URL = "http://localhost:8080";

export const API_ENDPOINTS = {
  MEAL_PLAN: "/api/meal-plan",   // AI 식단 생성
  MEAL_PLANS: "/api/meal-plans", // 저장·삭제·즐겨찾기
} as const;

// 즐겨찾기 URL 헬퍼
export const getMealPlanFavoriteUrl = (mealPlanId: string): string =>
  getApiUrl(`${API_ENDPOINTS.MEAL_PLANS}/${mealPlanId}/favorite`);
```

---

## API 요청/응답 형식

### AI 식단 생성 요청 (`POST /api/meal-plan`)

```json
{
  "height": 175,
  "weight": 70,
  "age": 30,
  "gender": "MALE",
  "bodyFatRate": 15.5,
  "goal": "WEIGHT_LOSS",
  "durationDays": 7
}
```

`goal` 값 매핑.

| 프론트 (`GoalType`) | 백엔드 |
|---|---|
| `"lose"` | `"WEIGHT_LOSS"` |
| `"maintain"` | `"MAINTAIN"` |
| `"gain"` | `"WEIGHT_GAIN"` |

`gender` 값 매핑.

| 프론트 | 백엔드 |
|---|---|
| `"male"` | `"MALE"` |
| `"female"` | `"FEMALE"` |

### AI 식단 생성 응답

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
      "lunch": { "name": "...", "calories": 750, "protein": 35.2, "carbohydrate": 85, "fat": 20.5 },
      "dinner": { "name": "...", "calories": 680, "protein": 42, "carbohydrate": 68, "fat": 16.8 }
    }
  ]
}
```

응답은 `mapBackendMealPlan()` 함수에서 앱 내부 타입(`AIMealPlanResponse`)으로 변환됩니다.

---

## 개발용 임시 데이터 스위치

`src/api/mealPlanApi.ts` 상단에 다음 플래그가 있습니다.

```typescript
const USE_TEMPORARY_MEAL_PLAN_DATA = true;
```

- `true` — 백엔드로 요청을 보내지 않고 내장 템플릿 데이터를 사용합니다. ResultScreen, 쇼핑 목록, 즐겨찾기, 저장 등 프론트 흐름을 백엔드 없이 확인할 수 있습니다.
- `false` — `http://localhost:8080/api/meal-plan`으로 실제 요청을 보냅니다. 백엔드 연동이 완료되면 `false`로 바꾸거나 이 블록을 삭제하면 됩니다.

---

## 에러 처리

`generateMealPlanFromApi()`는 오류 발생 시 더 이상 fallback 식단을 반환하지 않고 `Error`를 throw합니다.

- 네트워크 오류 → `"AI 식단 생성 서버에 연결하지 못했습니다."` throw
- HTTP 오류 응답 → `"AI 식단 생성에 실패했습니다."` throw

`useAiMealPlan` 훅이 예외를 catch해 `aiError` 상태에 저장하고 `ResultPage`가 이를 화면에 표시합니다.

저장/즐겨찾기 API(`mealPlanStorageApi.ts`)는 실패 시 `Error`를 throw하며, 각 Page 컴포넌트(`ResultPage`, `SavedMealPlansPage`, `FavoriteFoodsPage`)가 try/catch로 처리한 뒤 `alert()`로 사용자에게 알립니다.

---

## AI 식단 세션 유지

`useAiMealPlan`은 생성된 응답을 `sessionStorage`에 저장합니다.

- 키: `fitplate_aiMealPlanResponse`
- 페이지 이동 후 돌아와도 이전 AI 식단이 유지됩니다.
- `resetAiMealPlan()` 호출 시 세션에서도 삭제됩니다.
- 저장 식단 보기(`restoreAiMealPlan()`) 시 저장 당시 응답이 세션에 복원됩니다.

---

## 실행

백엔드.

```bash
cd fitplate-api
./gradlew bootRun
```

프론트엔드.

```bash
cd Fitplate
npm install
npm run dev
```

---

## 주의사항

- `API_BASE_URL`은 현재 `http://localhost:8080`입니다. 배포 시 실제 서버 URL로 변경해야 합니다.
- 저장 식단(`savedMealPlans`)과 즐겨찾기(`favoriteFoods`)는 앱 시작 시 서버에서 불러오는 초기 로드 API가 아직 없습니다. 현재는 해당 세션에서 생성한 항목만 상태에 반영됩니다.
- `AIMealPlanResponse.source`는 임시 데이터/실제 API 호출 모두 `"mock"`으로 고정되어 있습니다. 실제 AI 연동 시 구분이 필요하면 값을 변경해야 합니다.
- 사용자 프로필은 `useMealPlanSelection` 내부에 하드코딩되어 있습니다(`height: 170, weight: 68, age: 30, gender: "male"`). `UserProfileForm` 컴포넌트가 존재하지만 아직 이 훅과 연결되지 않았습니다.
