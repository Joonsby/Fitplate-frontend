// 화면 맨 위의 작은 안내 문구, 제목, 설명을 같은 모양으로 보여줍니다.
import "./ScreenSectionHeader.css";
import type { ReactNode } from "react";

interface ScreenSectionHeaderProps {
  step?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  className?: string;
  children?: ReactNode;
}

export function ScreenSectionHeader({
  step,
  title,
  description,
  className = "",
  children,
}: ScreenSectionHeaderProps) {
  return (
    <header className={`sectionHeader ${className}`.trim()}>
      {step ? <div className="sectionHeaderStep">{step}</div> : null}
      <h1>{title}</h1>
      {description ? <p>{description}</p> : null}
      {children}
    </header>
  );
}
