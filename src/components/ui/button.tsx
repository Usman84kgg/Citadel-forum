"use client";

import { forwardRef } from "react";
import { clsx } from "clsx";

// ==========================================================
// CITADEL — Button
//
// Варианты:
//   primary  — золотая заливка (основное действие)
//   secondary — тёмная с золотой рамкой
//   ghost    — прозрачная, без рамки
//   danger   — красная (удаление, отмена)
//
// Размеры: sm, md, lg
// ==========================================================

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: [
    "bg-gold-500 text-black font-semibold",
    "hover:bg-gold-400",
    "active:bg-gold-600 active:scale-[0.97]",
    "shadow-gold",
  ].join(" "),
  secondary: [
    "bg-transparent text-gold-300 border border-line-gold",
    "hover:bg-gold-500/10 hover:border-gold-400 hover:text-gold-200",
    "active:bg-gold-500/15 active:scale-[0.97]",
  ].join(" "),
  ghost: [
    "bg-transparent text-ink-secondary border border-transparent",
    "hover:bg-surface-2 hover:text-ink",
    "active:bg-surface-3 active:scale-[0.97]",
  ].join(" "),
  danger: [
    "bg-danger text-white font-medium",
    "hover:bg-danger/90",
    "active:bg-danger/80 active:scale-[0.97]",
  ].join(" "),
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs rounded-control gap-1.5",
  md: "h-10 px-5 text-sm rounded-control gap-2",
  lg: "h-12 px-7 text-base rounded-panel gap-2.5",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      leftIcon,
      rightIcon,
      disabled,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={clsx(
          "inline-flex items-center justify-center font-ui",
          "transition-all duration-200",
          "focus-visible:outline-2 focus-visible:outline-gold-400 focus-visible:outline-offset-2",
          "select-none",
          variantStyles[variant],
          sizeStyles[size],
          isDisabled && "opacity-50 pointer-events-none",
          className,
        )}
        {...props}
      >
        {loading ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
        ) : (
          leftIcon
        )}
        {children}
        {!loading && rightIcon}
      </button>
    );
  },
);

Button.displayName = "Button";

export { Button };
export type { ButtonProps, ButtonVariant, ButtonSize };