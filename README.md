# Fitplate Frontend

사용자의 신체 정보와 목표(감량/유지/증량)를 입력하면 AI가 기간별 맞춤 식단을 생성해주는 React 기반 웹 앱입니다.

---

## 주요 기능

- **신체 정보 입력** — 키, 체중, 나이, 성별, 체지방률(선택) 입력
- **목표 및 기간 설정** — 감량 / 유지 / 증량 목표, 3일 / 7일 / 14일 기간 선택
- **AI 식단 생성** — 백엔드 AI API를 통해 하루 3끼 기간별 맞춤 식단 생성
- **영양 정보 확인** — BMR / TDEE 계산 기반 목표 칼로리, 단백질 / 탄수화물 / 지방 목표량 표시
- **식단 저장** — 생성된 식단을 백엔드에 저장하고 이후 다시 조회
- **즐겨찾기 음식** — 특정 음식을 즐겨찾기로 등록 / 조회 / 삭제
- **장보기 목록** — 식단 내 재료를 통합 집계하여 쇼핑 링크와 함께 제공

---

## 화면 구성

| 경로 | 페이지 | 역할 |
|---|---|---|
| `/` | `HomePage` | 신체 정보 입력 및 저장 |
| `/goal` | `GoalPage` | 목표 / 기간 선택 및 AI 식단 생성 트리거 |
| `/result` | `ResultPage` | 생성된 식단 결과, 영양 정보, 장보기 목록 표시 |
| `/saved-plans` | `SavedMealPlansPage` | 저장된 식단 목록 및 상세 보기 |
| `/favorite-foods` | `FavoriteFoodsPage` | 즐겨찾기 음식 목록 관리 |

---

## 기술 스택

| 분류 | 기술 |
|---|---|
| 프레임워크 | React 18 + TypeScript |
| 라우팅 | React Router DOM v7 |
| UI 컴포넌트 | Toss TDS Mobile (`@toss/tds-mobile`) |
| 스타일 | Emotion, TDS Colors |
| 슬라이더 | Swiper v12 |
| 빌드 도구 | Vite 6 |
| 배포 | Toss AIT (`@apps-in-toss/web-framework`) |
| 코드 품질 | ESLint, Prettier, TypeScript strict |

---

## 폴더 구조

```
src/
├── api/              # 백엔드 HTTP 통신 모듈
│   ├── apiConfig.ts          # API 기본 URL / 엔드포인트 상수
│   ├── httpClient.ts         # fetch 래퍼 (에러 처리 공통화)
│   ├── authApi.ts            # 로그인 / 유저 프로필 조회
│   ├── authToken.ts          # 액세스 토큰 인메모리 관리
│   ├── mealPlanApi.ts        # AI 식단 생성 요청
│   ├── mealPlanStorageApi.ts # 식단 저장 / 조회 / 삭제
│   └── favoriteFoodsApi.ts   # 즐겨찾기 음식 CRUD
├── components/
│   ├── common/       # AppTopTitle, NutritionPanel 등 공통 컴포넌트
│   ├── result/       # 식단 결과 화면 전용 컴포넌트
│   ├── forms/        # 입력 폼 컴포넌트
│   └── screens/      # 화면 단위 구성 컴포넌트
├── hooks/            # 커스텀 훅
│   ├── useAiMealPlan.ts        # AI 식단 생성 상태 관리
│   ├── useMealPlanSelection.ts # 프로필 / 목표 / 기간 상태 관리
│   ├── useSavedMealPlans.ts    # 저장 식단 상태 관리
│   ├── useFavoriteFoods.ts     # 즐겨찾기 상태 관리
│   └── useToast.tsx            # 토스트 알림 훅
├── pages/            # 라우트별 페이지 컴포넌트
├── types/
│   └── fitplate.ts   # 앱 전체 도메인 타입 정의
├── utils/            # 순수 계산 / 변환 유틸
│   ├── nutritionCalculator.ts    # BMR / TDEE / 목표 칼로리 계산
│   ├── mealPlanMerger.ts         # AI 응답 → 내부 식단 구조 변환
│   ├── mealPlanSelector.ts       # 식단 항목 선택 로직
│   ├── shoppingListAggregator.ts # 재료 중복 집계
│   └── shoppingHref.ts           # 카테고리별 쇼핑 링크 생성
├── App.tsx           # 라우팅 / 로그인 / 전역 상태 진입점
└── main.tsx          # 앱 마운트
```

---

## 실행 방법

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build

# 배포
npm run deploy
```

> 개발 서버는 Toss 내부 도구(`granite dev`)를 사용합니다.  
> 배포 API 키는 [앱인토스 콘솔](https://apps-in-toss.toss.im/) > 워크스페이스 > API 키에서 발급받을 수 있습니다.

---

## 환경변수 예시

현재 API 기본 URL은 코드 내 상수로 관리됩니다.

```typescript
// src/api/apiConfig.ts
export const API_BASE_URL = "http://localhost:8080";
```

배포 환경에서는 이 값을 환경변수(`.env`)로 분리하는 작업이 필요합니다.

---

## 백엔드 연동 구조

```
프론트엔드 (React)
    │
    ├── POST   /api/auth/dev-login              # 개발용 자동 로그인
    ├── GET    /api/user-profile/me             # 저장된 신체 정보 조회
    ├── POST   /api/meal-plan                   # AI 식단 생성 요청
    ├── POST   /api/meal-plan/save              # 생성된 식단 저장
    ├── GET    /api/meal-plan/save              # 저장된 식단 목록 조회
    ├── DELETE /api/meal-plan/{id}              # 저장 식단 삭제
    ├── POST   /api/meal-plan/{id}/favorite     # 음식 즐겨찾기 등록
    ├── GET    /api/favorite-foods              # 즐겨찾기 목록 조회
    └── DELETE /api/favorite-foods/{id}        # 즐겨찾기 삭제
```

인증은 서버에서 발급한 액세스 토큰을 인메모리에 보관하고, 매 API 요청의 `Authorization` 헤더에 첨부합니다.

---

## 현재 구현 상태

| 기능 | 상태 |
|---|---|
| 신체 정보 입력 / 수정 | 완료 |
| 목표 및 기간 선택 | 완료 |
| 영양 목표 계산 (BMR / TDEE) | 완료 |
| AI 식단 생성 UI 흐름 | 완료 |
| 식단 결과 화면 (날짜별 스와이프) | 완료 |
| 장보기 목록 집계 | 완료 |
| 즐겨찾기 음식 CRUD | 완료 |
| 식단 저장 / 목록 조회 | 완료 |
| 실제 AI API 연동 | 미완료 (개발용 임시 데이터 사용 중) |
| 토스 로그인 연동 | 미완료 (개발 환경은 dev-login 사용) |
| 환경변수 분리 | 미완료 (API URL 하드코딩) |

---

## 향후 개선 예정

- 실제 백엔드 AI 식단 생성 API 연동 (`USE_TEMPORARY_MEAL_PLAN_DATA` 플래그 제거)
- 토스 OAuth 로그인 연동 (`/api/auth/toss-login`)
- API 기본 URL 환경변수 분리
- 식단 수정 기능 (특정 음식 교체 등)
- 영양소 목표 달성률 시각화
