// 쿠팡 파트너스 대가성 고지 문구입니다. 쿠팡 구매 버튼이 있는 목록에는 반드시 함께 보여줍니다.
import "./CoupangDisclosure.css";

export const COUPANG_DISCLOSURE =
  "이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.";

export function CoupangDisclosure() {
  return (
    <p className="coupangDisclosure" role="note">
      {COUPANG_DISCLOSURE}
    </p>
  );
}
