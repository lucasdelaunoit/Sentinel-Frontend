import { Field, FieldLabel, FieldDescription } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface DepartmentPickerProps {
  departments: Department[];
  isLoading: boolean;
  value: number | null;
  onChange: (departmentId: number | null) => void;
  description?: string;
}

/** Single-select department pill group with loading/empty states. Shared by the create- and
 *  edit-user sheets. Clicking the active pill (or "Clear") deselects. */
export default function DepartmentPicker({
  departments,
  isLoading,
  value,
  onChange,
  description = "Optional — used to group employees and target rules",
}: DepartmentPickerProps) {
  return (
    <Field>
      <div className="flex items-center justify-between mb-1">
        <FieldLabel>Department</FieldLabel>
        {value != null && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-[11px] text-muted-foreground hover:text-foreground cursor-pointer"
          >
            Clear
          </button>
        )}
      </div>
      {isLoading ? (
        <div className="flex flex-wrap gap-1.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-24 rounded-full" />
          ))}
        </div>
      ) : departments.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/60 px-4 py-3 text-[12px] text-muted-foreground">
          No departments yet. Create one in Settings.
        </div>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {departments.map((d) => {
            const active = value === d.id;
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => onChange(active ? null : d.id)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-medium transition-colors cursor-pointer",
                  active
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : "border-border/60 bg-card text-foreground/70 hover:bg-muted/50 hover:text-foreground",
                )}
              >
                {d.name}
                {typeof d.users_count === "number" && (
                  <span
                    className={cn("text-[10px] tabular-nums", active ? "text-primary/70" : "text-muted-foreground/70")}
                  >
                    {d.users_count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
      <FieldDescription>{description}</FieldDescription>
    </Field>
  );
}
