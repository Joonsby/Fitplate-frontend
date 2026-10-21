import { appLogin } from "@apps-in-toss/web-framework";
import { API_ENDPOINTS, getApiUrl } from "./apiConfig";
import { getAccessToken } from "./authToken";
import type { FoodCategory, UserProfile } from "../types/fitplate";
import { apiFetch, apiFetchRaw } from "./httpClient";

async function tossLogin(authorizationCode: string, referrer: string) {
  return apiFetch<{ accessToken: string }>(getApiUrl(API_ENDPOINTS.AUTH_TOSS_LOGIN), {
    method: "POST",
    body: { authorizationCode, referrer },
    withAuth: false,
    httpErrorMessage: "Toss 로그인에 실패했습니다.",
  });
}

async function devLogin() {
  return apiFetch<{ accessToken: string }>(getApiUrl(API_ENDPOINTS.AUTH_DEV_LOGIN), {
    method: "POST",
    withAuth: false,
    httpErrorMessage: "개발자 로그인에 실패했습니다.",
  });
}

export async function getMyUserProfile(): Promise<UserProfile | null> {
  const accessToken = getAccessToken();
  const response = await apiFetchRaw(getApiUrl(API_ENDPOINTS.USER_PROFILE_ME), {
    headers: accessToken ? { "Authorization": `Bearer ${accessToken}` } : {},
    withAuth: false,
  });

  if (response.status === 204) {
    return null;
  }

  if (!response.ok) {
    console.error("[UserProfile] 조회 실패:", response.status);
    return null;
  }

  return toUserProfile(await response.json());
}

interface ApiUserProfile {
  height: number;
  weight: number;
  age: number;
  gender: "MALE" | "FEMALE";
  bmi?: number;
  bodyFatRate?: number | null;
  preferredFoodCategories?: FoodCategory[];
  excludedFoodCategories?: FoodCategory[];
  allergyFoodCategories?: FoodCategory[];
}

function toUserProfile(data: ApiUserProfile): UserProfile {
  return {
    height: data.height,
    weight: data.weight,
    age: data.age,
    gender: data.gender === "FEMALE" ? "female" : "male",
    bmi : data.bmi,
    bodyFatRate: data.bodyFatRate ?? undefined,
    preferredFoodCategories: data.preferredFoodCategories ?? [],
    excludedFoodCategories: data.excludedFoodCategories ?? [],
    allergyFoodCategories: data.allergyFoodCategories ?? [],
  };
}

// 내 정보(신체 정보·음식 취향)를 서버에 바로 저장합니다.
export async function updateMyProfile(profile: UserProfile): Promise<UserProfile> {
  const data = await apiFetch<ApiUserProfile>(getApiUrl(API_ENDPOINTS.USER_PROFILE_ME), {
    method: "PUT",
    body: {
      height: profile.height,
      weight: profile.weight,
      age: profile.age,
      gender: profile.gender === "female" ? "FEMALE" : "MALE",
      bodyFatRate: profile.bodyFatRate ?? null,
      preferredFoodCategories: profile.preferredFoodCategories ?? [],
      excludedFoodCategories: profile.excludedFoodCategories ?? [],
      allergyFoodCategories: profile.allergyFoodCategories ?? [],
    },
    networkErrorMessage: "내 정보를 저장하지 못했어요. 잠시 후 다시 시도해 주세요.",
    httpErrorMessage: "내 정보를 저장하지 못했어요. 잠시 후 다시 시도해 주세요.",
  });
  return toUserProfile(data);
}

export async function login() {
  try {
    const { authorizationCode, referrer } = await appLogin();
    console.log("[Auth] 앱인토스 로그인");
    return await tossLogin(authorizationCode, referrer);
  } catch (error) {
    console.warn("[Auth] appLogin 실패", error);
    if (import.meta.env.DEV) {
      console.log("[Auth] dev 로그인");
      return await devLogin();
    }
    throw new Error("앱인토스 환경에서만 로그인 가능합니다.");
  }
}
