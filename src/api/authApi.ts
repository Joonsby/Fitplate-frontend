import { appLogin, TossAuth, User } from "@apps-in-toss/web-framework";
import { API_ENDPOINTS, getApiUrl } from "./apiConfig";
import { getAccessToken } from "./authToken";
import type { FoodCategory, UserProfile } from "../types/fitplate";
import { apiFetch, apiFetchRaw } from "./httpClient";
import { logEvent } from "../analytics/logEvent";

// 로그인 화면 없이 사용자 식별키로 들어옵니다. 예전에 토스 로그인을 쓴 사용자는 기존 계정을 찾도록 토스 인가 코드도 함께 보냅니다.
async function anonymousLogin() {
  // 이미 동의한 사용자라 동의 화면 없이 인가 코드만 돌아온다
  const linkLogin = (await TossAuth.isIntegrated()) ? await appLogin() : null;
  const { code } = await User.createAnonymousKeyAuthCode();
  return apiFetch<{ accessToken: string }>(getApiUrl(API_ENDPOINTS.AUTH_ANONYMOUS_LOGIN), {
    method: "POST",
    body: { code, authorizationCode: linkLogin?.authorizationCode, referrer: linkLogin?.referrer },
    withAuth: false,
    httpErrorMessage: "로그인에 실패했습니다.",
  });
}

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
    const result = await anonymousLogin();
    console.log("[Auth] 사용자 식별키 로그인");
    return result;
  } catch (error) {
    // 오래된 토스 앱처럼 식별키로 들어오지 못하면 예전처럼 토스 로그인으로 들어온다
    console.warn("[Auth] 사용자 식별키 로그인 실패", error);
    logEvent("login_fallback");
  }

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
