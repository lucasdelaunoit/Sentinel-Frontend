import { Button } from "@/components/ui/button";
import { CheckIcon } from "@phosphor-icons/react";
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
        <CheckIcon className="size-3.5" weight="bold" />
        Saved
      </span>
    );
  }

  return (
    <Button onClick={onSave} disabled={!dirty} loading={isPending} className={cn("gap-1.5", !dirty && "opacity-60")}>
      {isPending ? "Saving…" : "Save"}
    </Button>
  );
}
