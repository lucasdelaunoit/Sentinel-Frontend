import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface SectionSaveButtonProps {
  dirty: boolean;
  isPending: boolean;
  justSaved: boolean;
  onSave: () => void;
}

export default function SectionSaveButton({ dirty, isPending, justSaved, onSave }: SectionSaveButtonProps) {
  if (justSaved && !dirty) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2.5 py-1 text-[12px] font-medium text-emerald-700 border border-emerald-200">
        <Check className="size-3.5" strokeWidth={3} />
        Saved
      </span>
    );
  }

  return (
    <Button onClick={onSave} disabled={!dirty || isPending} className={cn("gap-1.5", !dirty && "opacity-60")}>
      {isPending ? "Saving…" : "Save"}
    </Button>
  );
}
