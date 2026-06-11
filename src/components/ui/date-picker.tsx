import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "@phosphor-icons/react";
import type { Matcher } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface DatePickerProps {
  /** ISO date string "YYYY-MM-DD". */
  value?: string;
  onChange: (value: string) => void;
  /** react-day-picker matcher(s) for non-selectable days (e.g. weekends / holidays). */
  disabled?: Matcher | Matcher[];
  placeholder?: string;
  className?: string;
  ariaInvalid?: boolean;
  /** Month to open on when no value is set. */
  defaultMonth?: Date;
}

/** Parse "YYYY-MM-DD" into a local Date (no timezone shift). */
function parseDate(value?: string): Date | undefined {
  if (!value) return undefined;
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) return undefined;
  return new Date(y, m - 1, d);
}

export default function DatePicker({
  value,
  onChange,
  disabled,
  placeholder = "Pick a date",
  className,
  ariaInvalid,
  defaultMonth,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const selected = parseDate(value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          aria-invalid={ariaInvalid}
          className={cn(
            "w-full justify-start gap-2 text-left font-normal rounded-xl",
            !selected && "text-muted-foreground",
            className,
          )}
        >
          <CalendarIcon className="size-4 shrink-0" />
          {selected ? format(selected, "PP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          defaultMonth={selected ?? defaultMonth}
          disabled={disabled}
          onSelect={(date) => {
            if (!date) return;
            onChange(format(date, "yyyy-MM-dd"));
            setOpen(false);
          }}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  );
}
