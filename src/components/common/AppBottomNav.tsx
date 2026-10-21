// 주요 메뉴 다섯 개를 하단 탭으로 표시합니다.
import "./AppBottomNav.css";
import type { ReactNode } from "react";
import { BookmarkIcon, CalendarCheckIcon, PlateIcon, StarIcon, UserIcon } from "./Icons";

export type BottomNavTab = "create" | "records" | "saved" | "favorites" | "profile";

interface AppBottomNavProps {
  activeTab: BottomNavTab | null;
  onTabClick: (tab: BottomNavTab) => void;
}

const TABS: { tab: BottomNavTab; label: string; icon: ReactNode }[] = [
  { tab: "create", label: "식단 만들기", icon: <PlateIcon /> },
  { tab: "records", label: "기록", icon: <CalendarCheckIcon /> },
  { tab: "saved", label: "저장 식단", icon: <BookmarkIcon /> },
  { tab: "favorites", label: "즐겨찾기", icon: <StarIcon /> },
  { tab: "profile", label: "내 정보", icon: <UserIcon /> },
];

export function AppBottomNav({ activeTab, onTabClick }: AppBottomNavProps) {
  return (
    <footer className="appBottomBar">
      <nav className="appBottomNav" aria-label="주요 메뉴">
        {TABS.map(({ tab, label, icon }) => {
          const selected = activeTab === tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => onTabClick(tab)}
              className={selected ? "isActive" : undefined}
              aria-current={selected ? "page" : undefined}
            >
              {icon}
              <span>{label}</span>
            </button>
          );
        })}
      </nav>
    </footer>
  );
}
