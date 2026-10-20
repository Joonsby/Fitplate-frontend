// 접시 모양 로고 둘레를 도는 로딩 표시입니다.
import "./Spinner.css";

interface SpinnerProps {
  size?: number;
  label?: string;
}

export function Spinner({ size = 56, label }: SpinnerProps) {
  return (
    <div className="fpSpinner" role="status">
      <svg
        className="fpSpinnerGraphic"
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="fpSpinnerGradient" x1="4" y1="44" x2="44" y2="4">
            <stop offset="0" stopColor="#17388f" />
            <stop offset="1" stopColor="#3fa3ea" />
          </linearGradient>
        </defs>
        <circle cx="24" cy="24" r="20" stroke="#dfe5ee" strokeWidth="4" />
        <circle
          className="fpSpinnerArc"
          cx="24"
          cy="24"
          r="20"
          stroke="url(#fpSpinnerGradient)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray="40 126"
        />
        <circle cx="24" cy="24" r="9" fill="#2f7fe0" opacity="0.16" />
      </svg>
      {label ? <span className="fpSpinnerLabel">{label}</span> : null}
    </div>
  );
}
