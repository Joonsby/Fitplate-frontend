// 전체화면 광고 로드/표시 로직을 담당하는 커스텀 훅
import { useState, useEffect, useCallback } from "react";
import { loadFullScreenAd, showFullScreenAd } from "@apps-in-toss/web-framework";
import { FULL_SCREEN_AD_GROUP_ID } from "./tossAdConfig";

export function useFullScreenAd() {
  const [isAdLoaded, setIsAdLoaded] = useState(false);

  const loadAd = useCallback(() => {
    return loadFullScreenAd({
      options: { adGroupId: FULL_SCREEN_AD_GROUP_ID },
      onEvent: (event) => {
        if (event.type === "loaded") {
          setIsAdLoaded(true);
        }
      },
      onError: (error) => {
        console.error("광고 로드 실패:", error);
      },
    });
  }, []);

  useEffect(() => {
    let supported = false;
    try {
      supported = loadFullScreenAd.isSupported();
    } catch {
      // 앱인토스 환경이 아닌 경우 isSupported() 자체가 실패할 수 있음
    }

    if (!supported) {
      console.log("광고 미지원 환경입니다.");
      return;
    }

    const unregister = loadAd();
    return () => unregister?.();
  }, [loadAd]);

  const showAd = useCallback(
    (onComplete?: (wasWatched: boolean) => void) => {
      if (!isAdLoaded) {
        onComplete?.(false);
        return;
      }

      showFullScreenAd({
        options: { adGroupId: FULL_SCREEN_AD_GROUP_ID },
        onEvent: (event) => {
          if (event.type === "dismissed") {
            setIsAdLoaded(false);
            loadAd();
            onComplete?.(true);
          }
          if (event.type === "failedToShow") {
            console.error("광고 표시 실패");
            setIsAdLoaded(false);
            loadAd();
            onComplete?.(false);
          }
        },
        onError: (error) => {
          console.error("광고 표시 오류:", error);
          setIsAdLoaded(false);
          loadAd();
          onComplete?.(false);
        },
      });
    },
    [isAdLoaded, loadAd]
  );

  return { isAdLoaded, showAd };
}
