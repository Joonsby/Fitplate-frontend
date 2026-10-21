// 화면 곳곳에서 쓰는 선 아이콘 모음입니다.
import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function Line({ children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export const ArrowRightIcon = (p: IconProps) => (
  <Line strokeWidth="2" {...p}>
    <path d="M5 12h14m-6-6 6 6-6 6" />
  </Line>
);

export const ChevronLeftIcon = (p: IconProps) => (
  <Line strokeWidth="2" {...p}>
    <path d="m15 5-7 7 7 7" />
  </Line>
);

export const ChevronRightIcon = (p: IconProps) => (
  <Line strokeWidth="2" {...p}>
    <path d="m9 5 7 7-7 7" />
  </Line>
);

export const PlateIcon = (p: IconProps) => (
  <Line {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <circle cx="12" cy="12" r="4.5" />
  </Line>
);

export const BookmarkIcon = (p: IconProps) => (
  <Line {...p}>
    <path d="M6 3h12v18l-6-4-6 4V3Z" />
  </Line>
);

export const StarIcon = (p: IconProps) => (
  <Line {...p}>
    <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z" />
  </Line>
);

export const UserIcon = (p: IconProps) => (
  <Line {...p}>
    <path d="M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM5 21v-2a7 7 0 0 1 14 0v2" />
  </Line>
);

export const CartIcon = (p: IconProps) => (
  <Line {...p}>
    <path d="M3 4h2l2.2 11h10.6L20 7H6.2" />
    <circle cx="9" cy="19.5" r="1.3" />
    <circle cx="17" cy="19.5" r="1.3" />
  </Line>
);

export const SparkleIcon = (p: IconProps) => (
  <Line {...p}>
    <path d="M12 3c.6 4.2 2.8 6.4 7 7-4.2.6-6.4 2.8-7 7-.6-4.2-2.8-6.4-7-7 4.2-.6 6.4-2.8 7-7Z" />
    <path d="M19 15.5c.2 1.6 1 2.3 2.5 2.5-1.5.2-2.3 1-2.5 2.5-.2-1.5-1-2.3-2.5-2.5 1.5-.2 2.3-.9 2.5-2.5Z" />
  </Line>
);

export const CheckIcon = (p: IconProps) => (
  <Line strokeWidth="2.4" {...p}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </Line>
);

export const AlertIcon = (p: IconProps) => (
  <Line strokeWidth="2.2" {...p}>
    <path d="M12 7v6m0 4h.01" />
  </Line>
);

export const TrendIcon = ({
  direction,
  ...p
}: IconProps & { direction: "down" | "flat" | "up" }) => (
  <Line strokeWidth="2" {...p}>
    {direction === "down" ? <path d="M4 7l6 6 4-4 6 6m0 0v-5m0 5h-5" /> : null}
    {direction === "flat" ? <path d="M4 12h16m-5-5 5 5-5 5" /> : null}
    {direction === "up" ? <path d="M4 17l6-6 4 4 6-6m0 0v5m0-5h-5" /> : null}
  </Line>
);

export const SwapIcon = (p: IconProps) => (
  <Line strokeWidth="2" {...p}>
    <path d="M4 8h14m0 0-3.5-3.5M18 8l-3.5 3.5M20 16H6m0 0 3.5-3.5M6 16l3.5 3.5" />
  </Line>
);

export const RefreshIcon = (p: IconProps) => (
  <Line strokeWidth="2" {...p}>
    <path d="M20 11a8 8 0 0 0-14.3-4.9L4 8m0-4v4h4M4 13a8 8 0 0 0 14.3 4.9L20 16m0 4v-4h-4" />
  </Line>
);

export const PencilIcon = (p: IconProps) => (
  <Line strokeWidth="2" {...p}>
    <path d="M14.5 5.5 18.5 9.5M5 19l1-4L15.8 5.2a1.8 1.8 0 0 1 2.6 0l.4.4a1.8 1.8 0 0 1 0 2.6L9 18l-4 1Z" />
  </Line>
);

export const CalendarCheckIcon = (p: IconProps) => (
  <Line {...p}>
    <rect x="3.5" y="5" width="17" height="15.5" rx="3" />
    <path d="M8 3v4m8-4v4M3.5 10h17m-11.5 4.5 2 2 4-4" />
  </Line>
);
