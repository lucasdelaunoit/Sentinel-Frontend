import { cn } from "@/lib/utils.ts";
import { TONE_BG, type Tone } from "@/lib/scoring.ts";

interface RedundancyBarProps {
  /** Qualified people currently available. */
  qualified: number;
  /** Qualified people needed for safe redundancy. */
  needed: number;
  tone: Tone;
  className?: string;
}

/** Segmented bar: filled cells = qualified people, empty cells = missing backups. */
export default function RedundancyBar({ qualified, needed, tone, className }: RedundancyBarProps) {
  const cells = Math.max(needed, qualified);
  return (
    <div className={cn("flex items-center gap-1", className)}>
      {Array.from({ length: cells }).map((_, i) => (
        <span
          key={i}
          className={cn(
            "h-1.5 flex-1 rounded-full",
            i < qualified ? TONE_BG[tone] : "bg-muted",
          )}
        />
      ))}
    </div>
  );
}
