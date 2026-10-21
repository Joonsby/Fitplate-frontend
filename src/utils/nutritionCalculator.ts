import type { GoalType, NutritionTarget, UserProfile } from "../types/fitplate";

// 활동계수는 고정값입니다. 서버 NutritionCalculator 와 같은 값이어야 목표 화면 kcal 이 실제 목표와 맞습니다.
const ACTIVITY_FACTOR = 1.35;

// 목표별 칼로리 보정값입니다.
// TDEE에서 감량은 400kcal를 빼고, 증량은 300kcal를 더합니다.
const GOAL_CALORIE_OFFSET: Record<GoalType, number> = {
  lose: -400,
  maintain: 0,
  gain: 300,
};

// 숫자 입력값이 0 이하이거나 비정상 값이면 최소값으로 보정합니다.
// 잘못된 입력이 들어와도 계산 결과가 NaN이나 음수가 되지 않게 하는 최소 방어 로직입니다.
function ensurePositiveNumber(value: number, fallback: number): number {
  if (!Number.isFinite(value) || value <= 0) {
    return fallback;
  }

  return value;
}

// 계산에 사용할 프로필 값을 안전한 숫자로 정리합니다.
function sanitizeProfile(profile: UserProfile): UserProfile {
  return {
    ...profile,
    height: ensurePositiveNumber(profile.height, 170),
    weight: ensurePositiveNumber(profile.weight, 60),
    age: ensurePositiveNumber(profile.age, 30),
    bodyFatRate:
      profile.bodyFatRate == null
        ? undefined
        : ensurePositiveNumber(profile.bodyFatRate, 0),
  };
}

// BMR은 기초대사량입니다. 서버와 같이 체지방률이 있으면 Katch-McArdle,
// 없으면 성별별 Mifflin-St Jeor 공식을 씁니다.
function calculateBmr(profile: UserProfile): number {
  if (profile.bodyFatRate != null) {
    const leanBodyMass = profile.weight * (1 - profile.bodyFatRate / 100);
    return 370 + 21.6 * leanBodyMass;
  }

  const common =
    10 * profile.weight + 6.25 * profile.height - 5 * profile.age;

  if (profile.gender === "male") {
    return common + 5;
  }

  return common - 161;
}

// 입력된 신체정보와 목표로 BMR, TDEE, 목표 칼로리, 탄단지 목표를 계산합니다.
// 서버/API/AI 없이 React state에 있는 값만 인자로 받아 순수하게 계산합니다.
export function calculateNutritionTarget(
  profile: UserProfile,
  goal: GoalType,
): NutritionTarget {
  const safeProfile = sanitizeProfile(profile);
  const bmr = Math.round(calculateBmr(safeProfile));
  const tdee = Math.round(bmr * ACTIVITY_FACTOR);
  const calories = Math.max(0, tdee + GOAL_CALORIE_OFFSET[goal]);

  // 단백질은 체중 1kg당 1.6g 기준입니다.
  const proteinGram = Math.round(safeProfile.weight * 1.6);

  // 지방은 전체 칼로리의 25%이며, 지방 1g은 9kcal로 계산합니다.
  const fatGram = Math.round((calories * 0.25) / 9);

  // 남은 칼로리는 탄수화물로 계산하고, 탄수화물 1g은 4kcal로 계산합니다.
  const remainingCalories = calories - proteinGram * 4 - fatGram * 9;
  const carbsGram = Math.max(0, Math.trunc(remainingCalories / 4));

  return {
    bmr,
    tdee,
    calories,
    proteinGram,
    carbsGram,
    fatGram,
  };
}
