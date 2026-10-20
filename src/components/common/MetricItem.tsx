// BMR, TDEE처럼 계산 과정의 중간값을 보여주는 작은 컴포넌트입니다.
import "./MetricItem.css";
export interface MetricItemProps {
  label: string;
  abbr?: string;
  value: number;
  unit: string;
}

export function MetricItem({ label, abbr, value, unit }: MetricItemProps) {
  return (
    <div className="metricItem">
      <span>
        {label}
        {abbr ? <em> {abbr}</em> : null}
      </span>
      <strong>
        {value.toLocaleString()} {unit}
      </strong>
    </div>
  );
}
