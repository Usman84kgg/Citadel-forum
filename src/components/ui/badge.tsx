import { clsx } from "clsx";

type BadgeVariant = "success" | "warning" | "danger" | "info" | "gold" | "muted";
type BadgeEffect = "solid" | "neon" | "fire" | "outline";
type BadgeSize = "sm" | "md";

interface BadgeProps {
  variant?: BadgeVariant;
  effect?: BadgeEffect;
  size?: BadgeSize;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  success: "text-success bg-success-bg",
  warning: "text-warning bg-warning-bg",
  danger: "text-danger bg-danger-bg",
  info: "text-info bg-info-bg",
  gold: "text-gold-400 bg-gold-500/15",
  muted: "text-ink-muted bg-surface-2",
};

const effectStyles: Record<BadgeEffect, string> = {
  solid: "",
  neon: "shadow-[0_0_8px_var(--badge-glow)]",
  fire: "animate-pulse bg-gradient-to-r from-orange-500 via-red-500 to-yellow-500 text-white",
  outline: "bg-transparent border",
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: "px-2 py-0.5 text-2xs",
  md: "px-3 py-1 text-xs",
};

export function Badge({
  variant = "muted",
  effect = "solid",
  size = "sm",
  className,
  children,
}: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center font-ui font-medium rounded-full transition-all",
        variantStyles[variant],
        effectStyles[effect],
        sizeStyles[size],
        className,
      )}
    >
      {children}
    </span>
  );
}

export type { BadgeVariant, BadgeEffect, BadgeSize };