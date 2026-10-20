// FitPlate 로고 — 접시 테두리와 잎사귀 마크, 두 색 워드마크입니다.
import "./BrandLogo.css";
import { useId } from "react";

export function BrandMark({ size = 28 }: { size?: number }) {
  const gradientId = useId();
  return (
    <svg
      className="brandMark"
      width={size}
      height={size}
      viewBox="0 0 28 28"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradientId} x1="3" y1="25" x2="23" y2="5">
          <stop offset="0" stopColor="#17388f" />
          <stop offset="1" stopColor="#3fa3ea" />
        </linearGradient>
      </defs>
      <path
        d="M20.4 8.6A10 10 0 1 0 22.6 12.4"
        stroke={`url(#${gradientId})`}
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <circle cx="13" cy="15" r="5.8" stroke="#2f7fe0" strokeWidth="1.3" opacity="0.45" />
      <path d="M20.6 9.2C20.2 5.6 22.4 3 26.2 2.4 26.6 6.2 24.3 8.9 20.6 9.2Z" fill="#3fa3ea" />
    </svg>
  );
}

interface BrandLogoProps {
  size?: "small" | "large";
  tagline?: boolean;
}

export function BrandLogo({ size = "small", tagline = false }: BrandLogoProps) {
  return (
    <div className={`brandLogo brandLogo--${size}`}>
      <div className="brandLogoRow">
        <BrandMark size={size === "large" ? 44 : 28} />
        <span className="brandWordmark" aria-label="FitPlate">
          Fit<span>Plate</span>
        </span>
      </div>
      {tagline ? <span className="brandTagline">AI가 짜주는 나만의 식단</span> : null}
    </div>
  );
}
