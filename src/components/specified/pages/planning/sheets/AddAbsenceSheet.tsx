import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import DatePicker from "@/components/ui/date-picker";
import { cn } from "@/lib/utils";
import ComposedSheet from "@/components/common/sheets/ComposedSheet";
import UserAvatar from "@/components/specified/models/user/avatars/UserAvatar.tsx";
import { useClosedDates } from "@/hooks/useClosedDates";
import { getDayOfWeekForDay, getDaysInMonth, getFirstDayOfWeek, makeDateStr } from "@/utils/planning/calendar";

interface AddAbsenceSheetProps {
  users: PlanningUser[];
  viewYear: number;
  viewMonth: number;
  open: boolean;
  onClose: () => void;
  onAdd: (empId: string, startDate: string, startHalf: Half, endDate: string, endHalf: Half) => void;
}

export default function AddAbsenceSheet({ users, viewYear, viewMonth, open, onClose, onAdd }: AddAbsenceSheetProps) {
  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const { isClosedDate } = useClosedDates();
  const viewMonthDate = new Date(viewYear, viewMonth - 1, 1);

  // Future-only: absences can't be simulated on today or in the past.
  const today = new Date();
  const todayStr = makeDateStr(today.getFullYear(), today.getMonth() + 1, today.getDate());
  const tomorrow = new Date(today);
  tomorrow.setHours(0, 0, 0, 0);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const disabledDates = [isClosedDate, { before: tomorrow }];

  function nextWorkingDay(from: number): number {
    const firstDayOfWeek = getFirstDayOfWeek(viewYear, viewMonth);
    let d = from;
    while (d <= daysInMonth) {
      const dow = getDayOfWeekForDay(d, firstDayOfWeek);
      if (dow !== 0 && dow !== 6) return d;
      d++;
    }
    return from;
  }

  const defaultStart = nextWorkingDay(Math.min(new Date().getDate() + 1, daysInMonth));
  const defaultEnd = Math.min(defaultStart + 4, daysInMonth);

  const [selectedEmpId, setSelectedEmpId] = useState(users[0]?.id ?? "");
  const [startDate, setStartDate] = useState(makeDateStr(viewYear, viewMonth, defaultStart));
  const [startHalf, setStartHalf] = useState<Half>(0);
  const [endDate, setEndDate] = useState(makeDateStr(viewYear, viewMonth, defaultEnd));
  const [endHalf, setEndHalf] = useState<Half>(1);

  const isValid = endDate >= startDate && selectedEmpId !== "" && startDate > todayStr;

  const durationLabel = useMemo(() => {
    if (!isValid) return "Invalid range";
    const days =
      Math.round((new Date(endDate + "T12:00:00").getTime() - new Date(startDate + "T12:00:00").getTime()) / 86400000) +
      1;
    const halves = days * 2 - startHalf - (1 - endHalf);
    if (halves <= 0) return "Invalid range";
    if (halves === 1) return "½ day";
    if (halves === 2) return "1 day";
    return `${halves / 2} days`;
  }, [startDate, startHalf, endDate, endHalf, isValid]);

  function handleAdd() {
    if (!isValid) return;
    onAdd(selectedEmpId, startDate, startHalf, endDate, endHalf);
    onClose();
  }

  return (
    <ComposedSheet
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
      title="Add Absence"
      description="Simulate a future team absence"
      maxWidth="sm:max-w-[420px]"
      footer={
        <>
          <Button variant="outline" onClick={onClose} className="flex-1 rounded-xl h-9 text-[12px]">
            Cancel
          </Button>
          <Button onClick={handleAdd} disabled={!isValid} className="flex-1 rounded-xl h-9 text-[12px] gap-1.5">
            <Plus className="size-3.5" /> Add block
          </Button>
        </>
      }
    >
      <div className="space-y-2">
        <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Employee</label>
        <div className="rounded-xl border border-border overflow-hidden divide-y divide-border/40 max-h-48 overflow-y-auto">
          {users.map((emp) => (
            <button
              key={emp.id}
              type="button"
              className={cn(
                "w-full flex items-center gap-2.5 px-4 py-2.5 text-left transition-colors",
                selectedEmpId === emp.id ? "bg-primary/5 border-l-2 border-primary" : "hover:bg-muted/40",
              )}
              onClick={() => setSelectedEmpId(emp.id)}
            >
              <UserAvatar firstname={emp.firstname} lastname={emp.lastname} variant={emp.status} />
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-medium text-foreground truncate">
                  {emp.firstname} {emp.lastname}
                </p>
                <p className="text-[10px] text-muted-foreground">{emp.department?.name ?? emp.title}</p>
              </div>
              {selectedEmpId === emp.id && <div className="size-1.5 rounded-full bg-primary shrink-0" />}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <DateField
          label="Start date"
          date={startDate}
          half={startHalf}
          onDateChange={setStartDate}
          onHalfChange={setStartHalf}
          disabled={disabledDates}
          defaultMonth={viewMonthDate}
        />
        <DateField
          label="End date"
          date={endDate}
          half={endHalf}
          onDateChange={setEndDate}
          onHalfChange={setEndHalf}
          disabled={disabledDates}
          defaultMonth={viewMonthDate}
        />
      </div>

      <div
        className={cn(
          "rounded-xl border-2 border-dashed px-4 py-3 flex items-center justify-between",
          isValid ? "border-planned/40 bg-planned/5" : "border-danger/40 bg-danger/10",
        )}
      >
        <span className="text-[11px] text-muted-foreground">Duration</span>
        <span className={cn("text-[13px] font-bold", isValid ? "text-planned" : "text-destructive-foreground")}>
          {durationLabel}
        </span>
      </div>

      {!isValid && endDate < startDate && (
        <p className="text-[11px] text-destructive-foreground">End date must be on or after start date.</p>
      )}
      {!isValid && startDate <= todayStr && endDate >= startDate && (
        <p className="text-[11px] text-destructive-foreground">Absences can only be simulated in the future.</p>
      )}
    </ComposedSheet>
  );
}

interface DateFieldProps {
  label: string;
  date: string;
  half: Half;
  onDateChange: (v: string) => void;
  onHalfChange: (v: Half) => void;
  disabled?: import("react-day-picker").Matcher | import("react-day-picker").Matcher[];
  defaultMonth?: Date;
}

function DateField({ label, date, half, onDateChange, onHalfChange, disabled, defaultMonth }: DateFieldProps) {
  return (
    <div className="space-y-2">
      <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{label}</label>
      <DatePicker value={date} onChange={onDateChange} disabled={disabled} defaultMonth={defaultMonth} />
      <div className="flex rounded-xl border border-border overflow-hidden">
        {(["AM", "PM"] as const).map((label, idx) => {
          const value = idx as Half;
          const active = half === value;
          return (
            <button
              key={label}
              type="button"
              onClick={() => onHalfChange(value)}
              className={cn(
                "flex-1 py-1.5 text-[11px] font-semibold transition-colors",
                active ? "bg-primary text-primary-foreground" : "bg-muted/20 text-muted-foreground hover:bg-muted/40",
              )}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
