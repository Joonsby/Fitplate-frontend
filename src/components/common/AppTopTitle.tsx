// 앱 상단 막대 — 탭 화면에서는 브랜드를, 흐름 화면에서는 뒤로 가기와 제목을 보여줍니다.
import "./AppTopTitle.css";
import { ChevronLeftIcon } from "./Icons";
import { BrandLogo } from "./BrandLogo";

interface AppTopTitleProps {
  title?: string;
  onBack?: () => void;
}

export function AppTopTitle({ title, onBack }: AppTopTitleProps) {
  if (onBack) {
    return (
      <header className="homeTopBar">
        <button type="button" className="topBackButton" onClick={onBack} aria-label="뒤로 가기">
          <ChevronLeftIcon />
        </button>
        {title ? <span className="topBarTitle">{title}</span> : null}
      </header>
    );
  }

  return (
    <header className="homeTopBar">
      <BrandLogo />
    </header>
  );
}
