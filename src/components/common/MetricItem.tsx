// BMR, TDEE처럼 계산 과정의 중간값을 보여주는 작은 컴포넌트입니다.
export interface MetricItemProps {
  label: string;
  value: number;
  unit: string;
}

export function MetricItem({ label, value, unit }: MetricItemProps) {
  return (
    <div className="metricItem">
      <span>{label}</span>
      <strong>
        {value.toLocaleString()} {unit}
      </strong>
    </div>
  );
}
