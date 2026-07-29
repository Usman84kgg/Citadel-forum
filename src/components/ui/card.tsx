import { clsx } from "clsx";

type CardVariant = "default" | "gold" | "interactive";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: "none" | "sm" | "md" | "lg";
}

const variantStyles: Record<CardVariant, string> = {
  default: "border-line-subtle shadow-card",
  gold: "border-line-gold shadow-gold",
  interactive: "border-line-subtle shadow-card hover:border-line-strong hover:shadow-gold cursor-pointer",
};

const paddingStyles: Record<NonNullable<CardProps["padding"]>, string> = {
  none: "p-0",
  sm: "p-3",
  md: "p-5",
  lg: "p-7",
};

export function Card({ variant = "default", padding = "md", className, children, ...props }: CardProps) {
  return (
    <div
      className={clsx("citadel-card bg-surface border transition-all duration-200", variantStyles[variant], paddingStyles[padding], className)}
      {...props}
    >
      {children}
    </div>
  );
}