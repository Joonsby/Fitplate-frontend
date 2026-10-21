// blocked 가 true 인 동안 토스 앱의 뒤로가기(하드웨어·제스처)를 막습니다.
import { useEffect } from "react";
import { graniteEvent } from "@apps-in-toss/web-framework";

export function useBlockBack(blocked: boolean) {
  useEffect(() => {
    if (!blocked) return;
    try {
      // 리스너를 등록하면 기본 뒤로가기 대신 이 콜백이 불린다. 아무것도 하지 않아 화면에 머문다
      return graniteEvent.addEventListener("backEvent", { onEvent: () => {} });
    } catch {
      // 앱인토스 밖(일반 브라우저)에서는 지원하지 않는다
      return undefined;
    }
  }, [blocked]);
}
