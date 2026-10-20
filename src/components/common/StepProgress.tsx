// 온보딩 단계 위치를 「1 / 2 단계」와 막대로 보여줍니다.
import "./StepProgress.css";

interface StepProgressProps {
  current: number;
  total: number;
}

export function StepProgress({ current, total }: StepProgressProps) {
  return (
    <div className="stepProgress">
      <span className="stepProgressLabel">
        <strong>{current}</strong> / {total} 단계
      </span>
      <span
        className="stepProgressBar"
        style={{ gridTemplateColumns: `repeat(${total}, 1fr)` }}
        aria-hidden="true"
      >
        {Array.from({ length: total }, (_, i) => (
          <span key={i} className={i < current ? "isDone" : undefined} />
        ))}
      </span>
    </div>
  );
}
