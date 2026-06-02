import { useMemo, useRef, useState } from "react";
import { Check, ChevronLeft, ChevronRight, Loader2, X, Zap } from "lucide-react";
import TopBar from "@/components/layout/topbar/TopBar";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import useGetPlanning from "@/api/planning/useGetPlanning";
import useSimulatePlanning from "@/api/planning/useSimulatePlanning";
import useApplyPlanningSimulation from "@/api/planning/useApplyPlanningSimulation";
import type { Half, PlanningMode, SimBlock } from "@/types/planning";
import { MONTH_NAMES } from "@/utils/planning/calendar";
import PlanningGantt from "@/components/specified/pages/planning/PlanningGantt";
import PlanningContextPanel from "@/components/specified/pages/planning/PlanningContextPanel";
import AddAbsenceSheet from "@/components/specified/pages/planning/sheets/AddAbsenceSheet";
import SimBlockDetailSheet from "@/components/specified/pages/planning/sheets/SimBlockDetailSheet";
import SaveStatusIndicator from "@/components/specified/pages/planning/badges/SaveStatusIndicator";
import PlanningStatStrip from "@/components/specified/pages/planning/PlanningStatStrip";
import { SIM_COLORS } from "@/utils/planning/theme";

export default function Planning() {
  const today = new Date();
  const [mode, setMode] = useState<PlanningMode>("view");
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth() + 1);
  const [simBlocks, setSimBlocks] = useState<SimBlock[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [showApplyConfirm, setShowApplyConfirm] = useState(false);
  const colorCounterRef = useRef(0);
  const applyMutation = useApplyPlanningSimulation();

  const month = `${viewYear}-${String(viewMonth).padStart(2, "0")}`;
  const planningQuery = useGetPlanning(month);
  const users = useMemo(() => planningQuery.data?.users ?? [], [planningQuery.data]);

  function navigateMonth(delta: number) {
    let m = viewMonth + delta;
    let y = viewYear;
    if (m > 12) {
      m = 1;
      y++;
    }
    if (m < 1) {
      m = 12;
      y--;
    }
    setViewMonth(m);
    setViewYear(y);
  }

  function addBlock(empId: string, startDate: string, startHalf: Half, endDate: string, endHalf: Half) {
    const colorIdx = colorCounterRef.current++ % SIM_COLORS.length;
    setSimBlocks((prev) => [
      ...prev,
      {
        id: `sim-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        userId: empId,
        startDate,
        startHalf,
        endDate,
        endHalf,
        colorIdx,
      },
    ]);
  }

  function removeBlock(id: string) {
    setSimBlocks((prev) => prev.filter((b) => b.id !== id));
    if (selectedBlockId === id) setSelectedBlockId(null);
  }

  function clearAll() {
    setSimBlocks([]);
    setSelectedBlockId(null);
  }

  function discardSimulation() {
    clearAll();
    setMode("view");
  }

  function confirmApplySimulation() {
    applyMutation.mutate(
      { absences: simAbsences },
      {
        onSuccess: () => {
          setShowApplyConfirm(false);
          clearAll();
          setMode("view");
        },
      },
    );
  }

  const simAbsences = useMemo(
    () =>
      simBlocks.map((b) => ({
        user_id: b.userId,
        start_date: b.startDate,
        start_half: b.startHalf,
        end_date: b.endDate,
        end_half: b.endHalf,
      })),
    [simBlocks],
  );

  const allBlocksValid = simBlocks.every((b) => b.endDate >= b.startDate);
  const simulation = useSimulatePlanning(simAbsences, allBlocksValid);

  const selectedBlock = simBlocks.find((b) => b.id === selectedBlockId);
  const selectedUser = selectedBlock ? users.find((u) => u.id === selectedBlock.userId) : undefined;

  return (
    <>
      <TopBar
        title="Team Planning"
        breadcrumb="Planning"
        actions={
          <div className="flex items-center gap-3">
            {mode === "simulate" && simBlocks.length > 0 && (
              <SaveStatusIndicator status={simulation.status} className="mr-1" />
            )}

            {mode === "view" ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setMode("simulate")}
                className="gap-1.5 rounded-xl h-8 px-3.5 text-[12px] font-semibold"
              >
                <Zap className="size-3.5" />
                Start simulation
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={discardSimulation}
                  className="gap-1.5 rounded-xl h-8 px-3 text-[12px] font-semibold text-muted-foreground hover:text-destructive-foreground hover:bg-destructive"
                >
                  <X className="size-3.5" />
                  Discard
                </Button>
                <Button
                  size="sm"
                  onClick={() => setShowApplyConfirm(true)}
                  disabled={simBlocks.length === 0 || !allBlocksValid || simulation.status === "pending"}
                  className="gap-1.5 rounded-xl h-8 px-3.5 text-[12px] font-semibold bg-planned hover:bg-planned/90 text-planned-foreground"
                >
                  <Check className="size-3.5" />
                  Save scenario
                  {simBlocks.length > 0 && (
                    <span className="flex size-4 items-center justify-center rounded-full bg-white/25 text-[9px] font-bold">
                      {simBlocks.length}
                    </span>
                  )}
                </Button>
              </div>
            )}

            <div className="flex items-center gap-1 text-muted-foreground">
              <button
                type="button"
                className="flex size-7 items-center justify-center rounded-lg hover:bg-muted/50 transition-colors"
                onClick={() => navigateMonth(-1)}
              >
                <ChevronLeft className="size-4" />
              </button>
              <span className="text-[13px] font-semibold text-foreground min-w-[104px] text-center">
                {MONTH_NAMES[viewMonth - 1]} {viewYear}
              </span>
              <button
                type="button"
                className="flex size-7 items-center justify-center rounded-lg hover:bg-muted/50 transition-colors"
                onClick={() => navigateMonth(1)}
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        }
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-5 page-enter">
        {mode === "simulate" && <PlanningStatStrip totals={simulation.data.totals} blockCount={simBlocks.length} />}
        <PlanningGantt
          mode={mode}
          users={users}
          simBlocks={simBlocks}
          viewYear={viewYear}
          viewMonth={viewMonth}
          setSimBlocks={setSimBlocks}
          selectedBlockId={selectedBlockId}
          setSelectedBlockId={setSelectedBlockId}
          onCreateBlock={addBlock}
          perUserImpact={simulation.data.per_user_impact}
          perDayLoad={simulation.data.per_day_load}
        />

        <div>
          <PlanningContextPanel
            layout="below"
            mode={mode}
            users={users}
            simBlocks={simBlocks}
            viewYear={viewYear}
            viewMonth={viewMonth}
            onOpenAddSheet={() => setShowAddSheet(true)}
            onSelectBlock={setSelectedBlockId}
            onRemoveBlock={removeBlock}
            onClearAll={clearAll}
            combined={simulation.data}
          />
        </div>
      </div>

      {selectedBlock && selectedUser && (
        <SimBlockDetailSheet
          block={selectedBlock}
          user={selectedUser}
          onClose={() => setSelectedBlockId(null)}
          onDelete={() => removeBlock(selectedBlock.id)}
        />
      )}

      <AddAbsenceSheet
        users={users}
        viewYear={viewYear}
        viewMonth={viewMonth}
        open={showAddSheet}
        onClose={() => setShowAddSheet(false)}
        onAdd={addBlock}
      />

      <AlertDialog open={showApplyConfirm} onOpenChange={setShowApplyConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Save this scenario?</AlertDialogTitle>
            <AlertDialogDescription>
              {simBlocks.length} absence{simBlocks.length === 1 ? "" : "s"} will be created as planned leave. This exits
              simulation mode.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={applyMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                confirmApplySimulation();
              }}
              disabled={applyMutation.isPending}
              className={cn("bg-planned hover:bg-planned/90 text-planned-foreground gap-1.5")}
            >
              {applyMutation.isPending ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
              Save scenario
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
