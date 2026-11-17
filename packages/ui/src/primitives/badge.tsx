import type { ReactNode } from "react";
import { cn } from "../lib/cn";

type Tone = "neutral" | "sale" | "success" | "warning";

const tones: Record<Tone, string> = {
  neutral: "bg-subtle text-ink",
  sale: "bg-danger text-white",
  success: "bg-success text-white",
  warning: "bg-warning text-white",
};

export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-semibold tracking-wide uppercase",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
