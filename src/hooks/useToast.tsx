// 토스트 상태를 관리하는 공통 커스텀 훅
import "./useToast.css";
import { useEffect, useRef, useState } from "react";
import { AlertIcon, CheckIcon } from "../components/common/Icons";

type ToastType = "success" | "error" | "info";

const TOAST_DURATION_MS = 3000;

export function useToast() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [type, setType] = useState<ToastType>("info");
  const timerRef = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timerRef.current != null) window.clearTimeout(timerRef.current);
    },
    [],
  );

  const showToast = (message: string, toastType: ToastType = "info") => {
    setText(message);
    setType(toastType);
    setOpen(true);
    if (timerRef.current != null) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setOpen(false), TOAST_DURATION_MS);
  };

  const toastElement = (
    <div
      className={`fpToast fpToast--${type}${open ? " isOpen" : ""}`}
      role="status"
      aria-live="polite"
    >
      {type !== "info" ? (
        <span className="fpToastIcon">
          {type === "success" ? <CheckIcon /> : <AlertIcon />}
        </span>
      ) : null}
      <span>{text}</span>
    </div>
  );

  return { showToast, toastElement };
}
