// 토스트 상태를 관리하는 공통 커스텀 훅
import { useState } from "react";
import { Toast } from "@toss/tds-mobile";
import failedIconLottie from "../assets/images/x-red-spot.json";

type ToastType = "success" | "error" | "info";

export function useToast() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [type, setType] = useState<ToastType>("info");

  const showToast = (message: string, toastType: ToastType = "info") => {
    setText(message);
    setType(toastType);
    setOpen(true);
  };

  const toastElement = (
    <Toast
      position="top"
      open={open}
      text={text}
      leftAddon={
        type === "success"
          ? <Toast.Lottie src="https://static.toss.im/lotties-common/check-green-spot.json" />
          : type === "error"
          ? <Toast.Lottie src={failedIconLottie} />
          : undefined
      }
      duration={3000}
      onClose={() => setOpen(false)}
    />
  );

  return { showToast, toastElement };
}
