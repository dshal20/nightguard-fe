import { cn } from "@/lib/utils";
import type { IncidentSeverity, IncidentStatus } from "@/lib/api";

export type ColorTagVariant = "blue" | "amber" | "red" | "green" | "default";

const variants: Record<ColorTagVariant, string> = {
  blue:    "border-[#2B36CD] bg-[#2B36CD]/10 text-[#5B6AFF]",
  amber:   "border-amber-400/50 bg-amber-400/10 text-amber-400",
  red:     "border-[#EB4869]/50 bg-[#EB4869]/10 text-[#E84868]",
  green:   "border-green-400/50 bg-green-400/10 text-green-400",
  default: "border-white/10 bg-white/5 text-[#8B8B9D]",
};

export const severityVariant: Record<IncidentSeverity, ColorTagVariant> = {
  LOW:    "blue",
  MEDIUM: "amber",
  HIGH:   "red",
};

export const statusVariant: Record<IncidentStatus, ColorTagVariant> = {
  ACTIVE:    "amber",
  COMPLETED: "green",
};

export function ColorTag({
  variant = "default",
  children,
  className,
}: {
  variant?: ColorTagVariant;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold leading-4.5",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
