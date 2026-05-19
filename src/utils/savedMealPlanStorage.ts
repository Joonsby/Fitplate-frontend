import type {
  AIMealPlanResponse,
  GoalType,
  MealPlan,
  NutritionTarget,
  PlanDuration,
  SavedMealPlan,
  UserProfile,
} from "../types/fitplate";

const STORAGE_KEY = "fitplate.savedMealPlans";

interface CreateSavedMealPlanInput {
  profile: UserProfile;
  goal: GoalType;
  target: NutritionTarget;
  planDuration: PlanDuration;
  mealPlan: MealPlan;
  aiMealPlanResponse?: AIMealPlanResponse;
}

// 저장 식단 id를 만듭니다.
// crypto.randomUUID를 쓸 수 없는 환경을 대비해 Date.now fallback을 둡니다.
function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `saved-${Date.now()}`;
}

// localStorage에서 문자열을 읽어 SavedMealPlan 배열로 바꿉니다.
// 파싱이 실패하면 빈 배열을 반환해서 앱이 멈추지 않게 합니다.
export function getSavedMealPlans(): SavedMealPlan[] {
  const rawValue = localStorage.getItem(STORAGE_KEY);

  if (rawValue == null) {
    return [];
  }

  try {
    const parsedValue = JSON.parse(rawValue);

    return Array.isArray(parsedValue) ? (parsedValue as SavedMealPlan[]) : [];
  } catch {
    return [];
  }
}

// SavedMealPlan 배열을 localStorage에 저장합니다.
function setSavedMealPlans(savedMealPlans: SavedMealPlan[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(savedMealPlans));
}

// 현재 생성된 식단을 저장 가능한 형태로 만들고 localStorage에 추가합니다.
export function saveMealPlan(input: CreateSavedMealPlanInput): SavedMealPlan[] {
  const newSavedMealPlan: SavedMealPlan = {
    id: createId(),
    savedAt: new Date().toISOString(),
    ...input,
  };
  const nextSavedMealPlans = [newSavedMealPlan, ...getSavedMealPlans()];

  setSavedMealPlans(nextSavedMealPlans);

  return nextSavedMealPlans;
}

// id가 일치하는 저장 식단을 삭제합니다.
export function deleteSavedMealPlan(id: string): SavedMealPlan[] {
  const nextSavedMealPlans = getSavedMealPlans().filter(
    (savedMealPlan) => savedMealPlan.id !== id,
  );

  setSavedMealPlans(nextSavedMealPlans);

  return nextSavedMealPlans;
}
