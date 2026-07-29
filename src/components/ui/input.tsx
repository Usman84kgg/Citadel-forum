"use client";

import { forwardRef } from "react";
import { clsx } from "clsx";

// ==========================================================
// CITADEL — Input
//
// Поле ввода текста с золотой подсветкой при фокусе.
// ==========================================================

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  error?: string;
  label?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ leftIcon, rightIcon, error, label, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="w-full">
        {label ? (
          <label
            htmlFor={inputId}
            className="mb-1.5 block text-xs font-medium text-ink-secondary"
          >
            {label}
          </label>
        ) : null}

        <div className="relative">
          {leftIcon ? (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted">
              {leftIcon}
            </span>
          ) : null}

          <input
            ref={ref}
            id={inputId}
            className={clsx(
              "w-full h-10 rounded-control bg-surface border text-sm text-ink",
              "placeholder:text-ink-faint",
              "transition-colors duration-200",
              "focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400/30",
              error
                ? "border-danger focus:border-danger focus:ring-danger/30"
                : "border-line-subtle",
              leftIcon ? "pl-10" : "pl-3",
              rightIcon ? "pr-10" : "pr-3",
              className,
            )}
            {...props}
          />

          {rightIcon ? (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted">
              {rightIcon}
            </span>
          ) : null}
        </div>

        {error ? (
          <p className="mt-1 text-xs text-danger">{error}</p>
        ) : null}
      </div>
    );
  },
);

Input.displayName = "Input";

export { Input };