/**
 * API 서버 설정입니다.
 * 백엔드 API의 기본 URL과 엔드포인트를 한 곳에서 관리합니다.
 */

// 개발 환경에서는 localhost:8080을 사용합니다.
// 배포 환경에서는 실제 서버 URL로 교체하면 됩니다.
export const API_BASE_URL = "http://3.219.126.219:8080";

// 식단 계획 API 엔드포인트입니다.
export const API_ENDPOINTS = {
  MEAL_PLAN: "/api/meal-plan",
} as const;

// endpoint를 받아 전체 API URL을 만드는 헬퍼 함수입니다.
export const getApiUrl = (endpoint: string): string => {
  return `${API_BASE_URL}${endpoint}`;
};
