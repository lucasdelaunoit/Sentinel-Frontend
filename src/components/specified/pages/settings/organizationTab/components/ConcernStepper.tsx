import { cn } from "@/lib/utils";

const CONCERN_STEPS: { value: number; label: string; short: string }[] = [
  { value: 0, label: "Ignore", short: "Don't factor this in" },
  { value: 25, label: "Minor", short: "Mention, low priority" },
  { value: 50, label: "Moderate", short: "Standard concern" },
  { value: 75, label: "Major", short: "Push the score noticeably" },
  { value: 100, label: "Critical", short: "Dominant concern" },
];

function nearestStep(value: number): number {
  return CONCERN_STEPS.reduce(
    (best, s) => (Math.abs(s.value - value) < Math.abs(best - value) ? s.value : best),
    CONCERN_STEPS[0].value,
  );
}

type ConcernStepperProps = {
  title: string;
  question: string;
  value: number;
  total: number;
  dot: string;
  onChange: (v: number) => void;
};

export default function ConcernStepper({ title, question, value, total, dot, onChange }: ConcernStepperProps) {
  const pct = total === 0 ? 0 : Math.round((value / total) * 100);
  const current = nearestStep(value);

  return (
    <div className="rounded-xl border border-border p-4">
      <div className="flex items-start gap-2.5 mb-4">
        <span className={cn("mt-1.5 size-2 rounded-full shrink-0", dot)} />
        <div className="flex-1">
          <p className="text-[13px] font-semibold text-foreground">{title}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">{question}</p>
        </div>
        <div className="text-right shrink-0">
          <div className="text-[13px] font-semibold text-foreground tabular-nums">{pct}%</div>
          <div className="text-[10px] text-muted-foreground">of total</div>
        </div>
      </div>
      <div className="grid grid-cols-5 gap-1">
        {CONCERN_STEPS.map((s) => {
          const active = current === s.value;
          return (
            <button
              key={s.value}
              type="button"
              onClick={() => onChange(s.value)}
              className={cn(
                "rounded-lg border px-1 py-1.5 text-center transition-all cursor-pointer",
                active
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-muted/20 border-border/60 text-muted-foreground hover:bg-muted/50 hover:text-foreground",
              )}
              title={s.short}
            >
              <div className="text-[11px] font-semibold leading-tight">{s.label}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
