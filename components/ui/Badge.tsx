import { cn } from "@/lib/cn";

type Tone = "neutral" | "success" | "warning" | "danger" | "accent";

const tones: Record<Tone, string> = {
  neutral: "bg-mist-200 text-slate-600",
  success: "bg-green-600/10 text-green-600",
  warning: "bg-amber-500/15 text-amber-600",
  danger: "bg-red-600/10 text-red-600",
  accent: "bg-amber-500 text-ink-950 shadow-sm shadow-amber-500/30",
};

const dotColors: Record<Tone, string> = {
  neutral: "bg-slate-500",
  success: "bg-green-600",
  warning: "bg-amber-500",
  danger: "bg-red-600",
  accent: "bg-ink-950",
};

export function Badge({
  tone = "neutral",
  dot = false,
  className,
  children,
}: {
  tone?: Tone;
  /** Small colored dot before the label — reinforces meaning beyond color alone. */
  dot?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        tones[tone],
        className,
      )}
    >
      {dot ? <span className={cn("size-1.5 shrink-0 rounded-full", dotColors[tone])} /> : null}
      {children}
    </span>
  );
}
