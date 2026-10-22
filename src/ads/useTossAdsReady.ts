// 배너 광고 SDK(TossAds)를 앱 전체에서 한 번만 초기화하고, 끝났는지 알려주는 훅입니다.
import { useEffect, useState } from "react";
import { TossAds } from "@apps-in-toss/web-framework";

type InitState = "idle" | "pending" | "ready" | "failed";

let state: InitState = "idle";
const listeners = new Set<(ready: boolean) => void>();

function settle(next: InitState) {
  state = next;
  listeners.forEach((listener) => listener(next === "ready"));
}

function ensureInitialized() {
  if (state !== "idle") return;
  let supported = false;
  try {
    supported = TossAds.initialize.isSupported();
  } catch {
    // 앱인토스 밖(일반 브라우저)에서는 확인 자체가 실패할 수 있다
  }
  if (!supported) {
    state = "failed";
    return;
  }
  state = "pending";
  TossAds.initialize({
    callbacks: {
      onInitialized: () => settle("ready"),
      onInitializationFailed: (error) => {
        console.error("배너 광고 초기화 실패:", error);
        settle("failed");
      },
    },
  });
}

export function useTossAdsReady(): boolean {
  const [ready, setReady] = useState(state === "ready");

  useEffect(() => {
    ensureInitialized();
    setReady(state === "ready");
    listeners.add(setReady);
    return () => {
      listeners.delete(setReady);
    };
  }, []);

  return ready;
}
