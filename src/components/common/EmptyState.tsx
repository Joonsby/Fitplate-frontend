// 리스트가 비어있을 때 보여주는 안내 컴포넌트입니다.
import "./EmptyState.css";
import type { ReactNode } from "react";

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  children?: ReactNode;
}

export function EmptyState({ icon, title, description, children }: EmptyStateProps) {
  return (
    <div className="emptyState">
      {icon ? (
        <span className="emptyStateIcon" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <strong>{title}</strong>
      <p>{description}</p>
      {children ? <div className="emptyStateAction">{children}</div> : null}
    </div>
  );
}
