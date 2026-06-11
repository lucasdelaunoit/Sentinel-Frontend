import { useState } from "react";
import { CheckIcon, ClockClockwiseIcon } from "@phosphor-icons/react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CalendarImpactAffected } from "@/api/settings/calendar/useCalendarImpactPreview";

type Decision = "recount" | "keep";

interface CalendarImpactDialogProps {
  open: boolean;
  affected: CalendarImpactAffected[];
  onConfirm: (freezeAbsenceIds: number[]) => void;
  onCancel: () => void;
  isApplying?: boolean;
}

function dayLabel(n: number): string {
  return `${n}d`;
}

export default function CalendarImpactDialog({
  open,
  affected,
  onConfirm,
  onCancel,
  isApplying = false,
}: CalendarImpactDialogProps) {
  const [decisions, setDecisions] = useState<Record<number, Decision>>({});

  // Default every affected absence to "recount" (follow the new calendar) whenever the set changes.
  // Render-phase reset (no effect) — React bails out the extra render of this same component.
  const affectedKey = affected.map((a) => a.absence_id).join(",");
  const [syncedKey, setSyncedKey] = useState<string | null>(null);
  if (syncedKey !== affectedKey) {
    setSyncedKey(affectedKey);
    setDecisions(Object.fromEntries(affected.map((a) => [a.absence_id, "recount" as Decision])));
  }

  function setAll(decision: Decision) {
    setDecisions(Object.fromEntries(affected.map((a) => [a.absence_id, decision])));
  }

  function setOne(id: number, decision: Decision) {
    setDecisions((prev) => ({ ...prev, [id]: decision }));
  }

  function handleApply() {
    const freezeIds = affected.filter((a) => decisions[a.absence_id] === "keep").map((a) => a.absence_id);
    onConfirm(freezeIds);
  }

  const keepCount = affected.filter((a) => decisions[a.absence_id] === "keep").length;

  return (
    <AlertDialog open={open} onOpenChange={(v) => !v && !isApplying && onCancel()}>
      <AlertDialogContent className="max-w-[560px]">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <ClockClockwiseIcon className="size-4 text-warning" />
            {affected.length} future absence{affected.length === 1 ? "" : "s"} affected
          </AlertDialogTitle>
          <AlertDialogDescription>
            This change alters the working-day count of upcoming leave. Choose what happens to each — <b>Recount</b> to
            follow the new calendar, or <b>Keep</b> to freeze its current count.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {keepCount} kept · {affected.length - keepCount} recounted
          </span>
          <div className="flex items-center gap-1.5">
            <Button variant="outline" size="sm" className="h-7 px-2.5 text-[11px]" onClick={() => setAll("recount")}>
              All recount
            </Button>
            <Button variant="outline" size="sm" className="h-7 px-2.5 text-[11px]" onClick={() => setAll("keep")}>
              All keep
            </Button>
          </div>
        </div>

        <div className="max-h-72 overflow-y-auto rounded-xl border border-border/60 divide-y divide-border/40">
          {affected.map((a) => {
            const decision = decisions[a.absence_id] ?? "recount";
            return (
              <div key={a.absence_id} className="flex items-center gap-3 px-3.5 py-2.5">
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] font-semibold text-foreground truncate">{a.user_name}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {a.start_date} → {a.end_date}
                  </p>
                </div>

                <div className="flex items-center gap-1 text-[11px] font-bold tabular-nums shrink-0">
                  <span className="text-muted-foreground">{dayLabel(a.before_days)}</span>
                  <span className="text-muted-foreground/40">→</span>
                  <span className={cn(decision === "keep" ? "text-muted-foreground line-through" : "text-foreground")}>
                    {dayLabel(a.after_days)}
                  </span>
                </div>

                <div className="flex rounded-lg border border-border/60 overflow-hidden shrink-0">
                  {(["recount", "keep"] as const).map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setOne(a.absence_id, opt)}
                      className={cn(
                        "px-2.5 py-1 text-[10px] font-semibold capitalize transition-colors",
                        decision === opt
                          ? opt === "keep"
                            ? "bg-warning/15 text-warning"
                            : "bg-primary text-primary-foreground"
                          : "bg-background text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <AlertDialogFooter>
          <Button variant="ghost" onClick={onCancel} disabled={isApplying} className="rounded-xl">
            Cancel
          </Button>
          <Button onClick={handleApply} loading={isApplying} className="rounded-xl gap-1.5">
            {!isApplying && <CheckIcon className="size-3.5" />}
            Apply change
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
