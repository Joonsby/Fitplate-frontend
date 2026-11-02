// 앱인토스 콘솔(분석 > 이벤트, 핵심 지표)에 남기는 이벤트 로그입니다. 콘솔 지표가 이름으로 묶이므로 이름은 여기서만 정합니다.
import { Analytics } from "@apps-in-toss/web-framework";

export type AppEventName =
  | "intro_view"
  | "login_start"
  | "login_complete"
  | "login_fail"
  | "login_fallback"
  | "onboarding_profile_complete"
  | "meal_generation_start"
  | "meal_generation_complete"
  | "meal_generation_fail"
  | "fullscreen_ad_show"
  | "meal_intake_check";

// 결과를 기다리지 않는다. 로그가 실패해도 화면 흐름은 그대로 간다
export function logEvent(name: AppEventName, params: Record<string, string | number | boolean> = {}) {
  try {
    Analytics.log({ log_name: name, log_type: "event", params }).catch(() => undefined);
  } catch {
    // 앱인토스 밖(일반 브라우저)에서는 호출 자체가 실패할 수 있다
  }
}
