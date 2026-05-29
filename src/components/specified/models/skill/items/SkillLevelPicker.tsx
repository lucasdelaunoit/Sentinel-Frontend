import { cn } from "@/lib/utils";

export const SKILL_LEVEL_LABEL: Record<number, string> = {
  1: "Beginner",
  2: "Elementary",
  3: "Intermediate",
  4: "Advanced",
  5: "Expert",
};

const LEVEL_COLOR: Record<number, string> = {
  1: "bg-planned-foreground text-planned border-planned",
  2: "bg-danger-foreground text-danger border-danger",
  3: "bg-warning-foreground text-warning border-warning",
  4: "bg-info-foreground text-info border-info",
  5: "bg-success-foreground text-success border-success",
};

interface SkillLevelPickerProps {
  value: number | null;
  onChange: (level: number) => void;
  disabled?: boolean;
}

export default function SkillLevelPicker({ value, onChange, disabled = false }: SkillLevelPickerProps) {
  return (
    <div className="grid grid-cols-5 gap-1.5">
      {[1, 2, 3, 4, 5].map((lvl) => {
        const active = value === lvl;
        return (
          <button
            key={lvl}
            type="button"
            disabled={disabled}
            onClick={() => onChange(lvl)}
            className={cn(
              "flex flex-col items-center justify-center gap-0.5 rounded-lg border px-2 py-2.5 transition-all cursor-pointer",
              active
                ? LEVEL_COLOR[lvl] + " shadow-sm"
                : "border-border/60 bg-muted/30 text-muted-foreground hover:bg-muted/60 hover:text-foreground",
              disabled && "opacity-50 cursor-not-allowed",
            )}
          >
            <span className="text-[15px] font-bold tabular-nums leading-none">{lvl}</span>
            <span className="text-[10px] font-medium leading-none">{SKILL_LEVEL_LABEL[lvl]}</span>
          </button>
        );
      })}
    </div>
  );
}
