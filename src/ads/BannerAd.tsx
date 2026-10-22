// 토스 배너 광고 한 칸입니다. 광고를 지원하지 않거나, 보여줄 광고가 없거나, 실패하면 빈 칸을 남기지 않고 숨깁니다.
import "./BannerAd.css";
import { useEffect, useRef, useState } from "react";
import { TossAds } from "@apps-in-toss/web-framework";
import { useTossAdsReady } from "./useTossAdsReady";

interface BannerAdProps {
  adGroupId: string;
}

export function BannerAd({ adGroupId }: BannerAdProps) {
  const ready = useTossAdsReady();
  const slotRef = useRef<HTMLDivElement>(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const slot = slotRef.current;
    if (!ready || !slot || !adGroupId) return;
    let supported = false;
    try {
      supported = TossAds.attachBanner.isSupported();
    } catch {
      // 지원 여부 확인이 실패하면 광고를 붙이지 않는다
    }
    if (!supported) {
      setHidden(true);
      return;
    }

    setHidden(false);
    const banner = TossAds.attachBanner(adGroupId, slot, {
      theme: "auto",
      tone: "blackAndWhite",
      variant: "expanded",
      callbacks: {
        onNoFill: () => setHidden(true),
        onAdFailedToRender: ({ error }) => {
          console.error("배너 광고 표시 실패:", error.message);
          setHidden(true);
        },
      },
    });
    return () => banner.destroy();
  }, [ready, adGroupId]);

  if (!ready || hidden) return null;

  // 광고 SDK 가 이 칸 안을 직접 채운다. 다른 요소를 넣지 않는다
  return <div ref={slotRef} className="bannerAdSlot" aria-label="광고" />;
}
