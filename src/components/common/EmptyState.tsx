// 리스트가 비어있을 때 보여주는 안내 컴포넌트입니다.
export interface EmptyStateProps {
  title: string;
  description: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="emptySavedList">
      <strong>{title}</strong>
      <p>{description}</p>
    </div>
  );
}
