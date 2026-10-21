// 토스트 상태를 관리하는 공통 커스텀 훅
import "./useToast.css";
import { useEffect, useRef, useState } from "react";
import { AlertIcon, CheckIcon } from "../components/common/Icons";

type ToastType = "success" | "error" | "info";

const TOAST_DURATION_MS = 3000;
// 버튼이 있는 토스트는 누를 시간을 더 준다
const ACTION_TOAST_DURATION_MS = 5000;

interface ToastAction {
  label: string;
  onClick: () => void;
}

export function useToast() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [type, setType] = useState<ToastType>("info");
  const [action, setAction] = useState<ToastAction | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timerRef.current != null) window.clearTimeout(timerRef.current);
    },
    [],
  );

  const showToast = (message: string, toastType: ToastType = "info", toastAction?: ToastAction) => {
    setText(message);
    setType(toastType);
    setAction(toastAction ?? null);
    setOpen(true);
    if (timerRef.current != null) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(
      () => setOpen(false),
      toastAction ? ACTION_TOAST_DURATION_MS : TOAST_DURATION_MS,
    );
  };

  const toastElement = (
    <div
      className={`fpToast fpToast--${type}${open ? " isOpen" : ""}${action ? " hasAction" : ""}`}
      role="status"
      aria-live="polite"
    >
      {type !== "info" ? (
        <span className="fpToastIcon">
          {type === "success" ? <CheckIcon /> : <AlertIcon />}
        </span>
      ) : null}
      <span>{text}</span>
      {action ? (
        <button
          type="button"
          className="fpToastAction"
          tabIndex={open ? 0 : -1}
          onClick={() => {
            setOpen(false);
            action.onClick();
          }}
        >
          {action.label}
        </button>
      ) : null}
    </div>
  );

  return { showToast, toastElement };
}
