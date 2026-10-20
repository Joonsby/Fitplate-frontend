// 앱 전역에서 쓰는 기본 버튼 컴포넌트입니다.
import "./Button.css";
import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "large" | "medium" | "small";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "primary",
    size = "large",
    block = false,
    className = "",
    type = "button",
    ...rest
  },
  ref,
) {
  const classes = [
    "fpButton",
    `fpButton--${variant}`,
    `fpButton--${size}`,
    block ? "fpButton--block" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <button ref={ref} type={type} className={classes} {...rest} />;
});
