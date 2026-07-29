import { clsx } from "clsx";

type BadgeVariant = "success" | "warning" | "danger" | "info" | "gold" | "muted";
type BadgeSize = "sm" | "md";

interface BadgeProps { variant?: BadgeVariant; size?: BadgeSize; children: React.ReactNode; className?: string; }

const variantStyles: Record<BadgeVariant, string> = {
  success: "text-success bg-success-bg", warning: "text-warning bg-warning-bg",
  danger: "text-danger bg-danger-bg", info: "text-info bg-info-bg",
  gold: "text-gold-400 bg-gold-500/15", muted: "text-ink-muted bg-surface-2",
};

const sizeStyles: Record<BadgeSize, string> = { sm: "px-2 py-0.5 text-2xs", md: "px-3 py-1 text-xs" };

export function Badge({ variant = "muted", size = "sm", className, children }: BadgeProps) {
  return (
    <span className={clsx("inline-flex items-center font-ui font-medium rounded-full", variantStyles[variant], sizeStyles[size], className)}>
      {children}
    </span>
  );
}