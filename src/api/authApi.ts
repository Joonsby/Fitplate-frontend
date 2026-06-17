import { appLogin } from "@apps-in-toss/web-framework";
import { API_ENDPOINTS, getApiUrl } from "./apiConfig";
import { getAccessToken } from "./authToken";
import type { UserProfile } from "../types/fitplate";

async function tossLogin(
    authorizationCode: string,
    referrer: string
) {
    const response = await fetch(getApiUrl(API_ENDPOINTS.AUTH_TOSS_LOGIN), {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            authorizationCode,
            referrer
        })
    });

    if (!response.ok) {
        throw new Error(`Toss 로그인 실패: ${response.status}`);
    }

    return response.json();
}

async function devLogin() {
    const response = await fetch(getApiUrl(API_ENDPOINTS.AUTH_DEV_LOGIN), {
        method: "POST"
    });

    if (!response.ok) {
        throw new Error(`개발자 로그인 실패: ${response.status}`);
    }

    return response.json();
}

export async function getMyUserProfile(): Promise<UserProfile | null> {
  const accessToken = getAccessToken();
  const response = await fetch(getApiUrl(API_ENDPOINTS.USER_PROFILE_ME), {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
    },
  });

  if (response.status === 204) {
    return null;
  }

  if (!response.ok) {
    console.error("[UserProfile] 조회 실패:", response.status);
    return null;
  }

  const data = await response.json();
  return {
    height: data.height,
    weight: data.weight,
    age: data.age,
    gender: data.gender === "FEMALE" ? "female" : "male",
    bodyFatPercentage: data.bodyFatPercentage,
  };
}

export async function login() {
    try {
        const { authorizationCode, referrer } = await appLogin();
        console.log("[Auth] 앱인토스 로그인");
        return await tossLogin(authorizationCode, referrer);
    } catch (error) {
        console.warn("[Auth] appLogin 실패", error);        
        if(import.meta.env.DEV){
            console.log("[Auth] dev 로그인");
            return await devLogin();
        }
        throw new Error("앱인토스 환경에서만 로그인 가능합니다.");
    }
}