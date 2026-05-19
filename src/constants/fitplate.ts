import type { GoalType } from "../types/fitplate";

// 목표 타입을 화면에 보여줄 한국어 문구로 바꿔주는 상수입니다.
export const GOAL_LABELS: Record<GoalType, string> = {
  lose: "감량",
  maintain: "유지",
  gain: "증량",
};

// 목표 카드 아래에 보여줄 짧은 설명입니다.
export const GOAL_DESCRIPTIONS: Record<GoalType, string> = {
  lose: "TDEE에서 400kcal를 줄여 체중 감량을 돕는 목표",
  maintain: "TDEE를 그대로 사용해 현재 체중을 유지하는 목표",
  gain: "TDEE에 300kcal를 더해 체중 증가를 돕는 목표",
};
