import { ArrowsClockwiseIcon, CircleNotchIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils.ts";
import { Button } from "@/components/ui/button.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { SYNC_STATE_BG, SYNC_STATE_LABEL } from "@/lib/theme/syncStatus.ts";
import { TONE_BG, TONE_TEXT } from "@/lib/theme/tone.ts";
import { formatDateTime, formatRelative } from "@/utils/formatters/date.ts";

interface SyncStatusCardProps {
  status?: SyncStatus;
  /** Manual recalculation trigger — renders a refresh button, disabled while a run is pending. */
  onRecalculate?: () => void;
  /** True while the trigger request is in flight — disables and spins the button instantly. */
  isRecalculating?: boolean;
  empty?: string;
  className?: string;
}

/**
 * Quiet calculation sync indicator — a dot + one short line, sized for a TopBar
 * action slot. Exact timestamp / error live in the native tooltip.
 */
export default function SyncStatusCard({
  status,
  onRecalculate,
  isRecalculating = false,
  empty = "—",
  className,
}: SyncStatusCardProps) {
  if (!status) {
    return <span className={cn("text-xs text-muted-foreground", className)}>{empty}</span>;
  }

  const isRunning = status.state === "running";
  const neverCalculated = status.state === "idle" && !status.last_calculated_at;

  const text = neverCalculated
    ? "Not calculated yet"
    : status.state === "idle"
      ? `${SYNC_STATE_LABEL.idle} ${formatRelative(status.last_calculated_at, "en")}`
      : isRunning && status.progress
        ? `${SYNC_STATE_LABEL.running}… ${status.progress.percent}%`
        : SYNC_STATE_LABEL[status.state];

  const tooltip =
    status.error ??
    (status.last_calculated_at ? `Last calculated ${formatDateTime(status.last_calculated_at)}` : undefined);

  return (
    <div className={cn("flex h-9 items-center gap-2 px-2 text-xs text-muted-foreground", className)} title={tooltip}>
      {isRunning ? (
        <CircleNotchIcon weight="bold" className={cn("size-3.5 shrink-0 animate-spin", TONE_TEXT.info)} />
      ) : (
        <span
          className={cn(
            "size-1.5 shrink-0 rounded-full",
            neverCalculated ? TONE_BG.neutral : SYNC_STATE_BG[status.state],
            status.state === "queued" && "animate-pulse",
          )}
        />
      )}
      <span className="whitespace-nowrap">{text}</span>
      {isRunning && status.progress && (
        <span className="h-1 w-16 overflow-hidden rounded-full bg-border">
          <span
            className={cn("block h-full rounded-full transition-all duration-500", SYNC_STATE_BG.running)}
            style={{ width: `${status.progress.percent}%` }}
          />
        </span>
      )}
      {onRecalculate && (
        <Button
          variant="ghost"
          size="icon"
          className="size-6 rounded-lg text-muted-foreground hover:text-foreground"
          onClick={onRecalculate}
          disabled={isRecalculating || status.state === "queued" || isRunning}
          title="Recalculate now"
        >
          <ArrowsClockwiseIcon
            className={cn("size-3.5", (isRecalculating || status.state === "queued" || isRunning) && "animate-spin")}
          />
        </Button>
      )}
    </div>
  );
}

SyncStatusCard.Skeleton = function SyncStatusCardSkeleton({ className }: Pick<SyncStatusCardProps, "className">) {
  return (
    <div className={cn("flex h-9 items-center gap-2 px-2", className)}>
      <Skeleton className="size-1.5 rounded-full" />
      <Skeleton className="h-3 w-24" />
    </div>
  );
};
