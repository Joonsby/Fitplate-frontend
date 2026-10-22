// 탭 화면 상단의 브랜드 막대입니다. 뒤로 가기는 토스 내비게이션 바가 맡습니다.
import "./AppTopTitle.css";
import { BrandLogo } from "./BrandLogo";

export function AppTopTitle() {
  return (
    <header className="homeTopBar">
      <BrandLogo />
    </header>
  );
}
