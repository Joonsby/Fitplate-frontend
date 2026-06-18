import { Post } from "@toss/tds-mobile";
import type { ReactNode } from "react";

interface ScreenSectionHeaderProps {
  step: string;
  title: string;
  description: string;
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
    <div className={`sectionHeader ${className}`.trim()}>
      <Post.H3 color="#3182f6" typography="t7">
        {step}
      </Post.H3>
      <Post.H3>{title}</Post.H3>
      <Post.Paragraph color="#4a5568" typography="t7">
        {description}
      </Post.Paragraph>
      {children}
    </div>
  );
}
