import { useEffect, useState } from "react";
import { loadFullScreenAd, showFullScreenAd } from "@apps-in-toss/web-framework";
import { FULL_SCREEN_AD_GROUP_ID } from "./tossAdConfig";

function canLoadFullScreenAd() {
  try {
    return loadFullScreenAd.isSupported();
  } catch {
    return false;
  }
}

function canShowFullScreenAd() {
  try {
    return showFullScreenAd.isSupported();
  } catch {
    return false;
  }
}

export function useFullScreenAd() {
  const [isAdLoaded, setIsAdLoaded] = useState(false);

  useEffect(() => {
    if (!canLoadFullScreenAd()) {
      return;
    }

    const unregister = loadFullScreenAd({
      options: {
        adGroupId: FULL_SCREEN_AD_GROUP_ID,
      },
      onEvent: (event) => {
        if (event.type === "loaded") {
          setIsAdLoaded(true);
        }
      },
      onError: (error) => {
        console.error("광고 로드 실패:", error);
      },
    });

    return () => {
      unregister();
    };
  }, []);

  const showAd = (onComplete: () => void) => {
    if (!canShowFullScreenAd() || !isAdLoaded) {
      onComplete();
      return;
    }

    showFullScreenAd({
      options: {
        adGroupId: FULL_SCREEN_AD_GROUP_ID,
      },
      onEvent: (event) => {
        if (event.type === "dismissed" || event.type === "failedToShow") {
          setIsAdLoaded(false);
          onComplete();
        }
      },
      onError: (error) => {
        console.error("광고 표시 실패:", error);
        onComplete();
      },
    });
  };

  return {
    isAdLoaded,
    showAd,
  };
}