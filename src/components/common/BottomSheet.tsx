// 화면 아래에서 올라오는 공용 시트입니다. 배경을 누르거나 Esc 를 누르면 닫힙니다.
import "./BottomSheet.css";
import { useEffect, useId } from "react";
import type { ReactNode } from "react";

interface BottomSheetProps {
  title: string;
  description?: string;
  onClose: () => void;
  // 저장 중처럼 닫으면 안 될 때 true
  locked?: boolean;
  children: ReactNode;
}

export function BottomSheet({ title, description, onClose, locked = false, children }: BottomSheetProps) {
  const titleId = useId();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !locked) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [locked, onClose]);

  return (
    <div className="sheetBackdrop" onClick={locked ? undefined : onClose}>
      <div
        className="sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
      >
        <span className="sheetHandle" aria-hidden="true" />
        <h2 id={titleId}>{title}</h2>
        {description ? <p className="sheetDescription">{description}</p> : null}
        <div className="sheetBody">{children}</div>
      </div>
    </div>
  );
}
